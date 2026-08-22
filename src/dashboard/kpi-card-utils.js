/**
 * KPI Card Utility Functions
 * Pure helper/format functions extracted from KPICard class
 */

/**
 * Map of metric types to their display labels
 */
export const METRIC_LABELS = {
  'connects_per_day': 'Kết nối/ngày',
  'follow_ups_per_day': 'Follow-up/ngày',
  'first_order_14d': 'Đơn đầu 14 ngày',
  'habit_score': 'Điểm thói quen',
  'team_size': 'Quy mô nhóm',
  'retention_rate': 'Tỷ lệ giữ chân',
  'personal_revenue': 'Doanh thu cá nhân',
  'team_revenue': 'Doanh thu nhóm'
};

/**
 * Map of metric types to their icons
 */
export const METRIC_ICONS = {
  'connects_per_day': '[📞]',
  'follow_ups_per_day': '[💌]',
  'first_order_14d': '[🛒]',
  'habit_score': '[⭐]',
  'team_size': '[👥]',
  'retention_rate': '[🔒]',
  'personal_revenue': '[💰]',
  'team_revenue': '[🏆]'
};

/**
 * Map of status values to their display classes
 */
export const STATUS_CLASSES = {
  'RED': 'status-red',
  'YELLOW': 'status-yellow',
  'GREEN': 'status-green'
};

/**
 * Map of status values to their display text
 */
export const STATUS_TEXTS = {
  'RED': 'Cần cải thiện',
  'YELLOW': 'Gần đạt',
  'GREEN': 'Đạt mục tiêu'
};

/**
 * Map of trend values to their icons
 */
export const TREND_ICONS = {
  'up': '↗️',
  'down': '↘️',
  'stable': '➡️'
};

/**
 * Map of period values to their display labels
 */
export const PERIOD_LABELS = {
  'daily': 'Hôm nay',
  'weekly': '7 ngày qua',
  'monthly': '30 ngày qua'
};

/**
 * Map of status values to sparkline colors
 */
export const SPARKLINE_COLORS = {
  'RED': 'var(--md-color-error, #ff4444)',
  'YELLOW': 'var(--md-color-warning, #ffaa00)',
  'GREEN': 'var(--md-color-success, #00cc66)'
};

/**
 * Get status class from status value
 * @param {string} status - RED, YELLOW, or GREEN
 * @returns {string} CSS class name
 */
export function getStatusClass(status) {
  return STATUS_CLASSES[status] || 'status-neutral';
}

/**
 * Get display text from status value
 * @param {string} status - RED, YELLOW, or GREEN
 * @returns {string} Vietnamese display text
 */
export function getStatusText(status) {
  return STATUS_TEXTS[status] || 'Chưa xác định';
}

/**
 * Get metric label from metric type
 * @param {string} metric - Metric identifier
 * @returns {string} Vietnamese display label
 */
export function getMetricLabel(metric) {
  return METRIC_LABELS[metric] || metric;
}

/**
 * Get metric icon from metric type
 * @param {string} metric - Metric identifier
 * @returns {string} Icon emoji
 */
export function getMetricIcon(metric) {
  return METRIC_ICONS[metric] || '[📊]';
}

/**
 * Get trend icon from trend value
 * @param {string} trend - up, down, or stable
 * @returns {string} Arrow icon
 */
export function getTrendIcon(trend) {
  return TREND_ICONS[trend] || '➡️';
}

/**
 * Format a value based on metric type
 * @param {number|string} value - Raw value
 * @param {string} metric - Metric type for formatting context
 * @returns {string} Formatted value
 */
export function formatValue(value, metric) {
  if (typeof value !== 'number') return value || '--';

  if (metric.includes('revenue')) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  } else if (metric.includes('rate')) {
    return `${Math.round(value)}%`;
  } else if (metric === 'habit_score') {
    return `${value.toFixed(1)}/6`;
  } else {
    return Math.round(value).toLocaleString('vi-VN');
  }
}

/**
 * Get sparkline color from status
 * @param {string} status - RED, YELLOW, or GREEN
 * @returns {string} CSS color value
 */
export function getSparklineColor(status) {
  return SPARKLINE_COLORS[status] || 'var(--md-color-outline, #666666)';
}

/**
 * Get period label from period value
 * @param {string} period - daily, weekly, or monthly
 * @returns {string} Vietnamese display label
 */
export function getPeriodLabel(period) {
  return PERIOD_LABELS[period] || 'Kỳ này';
}

/**
 * Calculate progress percentage
 * @param {number} currentValue - Current metric value
 * @param {number} targetValue - Target metric value
 * @returns {number} Percentage (0-100)
 */
export function calculateProgressPercentage(currentValue, targetValue) {
  if (!targetValue || targetValue === 0) return 0;
  return Math.min((currentValue / targetValue) * 100, 100);
}

/**
 * Get progress status class from percentage
 * @param {number} percentage - Progress percentage (0-100)
 * @returns {string} CSS class name
 */
export function getProgressStatusClass(percentage) {
  if (percentage >= 100) return 'complete';
  if (percentage >= 80) return 'good';
  if (percentage >= 60) return 'warning';
  return 'poor';
}
