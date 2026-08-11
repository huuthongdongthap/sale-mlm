// 9 Levels definition
export const LEVELS = [
  { name: 'Tân binh', min: 0, max: 100, color: '#6B7280' },
  { name: 'Học viên', min: 101, max: 300, color: '#3B82F6' },
  { name: 'Chiến sĩ', min: 301, max: 600, color: '#10B981' },
  { name: 'Chuyên gia', min: 601, max: 1000, color: '#8B5CF6' },
  { name: 'Chiến binh', min: 1001, max: 1500, color: '#F59E0B' },
  { name: 'Đại sư', min: 1501, max: 2500, color: '#EF4444' },
  { name: 'Chỉ huy', min: 2501, max: 4000, color: '#EC4899' },
  { name: 'Tướng quân', min: 4001, max: 6000, color: '#F97316' },
  { name: 'Huyền thoại', min: 6001, max: Infinity, color: '#EAB308' },
];

// Points for actions
export const POINTS_MAP = {
  checkin_habit: 3,
  lesson_complete: 5,
  daily_target: 5,
  post_share: 2,
  perfect_day: 10,
  close_order: 20,
  refer_new: 50,
  graduate_level: 100,
};

export function getLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(points) {
  const current = getLevel(points);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getProgressInLevel(points) {
  const level = getLevel(points);
  if (!level || level.max === Infinity) return 100;
  const range = level.max - level.min;
  const earned = points - level.min;
  return Math.min(100, Math.round((earned / range) * 100));
}
