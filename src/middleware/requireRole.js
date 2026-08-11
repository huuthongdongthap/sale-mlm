const jwt = require('../auth/jwt');

const ROLE_HIERARCHY = {
  'Member': 1,
  'PSN Leader': 2,
  'Core Leader': 3,
  'Admin': 4
};

function normalizeRole(role) {
  if (!role) return null;
  const lower = role.toLowerCase().replace(/_/g, ' ');
  for (const key of Object.keys(ROLE_HIERARCHY)) {
    if (key.toLowerCase() === lower) return key;
  }
  return role;
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

function requireRole(requiredRole) {
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Thiếu token xác thực', code: 'MISSING_AUTH_TOKEN' });
    }

    const payload = jwt.verify(token);
    if (!payload) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn', code: 'INVALID_TOKEN' });
    }

    const normalized = normalizeRole(payload.role);
    const userRoleLevel = ROLE_HIERARCHY[normalized];

    if (!userRoleLevel) {
      return res.status(403).json({
        error: 'Không có quyền truy cập chức năng này',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: payload.role
      });
    }

    const hasPermission = requiredRoles.some(role => userRoleLevel >= ROLE_HIERARCHY[role]);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Không có quyền truy cập chức năng này',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: payload.role
      });
    }

    req.user = payload;
    next();
  };
}

const requireAuth = requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']);
const requireAdmin = requireRole('Admin');
const requireCoreLeader = requireRole(['Core Leader', 'Admin']);
const requirePSNLeader = requireRole(['PSN Leader', 'Core Leader', 'Admin']);

module.exports = { requireRole, requireAuth, requireAdmin, requireCoreLeader, requirePSNLeader, ROLE_HIERARCHY, normalizeRole };
