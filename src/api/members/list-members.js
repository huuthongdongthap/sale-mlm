/**
 * Member API — GET /: list members with filtering and pagination
 */

const { getStore } = require('../../models/member');
const { logPIIAccessForMember } = require('./pii-logger');

function listMembers(req, res) {
  try {
    const members = getStore();
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
}

module.exports = { listMembers };