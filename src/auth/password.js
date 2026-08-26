/**
 * Shared PBKDF2 password hashing — single source of truth.
 *
 * Consumers:
 *   - src/api/auth.js (Node/Express) → hashPassword()
 *   - src/workers/index-native.js (Cloudflare Workers) → verifyWebCrypto()
 *
 * ITERATIONS is capped at 100,000 because the Workers side must use
 * WebCrypto (deriveBits), which rejects higher iteration counts. Both
 * surfaces MUST agree or login breaks on exactly one of them.
 */

const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function saltFromEnv() {
  const salt = process.env.PASSWORD_SALT;
  if (!salt) throw new Error('PASSWORD_SALT env var required');
  return salt;
}

/** Node-side hash (sync). Matches verifyWebCrypto() output for same inputs. */
function hashPassword(password) {
  return crypto.pbkdf2Sync(password, saltFromEnv(), ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
}

/**
 * Workers-side constant-time verification via WebCrypto deriveBits.
 * Returns { ok, error } — throws nothing so route handlers stay flat.
 */
async function verifyWebCrypto(password, expectedHash, passwordSalt) {
  try {
    if (!passwordSalt) throw new Error('PASSWORD_SALT env var required');
    const { subtle } = globalThis.crypto;
    const encoder = new TextEncoder();
    const key = await subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await subtle.deriveBits(
      { name: 'PBKDF2', salt: encoder.encode(passwordSalt), iterations: ITERATIONS, hash: 'SHA-512' },
      key,
      KEY_LENGTH * 8
    );
    const computed = Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    // Constant-time compare (timing-safe even though lengths are fixed)
    if (computed.length !== expectedHash.length) {
      return { ok: false };
    }
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    return { ok: diff === 0 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { ITERATIONS, KEY_LENGTH, DIGEST, hashPassword, verifyWebCrypto };
