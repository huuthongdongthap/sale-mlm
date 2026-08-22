/**
 * Member API — DELETE /:id: delete member (Admin only)
 */

const { getStore } = require('../../models/member');
const { logPIIAccessForMember } = require('./pii-logger');

function deleteMember(req, res) {
  try {
    const members = getStore();
    const memberIndex = members.findIndex(m => m.id === req.params.id);
    if (memberIndex === -1) {
      return res.status(404).json({
        error: 'Khong tim thay thanh vien',
        code: 'MEMBER_NOT_FOUND'
      });
    }

    const member = members[memberIndex];
    logPIIAccessForMember('delete', member, req.user.id, req.user.role, req);
    members.splice(memberIndex, 1);

    res.json({
      success: true,
      message: 'Thanh vien da duoc xoa thanh cong',
      data: { id: member.id }
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      error: 'Loi he thong khi xoa thanh vien',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}

module.exports = { deleteMember };