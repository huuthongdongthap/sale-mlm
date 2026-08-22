/**
 * T-017: Training Ops Agent — curriculum definitions
 *
 * Curriculum assignments per tier, used by assignCurriculum and
 * progress tracking.
 */

const CURRICULUM = {
  1: {
    name: 'Tân Binh → Chiến Binh',
    duration_weeks: 4,
    modules: [
      { id: 'M1', name: 'Mindset Reset — 5AM Club', days: 7, content_file: 'content/tier1/m1-mindset.json' },
      { id: 'M2', name: 'Product Mastery — Droppii Ecosystem', days: 7, content_file: 'content/tier1/m2-product.json' },
      { id: 'M3', name: 'Connect Engine — 15 Connects/Day', days: 7, content_file: 'content/tier1/m3-connect.json' },
      { id: 'M4', name: 'First Close — Follow-Up Mastery', days: 7, content_file: 'content/tier1/m4-close.json' }
    ]
  },
  2: {
    name: 'Chiến Binh → Chỉ Huy',
    duration_weeks: 8,
    modules: [
      { id: 'M5', name: 'Recruitment Funnel', days: 14 },
      { id: 'M6', name: 'Leader DNA — DISC Coaching', days: 14 },
      { id: 'M7', name: 'PSN Management', days: 14 },
      { id: 'M8', name: 'Coaching Conversations', days: 14 }
    ]
  },
  3: {
    name: 'Chỉ Huy → Tướng Quân',
    duration_weeks: 12,
    modules: [
      { id: 'M9', name: 'Sun Tzu Applied — 13 Chapters', days: 21 },
      { id: 'M10', name: 'Campaign Warfare', days: 21 },
      { id: 'M11', name: 'Data Commander', days: 21 },
      { id: 'M12', name: 'Legacy Builder', days: 21 }
    ]
  }
};

module.exports = { CURRICULUM };