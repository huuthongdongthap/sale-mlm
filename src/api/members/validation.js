/**
 * Member API — validation middleware
 */

const { Member } = require('../../models/member');

function validateMemberData(req, res, next) {
  const { name, email, phone, role, tier } = req.body;

  if (req.method === 'POST' && !name) {
    return res.status(400).json({
      error: 'Ten thanh vien la bat buoc',
      code: 'MISSING_REQUIRED_FIELD',
      field: 'name'
    });
  }

  if (name && typeof name === 'string' && !name.trim()) {
    return res.status(400).json({
      error: 'Ten thanh vien khong duoc rong',
      code: 'EMPTY_NAME',
      field: 'name'
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: 'Dia chi email khong hop le',
      code: 'INVALID_EMAIL_FORMAT',
      field: 'email'
    });
  }

  if (phone && !/^\+84\d{9,10}$/.test(phone)) {
    return res.status(400).json({
      error: 'So dien thoai khong hop le (dinh dang: +84xxxxxxxxx)',
      code: 'INVALID_PHONE_FORMAT',
      field: 'phone'
    });
  }

  if (role) {
    const testMember = new Member();
    if (!testMember.isValidRole(role)) {
      return res.status(400).json({
        error: 'Vai tro khong hop le',
        code: 'INVALID_ROLE',
        field: 'role'
      });
    }
  }

  if (tier && (typeof tier !== 'number' || tier < 1 || tier > 3)) {
    return res.status(400).json({
      error: 'Cap do phai tu 1-3',
      code: 'INVALID_TIER',
      field: 'tier'
    });
  }

  next();
}

module.exports = { validateMemberData };