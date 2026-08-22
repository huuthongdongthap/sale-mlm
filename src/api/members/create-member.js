/**
 * Member API — POST /: create member
 */

const { Member, getStore } = require('../../models/member');
const referral = require('../../features/referral');
const { logPIIAccessForMember } = require('./pii-logger');

function createMember(req, res) {
  try {
    const members = getStore();
    const member = new Member(req.body);
    members.push(member);
    logPIIAccessForMember('create', member, req.user.id, req.user.role, req);
    // Auto-activate any pending referral where this new member is the referee
    const pendingReferrals = referral.referrals.filter(
      r => r.newMemberId === member.id && r.status === 'pending'
    );
    pendingReferrals.forEach(r => referral.activateReferral(r.id));
    res.status(201).json({
      success: true,
      message: 'Thanh vien da duoc tao thanh cong',
      data: member.toJSON()
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      error: 'Loi he thong khi tao thanh vien',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}

module.exports = { createMember };