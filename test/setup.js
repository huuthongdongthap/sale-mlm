/**
 * Jest setup - initialize test environment
 */

const crypto = require('crypto');
const { hashPassword } = require('../src/auth/password');

// Suppress console.error in tests unless needed
global.console.error = jest.fn();

// PASSWORD_SALT must exist before hashPassword() runs below (the canonical
// default is set with the other env vars further down; idempotent either way).
process.env.PASSWORD_SALT = process.env.PASSWORD_SALT || 'test-salt-change-in-production';

// Reset modules before each test
beforeEach(() => {
  jest.resetModules();
});

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test members with password hashes
const TEST_MEMBERS = [
  {
    member: {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@droppii.vn',
      phone: '+84901234567',
      role: 'Admin',
      tier: 3,
      psnId: 'psn-rising-dragon',
      energyScore: 10,
      status: 'active',
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    passwordHash: hashPassword('admin123')
  },
  {
    member: {
      id: 'pilot-001',
      name: 'Nguyễn Minh Tuấn',
      email: 'tuan@droppii.vn',
      phone: '+84901234568',
      role: 'PSN Leader',
      tier: 3,
      psnId: 'psn-rising-dragon',
      energyScore: 9,
      status: 'active',
      joinDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      buddyId: 'pilot-002'
    },
    passwordHash: hashPassword('password123')
  },
  {
    member: {
      id: 'pilot-002',
      name: 'Lê Thị Mai',
      email: 'mai@droppii.vn',
      phone: '+84902345678',
      role: 'Member',
      tier: 1,
      psnId: 'psn-rising-dragon',
      energyScore: 7,
      status: 'active',
      joinDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      buddyId: 'pilot-001'
    },
    passwordHash: hashPassword('password123')
  },
  {
    member: {
      id: 'pilot-003',
      name: 'Phạm Văn Đức',
      email: 'duc@droppii.vn',
      phone: '+84903456789',
      role: 'Member',
      tier: 1,
      psnId: 'psn-golden-star',
      energyScore: 6,
      status: 'training',
      joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    passwordHash: hashPassword('password123')
  },
  {
    member: {
      id: 'pilot-004',
      name: 'Hoàng Thị Lan',
      email: 'lan@droppii.vn',
      phone: '+84904567890',
      role: 'Member',
      tier: 2,
      psnId: 'psn-golden-star',
      energyScore: 5,
      status: 'active',
      joinDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    },
    passwordHash: hashPassword('password123')
  }
];

// Set environment variables for tests
process.env.MEMBERS_DB = JSON.stringify(TEST_MEMBERS);
process.env.PASSWORD_SALT = process.env.PASSWORD_SALT || 'test-salt-change-in-production';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-change-in-production';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32-bytes-long!!';
process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000,http://localhost:3001';
process.env.NODE_ENV = 'test';

console.log('🧪 Test environment initialized with', TEST_MEMBERS.length, 'members');
