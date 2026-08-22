/**
 * Members API — router assembly
 *
 * Backward-compatible barrel. Implementation lives in src/api/members/.
 */
const express = require('express');
const router = express.Router();
const { initStore } = require('../models/member');
const { requireRole, requireAuth, requireAdmin } = require('../middleware/requireRole');
const { createMember } = require('./members/create-member');
const { listMembers } = require('./members/list-members');
const { getMember } = require('./members/member-detail');
const { updateMember } = require('./members/update-member');
const { deleteMember } = require('./members/delete-member');
const { validateMemberData } = require('./members/validation');

// Initialize the shared store
initStore();

// POST / — create member (requires PSN Leader)
router.post('/', requireRole('PSN Leader'), validateMemberData, createMember);
// GET / — list members with filters
router.get('/', requireAuth, listMembers);
// GET /:id — get member by ID
router.get('/:id', requireAuth, getMember);
// PATCH /:id — update member
router.patch('/:id', requireAuth, validateMemberData, updateMember);
// DELETE /:id — delete member (Admin only)
router.delete('/:id', requireAdmin, deleteMember);

module.exports = router;