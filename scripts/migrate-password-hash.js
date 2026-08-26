/**
 * Migration tool: regenerate seed-account password hashes at Web Crypto's
 * 100,000-iteration PBKDF2 cap so the Workers login path can verify them.
 *
 * Usage (secrets come from env/args — never commit them):
 *   PASSWORD_SALT=<salt> node scripts/migrate-password-hash.js <password>
 *
 * Prints the UPDATE statement to run via `wrangler d1 execute <db> --remote --command`.
 * Idempotent: same inputs produce the same hash, re-running is a no-op.
 */
const crypto = require('crypto');

const PASSWORD = process.argv[2];
if (!PASSWORD) {
  console.error('Usage: PASSWORD_SALT=<salt> node scripts/migrate-password-hash.js <password>');
  process.exit(1);
}
const SALT = process.env.PASSWORD_SALT;
if (!SALT) {
  console.error('PASSWORD_SALT env var required (must match the Workers secret)');
  process.exit(1);
}

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

const EMAILS = [
  'admin@droppii.vn',
  'core@droppii.vn',
  'psn@droppii.vn',
  'member@droppii.vn'
];

const hash = crypto.pbkdf2Sync(PASSWORD, SALT, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');

console.log('Generated hash (' + ITERATIONS + ' PBKDF2-' + DIGEST.toUpperCase() + ')');
console.log('\nSQL for remote D1:');
console.log('UPDATE members SET password_hash = \'' + hash + '\' WHERE email IN (\n  ' + EMAILS.map(e => "'" + e + "'").join(',\n  ') + '\n);');
