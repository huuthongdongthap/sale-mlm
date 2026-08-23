/**
 * Member API — POST /: create member
 */

const { Member, getStore } = require('../../models/member');
const referral = require('../../features/referral');
const { logPIIAccessForMember } = require('./pii-logger');

async function createMember(req, res) {
  try {
    const members = getStore();
    const member = new Member(req.body);
    members.push(member);
    // Persist through the DB adapter when one is bound so downstream
    // consumers reading the database (PSN metrics, analytics) see the
    // new member. In-memory store remains the no-DB fallback.
    if (global.db && typeof global.db.createMember === 'function') {
      await global.db.createMember({
        id: member.id,
        name: member.name,
        email: member.getEmail() || '',
        email_encrypted: member._encryptedEmail || '',
        phone_encrypted: member._encryptedPhone || '',
        password_hash: member.passwordHash || '',
        role: member.role,
        tier: member.tier,
        psn_id: member.psnId
      });
    }
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