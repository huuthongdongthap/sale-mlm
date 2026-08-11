const crypto = require('crypto');

/**
 * PDPA-compliant AES-256-CBC encryption for PII data
 * Used for encrypting sensitive fields like phone and email in Droppii Training OS
 */

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required — refusing to start with insecure default');
}

// Ensure key is exactly 32 bytes for AES-256
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

/**
 * Encrypt sensitive data (PII fields)
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data as hex string with format: iv:ciphertext
 */
function encrypt(plaintext) {
  if (!plaintext) return null;

  const iv = crypto.randomBytes(16); // 128-bit IV for CBC
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Format: iv:ciphertext (all hex)
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data (PII fields)
 * @param {string} encryptedData - Encrypted data in format iv:ciphertext
 * @returns {string|null} Decrypted plaintext or null if invalid
 */
function decrypt(encryptedData) {
  if (!encryptedData) return null;

  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return null;

    const [ivHex, ciphertext] = parts;
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}

/**
 * Check if data appears to be encrypted (has our format)
 * @param {string} data - Data to check
 * @returns {boolean} True if data looks encrypted
 */
function isEncrypted(data) {
  if (!data || typeof data !== 'string') return false;

  const parts = data.split(':');
  return parts.length === 2 &&
         parts[0].length === 32 && // IV is 16 bytes = 32 hex chars
         parts[1].length > 0;      // Ciphertext exists
}

module.exports = {
  encrypt,
  decrypt,
  isEncrypted
};