'use client';

import { LEVELS, getLevel } from '@/lib/gamification';

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function LevelBadge({ points, size = 'md' }) {
  const level = getLevel(points);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // Map level index to PSN health color tokens
  const psnColors = [
    'var(--color-psn-1-critical)',
    'var(--color-psn-2-danger)',
    'var(--color-psn-3-alert)',
    'var(--color-psn-4-warning)',
    'var(--color-psn-5-caution)',
    'var(--color-psn-6-watch)',
    'var(--color-psn-7-stable)',
    'var(--color-psn-8-healthy)',
    'var(--color-psn-9-thriving)',
  ];

  const levelColor = psnColors[level.index - 1] || psnColors[0];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${levelColor} 12%, transparent)`,
        color: levelColor,
        border: `1px solid ${levelColor}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: levelColor }}
        aria-hidden="true"
      />
      {level.name}
    </span>
  );
}

export function PointsDisplay({ points, showLabel = true }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-semibold"
      style={{ color: 'var(--color-gold-500)' }}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {showLabel && <span>Điểm: </span>}
      {points.toLocaleString('vi-VN')}
    </span>
  );
}