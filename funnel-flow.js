import crypto from 'node:crypto';

const salt = '368fbc01623e5dd884051ca97c7384bf';
const pwHash = crypto.pbkdf2Sync('admin123', salt, 600000, 64, 'sha512').toString('hex');

const member = {
  id: 'u_001',
  name: 'Admin Droppii',
  email: 'admin@droppii.com',
  role: 'admin',
  tier: 4,
  _passwordHash: pwHash,
};

process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
process.env.JWT_SECRET = 'testsecret';
process.env.ALLOWED_ORIGIN = 'http://localhost:3001';
process.env.PASSWORD_SALT = salt;
// auth.js looks for m.passwordHash or m.member.passwordHash
process.env.MEMBERS_DB = JSON.stringify([{ passwordHash: pwHash, member }]);

import { spawn } from 'node:child_process';

const server = spawn('node', ['src/server.js'], {
  cwd: '/Users/mac/mekong-cli/SALE MLM',
  stdio: ['inherit', 'pipe', 'pipe'],
});

server.stdout.on('data', (d) => process.stdout.write(d));
server.stderr.on('data', (d) => process.stderr.write(d));

server.on('exit', (code) => {
  console.log('Server exited with code', code);
});

// Wrapper approach: run the walkthrough after server starts
setTimeout(async () => {
  try {
    const mod = await import('./tests/funnel-flow-walkthrough.js');
    await mod.runWalkthrough();
  } catch (err) {
    console.error('Walkthrough script not found, run manually.');
  }
}, 4000);
