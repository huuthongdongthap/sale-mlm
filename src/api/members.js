const express = require('express');
const router = express.Router();
const { Member, getStore, initStore, ROLES } = require('../models/member');
const { requireRole, requireAuth, requireAdmin, requireCoreLeader } = require('../middleware/requireRole');
const { logPIIAccess, extractPIIFields } = require('../utils/auditLog');
const referral = require('../features/referral');

// Initialize the store
initStore();

// Use the shared store from the model
const members = getStore();

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

function logPIIAccessForMember(action, member, userId, userRole, req) {
  const piiFields = [];
  if (action === 'read' || action === 'update' || action === 'delete') {
    piiFields.push('name', 'email', 'phone');
  } else if (action === 'create') {
    piiFields.push(...extractPIIFields(req.body));
  }
  if (piiFields.length > 0) {
    logPIIAccess({
      action,
      resource: 'member',
      resourceId: member.id,
      piiFields,
      userId,
      userRole,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
}

router.post('/', requireRole('PSN Leader'), validateMemberData, (req, res) => {
  try {
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
});

router.get('/', requireAuth, (req, res) => {
  try {
    const { tier, status, role, limit = '50', offset = '0', includePII = 'false' } = req.query;
    let result = [...members];

    if (tier) {
      const tierNum = parseInt(tier);
      if (isNaN(tierNum)) {
        return res.status(400).json({
          error: 'Tham so tier phai la so',
          code: 'INVALID_QUERY_PARAM',
          field: 'tier'
        });
      }
      result = result.filter(m => m.tier === tierNum);
    }

    if (status) result = result.filter(m => m.status === status);
    if (role) result = result.filter(m => m.role === role);

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    if (isNaN(limitNum) || isNaN(offsetNum) || limitNum < 0 || offsetNum < 0) {
      return res.status(400).json({
        error: 'Tham so phan trang khong hop le',
        code: 'INVALID_PAGINATION_PARAMS'
      });
    }

    const total = result.length;
    result = result.slice(offsetNum, offsetNum + limitNum);

    const shouldIncludePII = includePII === 'true' &&
      (req.user.role === 'Admin' || req.user.role === 'Core Leader');

    const responseData = shouldIncludePII
      ? result.map(m => { logPIIAccessForMember('read', m, req.user.id, req.user.role, req); return m.toJSON(); })
      : result.map(m => m.toSafeJSON());

    res.json({
      success: true,
      data: responseData,
      pagination: { total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < total }
    });
  } catch (error) {
    console.error('Error listing members:', error);
    res.status(500).json({
      error: 'Loi he thong khi lay danh sach thanh vien',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

router.get('/:id', requireAuth, (req, res) => {
  try {
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
});

router.patch('/:id', requireAuth, validateMemberData, (req, res) => {
  try {
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
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
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
});

module.exports = router;
