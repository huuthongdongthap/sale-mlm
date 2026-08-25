const express = require('express');
const crypto = require('crypto');
const jwt = require('../auth/jwt');
const { Member } = require('../models/member');

const router = express.Router();

function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT;
  if (!salt) throw new Error('PASSWORD_SALT env var required');
  return crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512').toString('hex');
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc', code: 'MISSING_CREDENTIALS' });
  }
  const membersJson = process.env.MEMBERS_DB;
  if (!membersJson) {
    return res.status(503).json({ error: 'Chưa cấu hình database. Liên hệ admin.', code: 'NO_USER_DB' });
  }
  let members;
  try { members = JSON.parse(membersJson); } catch { members = []; }
  // Handle both array and object formats
  const membersArray = Array.isArray(members) ? members : Object.values(members);
  const user = membersArray.find(m => m.email === email || (m.member && m.member.email === email));
  if (!user) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng', code: 'INVALID_CREDENTIALS' });
  }
  const passwordHash = hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng', code: 'INVALID_CREDENTIALS' });
  }
  const member = new Member(user.member);
  member.lastLoginAt = new Date().toISOString();
  const orgId = member.orgId || (member.role === 'Admin' ? null : 'org-default');
  const token = jwt.sign({
    id: member.id, email: member.email,
    role: member.role, name: member.name, orgId
  });
  res.json({ success: true, token, user: member.toJSON(), message: 'Đăng nhập thành công' });
});

router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });
  try {
    const decoded = jwt.verify(token);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

router.get('/users', (req, res) => {
  const membersJson = process.env.MEMBERS_DB;
  if (!membersJson) return res.json([]);
  try {
    const members = JSON.parse(membersJson);
    res.json(members.map(u => ({ id: u.member.id, name: u.member.name, email: u.member.email, role: u.member.role, tier: u.member.tier })));
  } catch { res.json([]); }
});

module.exports = router;
