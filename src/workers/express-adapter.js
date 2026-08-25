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

const { IncomingMessage } = require('node:http');
const { Writable } = require('node:stream');
const { URLSearchParams } = require('node:url');

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
 *
 * @param {Function} expressApp — The Express app handler (req, res, next)
 * @param {Object} opts — Options
 * @param {boolean} opts.preserveBody — Keep raw body for middleware that needs it
 * @returns {Function} Hono-compatible handler
 */
function createExpressHandler(expressApp, opts = {}) {
  return async function (c) {
    const rawReq = c.req.raw;
    const method = rawReq.method;
    const url = new URL(rawReq.url);
    const path = url.pathname;
    const query = url.search.slice(1); // remove leading '?'
    const headers = Object.fromEntries(rawReq.headers.entries());

    // Read body once
    const bodyBuffer = await readBody(rawReq);
    const bodyText = bodyBuffer.toString('utf8') || undefined;

    // Build a minimal IncomingMessage-like object for Express
    const req = new IncomingMessage();
    req.method = method;
    req.url = path + (query ? '?' + query : '');
    req.headers = headers;
    req.rawHeaders = Object.entries(headers).flat();
    req.httpVersion = '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;
    req.connection = { remoteAddress: headers['cf-connecting-ip'] || '127.0.0.1' };
    req.socket = { remoteAddress: headers['cf-connecting-ip'] || '127.0.0.1' };

    // Parse query string for req.query (Express standard)
    req.query = Object.fromEntries(new URLSearchParams(query).entries());

    // Parse JSON body for req.body
    let body = undefined;
    if (bodyText) {
      const ct = headers['content-type'] || '';
      if (ct.includes('application/json')) {
        try {
          body = JSON.parse(bodyText);
        } catch {
          body = bodyText;
        }
      } else if (ct.includes('application/x-www-form-urlencoded')) {
        body = Object.fromEntries(new URLSearchParams(bodyText).entries());
      } else {
        body = bodyText;
      }
    }
    req.body = body;

    // Express needs req.ip for rate limiting etc.
    req.ip = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || '127.0.0.1';

    // Build a response object that captures the Express output
    let capturedStatus = 200;
    let capturedBody = '';
    let capturedHeaders = {};

    const res = new Writable({
      write(chunk, encoding, callback) {
        capturedBody += chunk.toString();
        callback();
      },
    });

    // Express-compatible response methods
    res.statusCode = 200;
    res.status = function (code) {
      this.statusCode = code;
      capturedStatus = code;
      return this;
    };
    res.setHeader = function (name, value) {
      capturedHeaders[name.toLowerCase()] = value;
      return this;
    };
    res.getHeader = function (name) {
      return capturedHeaders[name.toLowerCase()];
    };
    res.getHeaders = function () {
      return capturedHeaders;
    };
    res.removeHeader = function (name) {
      delete capturedHeaders[name.toLowerCase()];
      return this;
    };
    res.hasHeader = function (name) {
      return name.toLowerCase() in capturedHeaders;
    };
    res.json = function (obj) {
      this.setHeader('content-type', 'application/json');
      this.end(JSON.stringify(obj));
      return this;
    };
    res.send = function (body) {
      if (typeof body === 'object' && body !== null) {
        this.setHeader('content-type', 'application/json');
        this.end(JSON.stringify(body));
      } else {
        if (!this.getHeader('content-type')) {
          this.setHeader('content-type', 'text/html');
        }
        this.end(String(body));
      }
      return this;
    };
    res.redirect = function (url) {
      this.status(302).setHeader('location', url).end();
      return this;
    };

    // Run the Express app
    await new Promise((resolve, reject) => {
      const next = (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };
      try {
        expressApp(req, res, next);
      } catch (err) {
        reject(err);
      }
    });

    // Return Workers Response
    const responseHeaders = new Headers();
    Object.entries(capturedHeaders).forEach(([k, v]) => {
      if (v !== undefined) responseHeaders.set(k, v);
    });
    // Ensure CORS headers
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('access-control-allow-headers', 'Content-Type, Authorization');
    responseHeaders.set('x-content-type-options', 'nosniff');
    responseHeaders.set('x-frame-options', 'DENY');

    return new Response(capturedBody || '', {
      status: capturedStatus,
      headers: responseHeaders,
    });
  };
}

module.exports = { createExpressHandler, readBody };