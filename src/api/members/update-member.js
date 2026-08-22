/**
 * Member API — PATCH /:id: update member
 */

const { getStore } = require('../../models/member');
const { logPIIAccessForMember } = require('./pii-logger');

function updateMember(req, res) {
  try {
    const members = getStore();
    const member = members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        error: 'Khong tim thay thanh vien',
        code: 'MEMBER_NOT_FOUND'
      });
    }

    const isOwnProfile = req.user.id === member.id;
    const isAdmin = req.user.role === 'Admin';
    const isCoreLeader = req.user.role === 'Core Leader';

    if (!isOwnProfile && !isAdmin && !isCoreLeader) {
      return res.status(403).json({
        error: 'Khong co quyen chinh sua thanh vien nay',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const isLimitedSelfEdit = isOwnProfile && !isAdmin;
    const allowedFields = isLimitedSelfEdit
      ? ['name', 'email', 'phone', 'status', 'habitScore', 'energyScore']
      : Object.keys(req.body);

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.role && !isAdmin) {
      return res.status(403).json({
        error: 'Chi Admin moi co the thay doi vai tro',
        code: 'INSUFFICIENT_PERMISSIONS_ROLE_CHANGE'
      });
    }

    if (updateData.email) member.setEmail(updateData.email);
    if (updateData.phone) member.setPhone(updateData.phone);
    if (updateData.role) member.setRole(updateData.role);

    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'email' && key !== 'phone' && key !== 'role') {
        member[key] = value;
      }
    }

    logPIIAccessForMember('update', member, req.user.id, req.user.role, req);
    res.json({
      success: true,
      message: 'Thanh vien da duoc cap nhat thanh cong',
      data: member.toJSON()
    });
  } catch (error) {
    console.error('Error updating member:', error);
    if (error.message.includes('Invalid role')) {
      return res.status(400).json({
        error: error.message,
        code: 'INVALID_ROLE'
      });
    }
    res.status(500).json({
      error: 'Loi he thong khi cap nhat thanh vien',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}

module.exports = { updateMember };