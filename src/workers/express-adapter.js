/**
 * Express req/res adapter for Cloudflare Workers.
 *
 * Bridges a Workers `Request` into the existing Express app so the ~40
 * Express routes in src/api/* keep serving production traffic without a
 * rewrite. Hono (ADR 004) provides the Workers-native routing layer; this
 * module is the shim that lets Hono hand each request to Express.
 *
 * Why not just run Express on Workers directly? Express's res.end relies on
 * a real HTTP socket to emit `finish`; a bare http.ServerResponse has no
 * socket, so the response never completes and handlers hang. We work
 * around that by wrapping res.end to capture the encoded body before it
 * reaches the socket layer, then returning it as a Workers Response.
 *
 * Only res.end is wrapped — res.json/res.status/res.setHeader are untouched,
 * because overriding them breaks Express's send→end→finish→next chain
 * (verified empirically: overriding res.json caused "Maximum call stack
 * size exceeded" via recursive res.setHeader).
 */

const http = require('http');
const express = require('express');

/**
 * Drain a Web ReadableStream (c.req.raw.body) into a Node Buffer.
 * Workers Request bodies are always a ReadableStream; never assume async
 * iteration works (it does not on the raw body object).
 */
async function readBody(raw) {
  if (!raw.body) return Buffer.alloc(0);
  const reader = raw.body.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

/**
 * Wrap an Express request handler so it can be invoked from a Hono context.
 * Returns an async function (c) => Response, where c is a Hono Context.
 *
 * The returned handler builds IncomingMessage/ServerResponse pairs, runs the
 * Express handler, and returns a Workers Response carrying the captured
 * status, headers, and body.
 */
function createExpressHandler(expressHandler, expressApp) {
  return async function (c) {
    const raw = c.req.raw;

    const req = new http.IncomingMessage();
    req.method = raw.method;
    req.url = raw.url;
    req.headers = {};
    for (const [key, value] of raw.headers.entries()) {
      req.headers[key] = value;
    }

    // Express's error middleware calls req.ip, which proxyaddr resolves through
    // req.socket.remoteAddress. A bare IncomingMessage has no socket, so that
    // read throws and the error middleware crashes the chain. Attach a stub
    // socket carrying the real client IP (Cloudflare passes it in
    // CF-Connecting-IP) so req.ip / forwarded-header parsing resolves.
    req.socket = req.socket || {};
    req.socket.remoteAddress =
      raw.headers.get('CF-Connecting-IP') ||
      raw.headers.get('X-Forwarded-For') ||
      '127.0.0.1';

    const body = await readBody(raw);
    req.push(body);
    req.push(null);

    const res = new http.ServerResponse(req);
    // Express's response prototype carries the json/status/setHeader methods
    // that every route in src/api/* depends on. Wire it up so the handler
    // sees a real Express response object.
    Object.setPrototypeOf(res, express.response);
    // Express reads settings off res.app (e.g. app.get('json escape') inside
    // res.json). c.app is the Hono app, not the Express app — pass the real
    // Express app so those lookups resolve.
    res.app = expressApp;

    let capturedBody = null;
    let capturedStatus = 200;
    let settled = false;
    const origEnd = res.end.bind(res);
    let resolveHandler;

    // Express completes a response by calling res.end, which in turn emits
    // `finish` on a real socket. A bare http.ServerResponse has no socket,
    // so the middleware chain never calls `next` and the handler promise
    // would hang forever. Resolve inside res.end instead — that is the
    // definitive signal that Express has produced its response.
    res.end = function (chunk, encoding, callback) {
      if (typeof chunk !== 'undefined' && chunk !== null) {
        capturedBody = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      }
      capturedStatus = res.statusCode;
      if (!settled) {
        settled = true;
        resolveHandler();
      }
      return origEnd(chunk, encoding, callback);
    };

    await new Promise((resolve) => {
      resolveHandler = resolve;
      expressHandler(req, res, () => {});
    });

    let headers = {};
    try {
      headers = res.getHeaders();
    } catch {
      // getHeaders throws if the response was never finalized; fall back to
      // an empty header set rather than crashing the request.
    }

    return new Response(capturedBody || '', {
      status: capturedStatus,
      headers,
    });
  };
}

module.exports = { createExpressHandler, readBody };