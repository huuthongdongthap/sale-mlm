const crypto = require('crypto');
const { encrypt, decrypt, isEncrypted } = require('../utils/encryption');

/**
 * Member model for Droppii Training OS
 * Represents users in the MLM training system with roles and hierarchy
 * Features PDPA-compliant PII encryption for phone and email fields
 */

/**
 * Available roles in the system with increasing authority:
 * - Member: Basic trainee in the system
 * - PSN Leader: Leads a Personal Sales Network team
 * - Core Leader: Manages multiple PSN teams
 * - Admin: Full system access and management
 */
const ROLES = ['Member', 'PSN Leader', 'Core Leader', 'Admin'];

// In-memory store for members (shared with API)
const memberStore = [];

function getStore() {
  return memberStore;
}

function initStore() {
  memberStore.push(...Member.createSeededMembers());
}

class Member {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';

    // Store encrypted PII fields
    this._encryptedEmail = data._encryptedEmail || null;
    this._encryptedPhone = data._encryptedPhone || null;

    this.passwordHash = data.passwordHash || null;
    this.role = data.role || 'Member';      // Member, PSN Leader, Core Leader, Admin
    this.tier = data.tier || 1;            // 1=Tân Binh, 2=Chiến Binh, 3=Chỉ Huy
    this.psnId = data.psnId || null;
    this.buddyId = data.buddyId || null;
    this.habitScore = data.habitScore || 0;
    this.joinDate = data.joinDate || new Date().toISOString();
    this.status = data.status || 'active'; // active, at_risk, graduated, inactive
    this.energyScore = data.energyScore || 5; // 1-10
    this.lastLoginAt = data.lastLoginAt || null;

    // Set initial values if provided as plain text (for backwards compatibility)
    if (data.email && !this._encryptedEmail) {
      this.setEmail(data.email);
    }
    if (data.phone && !this._encryptedPhone) {
      this.setPhone(data.phone);
    }
  }

  /**
   * Validate role assignment
   */
  isValidRole(role) {
    return ROLES.includes(role);
  }

  /**
   * Set role with validation
   */
  setRole(role) {
    if (!this.isValidRole(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${ROLES.join(', ')}`);
    }
    this.role = role;
  }

  /**
   * Set email with encryption (PII field)
   */
  setEmail(email) {
    if (!email) {
      this._encryptedEmail = null;
    } else {
      this._encryptedEmail = encrypt(email);
    }
  }

  /**
   * Get email with decryption (triggers PDPA audit)
   */
  getEmail() {
    if (!this._encryptedEmail) return '';
    return decrypt(this._encryptedEmail) || '';
  }

  /**
   * Set phone with encryption (PII field)
   */
  setPhone(phone) {
    if (!phone) {
      this._encryptedPhone = null;
    } else {
      this._encryptedPhone = encrypt(phone);
    }
  }

  /**
   * Get phone with decryption (triggers PDPA audit)
   */
  getPhone() {
    if (!this._encryptedPhone) return '';
    return decrypt(this._encryptedPhone) || '';
  }

  toJSON() {
    const obj = { ...this };
    // Never expose password hash or encrypted fields in JSON
    delete obj.passwordHash;
    delete obj._encryptedEmail;
    delete obj._encryptedPhone;

    // Add decrypted values for API responses (caller must log PDPA access)
    obj.email = this.getEmail();
    obj.phone = this.getPhone();

    return obj;
  }

  /**
   * Get JSON without PII fields (for safe display)
   */
  toSafeJSON() {
    const obj = { ...this };
    delete obj.passwordHash;
    delete obj._encryptedEmail;
    delete obj._encryptedPhone;

    // Include only non-PII fields
    return {
      id: obj.id,
      name: obj.name,
      role: obj.role,
      tier: obj.tier,
      psnId: obj.psnId,
      buddyId: obj.buddyId,
      habitScore: obj.habitScore,
      joinDate: obj.joinDate,
      status: obj.status,
      energyScore: obj.energyScore,
      lastLoginAt: obj.lastLoginAt
    };
  }

  /**
   * Create seeded members for testing/demo
   */
  static createSeededMembers() {
    const members = [
      new Member({
        id: 'admin-001',
        name: 'Quản Trị Viên',
        email: 'admin@droppii.vn',
        phone: '+84901234567',
        role: 'Admin',
        tier: 3
      }),
      new Member({
        id: 'core-001',
        name: 'Lãnh Đạo Cốt Cán',
        email: 'core@droppii.vn',
        phone: '+84902345678',
        role: 'Core Leader',
        tier: 3
      }),
      new Member({
        id: 'psn-001',
        name: 'Trưởng Nhóm PSN',
        email: 'psn@droppii.vn',
        phone: '+84903456789',
        role: 'PSN Leader',
        tier: 2,
        psnId: 'psn-001'
      }),
      new Member({
        id: 'member-001',
        name: 'Thành Viên Tân Binh',
        email: 'member@droppii.vn',
        phone: '+84904567890',
        role: 'Member',
        tier: 1,
        psnId: 'psn-001'
      })
    ];

    return members;
  }
}

module.exports = {
  Member,
  ROLES,
  getStore,
  initStore
};
