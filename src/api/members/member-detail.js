/**
 * Member API — GET /:id: get member by ID
 */

const { getStore } = require('../../models/member');
const { logPIIAccessForMember } = require('./pii-logger');

function getMember(req, res) {
  try {
    const members = getStore();
    const member = members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        error: 'Khong tim thay thanh vien',
        code: 'MEMBER_NOT_FOUND'
      });
    }

    const canViewPII = req.user.id === member.id ||
      req.user.role === 'Admin' ||
      req.user.role === 'Core Leader';

    if (!canViewPII) {
      return res.status(403).json({
        error: 'Khong co quyen xem thong tin chi tiet thanh vien nay',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    logPIIAccessForMember('read', member, req.user.id, req.user.role, req);
    res.json({ success: true, data: member.toJSON() });
  } catch (error) {
    console.error('Error getting member:', error);
    res.status(500).json({
      error: 'Loi he thong khi lay thong tin thanh vien',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}

module.exports = { getMember };