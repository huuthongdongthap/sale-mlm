// Utility functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in VNĐ
export function formatCurrency(amount: number, options: { currency?: string; locale?: string; minimumFractionDigits?: number } = {}) {
  return new Intl.NumberFormat(options.locale || 'vi-VN', {
    style: 'currency',
    currency: options.currency || 'VND',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with separators
export function formatNumber(num: number, options: { locale?: string; minimumFractionDigits?: number } = {}) {
  return new Intl.NumberFormat(options.locale || 'vi-VN', {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(num);
}

// Format percentage
export function formatPercent(value: number, options: { locale?: string; minimumFractionDigits?: number } = {}) {
  return new Intl.NumberFormat(options.locale || 'vi-VN', {
    style: 'percent',
    minimumFractionDigits: options.minimumFractionDigits ?? 1,
  }).format(value / 100);
}

// Format date
export function formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = {}) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date: string | Date, locale = 'vi-VN') {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (years > 0) return rtf.format(-years, 'year');
  if (months > 0) return rtf.format(-months, 'month');
  if (weeks > 0) return rtf.format(-weeks, 'week');
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

// Generate initials from name
export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}

// Generate random color for avatar
export function getAvatarColor(name: string): string {
  const colors = [
    '#FFD700', // Gold
    '#60A5FA', // Blue
    '#A78BFA', // Purple
    '#34D399', // Green
    '#FBBF24', // Amber
    '#F472B6', // Pink
    '#E5E7EB', // Silver
    '#FFC107', // Premium Gold
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate unique ID
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmpty(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  return false;
}

// Omit keys from object
export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

// Pick keys from object
export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

// Class names for Data Table
export const dataTableClasses = {
  table: 'w-full border-collapse',
  header: 'bg-[var(--color-bg-elevated)] sticky top-0 z-10',
  headerCell: 'px-4 py-3 text-left font-medium text-[var(--text-sm)] text-[var(--color-text-secondary)] uppercase tracking-wider',
  bodyCell: 'px-4 py-3 text-[var(--color-text-primary)] border-t border-[var(--color-border-default)]',
  row: 'transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-bg-hover)]',
  rowSelected: 'bg-[var(--color-gold-500)]/5',
  rowStriped: 'bg-[var(--color-bg-elevated)]/50',
  actionButton: 'p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors',
};

// Vietnamese text constants
export const VIETNAMESE_TEXTS = {
  // Common
  yes: 'Có',
  no: 'Không',
  ok: 'OK',
  cancel: 'Hủy',
  save: 'Lưu',
  delete: 'Xóa',
  edit: 'Sửa',
  view: 'Xem',
  add: 'Thêm',
  search: 'Tìm kiếm',
  filter: 'Lọc',
  sort: 'Sắp xếp',
  export: 'Xuất',
  import: 'Nhập',
  print: 'In',
  refresh: 'Làm mới',
  loading: 'Đang tải...',
  noData: 'Không có dữ liệu',
  noResults: 'Không tìm thấy kết quả',
  error: 'Có lỗi xảy ra',
  success: 'Thành công',
  warning: 'Cảnh báo',
  info: 'Thông tin',
  confirm: 'Xác nhận',
  close: 'Đóng',

  // Actions
  create: 'Tạo mới',
  update: 'Cập nhật',
  remove: 'Xóa',
  duplicate: 'Nhân bản',
  archive: 'Lưu trữ',
  restore: 'Khôi phục',
  activate: 'Kích hoạt',
  deactivate: 'Vô hiệu hóa',
  approve: 'Duyệt',
  reject: 'Từ chối',
  pending: 'Đang chờ',
  completed: 'Hoàn thành',
  failed: 'Thất bại',

  // Navigation
  home: 'Trang chủ',
  dashboard: 'Tổng quan',
  profile: 'Hồ sơ',
  settings: 'Cài đặt',
  logout: 'Đăng xuất',
  login: 'Đăng nhập',
  register: 'Đăng ký',

  // Dashboard
  totalRevenue: 'Tổng doanh thu',
  totalAgents: 'Tổng đại lý',
  pendingOrders: 'Đơn hàng đang xử lý',
  commissionOwed: 'Hoa hồng phải trả',
  recentActivity: 'Hoạt động gần đây',
  teamPerformance: 'Hiệu suất đội ngũ',
  salesFunnel: 'Quy trình bán hàng',
  quickActions: 'Thao tác nhanh',

  // Agents
  agentCode: 'Mã đại lý',
  agentName: 'Tên đại lý',
  agentTier: 'Cấp độ',
  agentLevel: 'Cấp bậc',
  agentStatus: 'Trạng thái',
  agentPhone: 'Số điện thoại',
  agentEmail: 'Email',
  agentAddress: 'Địa chỉ',
  parentAgent: 'Đại lý cấp trên',
  downline: 'Hạ tuyến',
  upline: 'Thượng tuyến',
  monthlyPV: 'PV tháng',
  monthlyGV: 'GV tháng',
  totalPV: 'Tổng PV',
  totalGV: 'Tổng GV',
  commissionBalance: 'Số dư hoa hồng',

  // Orders
  orderNumber: 'Mã đơn hàng',
  orderDate: 'Ngày đặt',
  orderStatus: 'Trạng thái đơn',
  orderTotal: 'Tổng tiền',
  orderItems: 'Sản phẩm',
  customerName: 'Tên khách hàng',
  customerPhone: 'SĐT khách hàng',
  shippingAddress: 'Địa chỉ giao hàng',
  paymentStatus: 'Trạng thái thanh toán',
  fulfillmentStatus: 'Trạng thái giao hàng',
  trackingNumber: 'Mã vận đơn',
  carrier: 'Đơn vị vận chuyển',

  // Products
  productName: 'Tên sản phẩm',
  productSKU: 'Mã SKU',
  productCategory: 'Danh mục',
  productPrice: 'Giá bán',
  productCost: 'Giá vốn',
  productPV: 'PV',
  productGV: 'GV',
  productStock: 'Tồn kho',
  productStatus: 'Trạng thái',
  productImages: 'Hình ảnh',

  // Commissions
  commissionType: 'Loại hoa hồng',
  commissionRate: 'Tỷ lệ',
  commissionAmount: 'Số tiền',
  commissionStatus: 'Trạng thái',
  commissionPeriod: 'Kỳ thanh toán',
  payoutDate: 'Ngày thanh toán',
  payoutMethod: 'Phương thức',

  // Training
  course: 'Khóa học',
  lesson: 'Bài học',
  quiz: 'Kiểm tra',
  progress: 'Tiến độ',
  completed: 'Đã hoàn thành',
  inProgress: 'Đang học',
  locked: 'Đã khóa',
  certificate: 'Chứng chỉ',
  score: 'Điểm số',
  attempts: 'Số lần thử',

  // Achievements
  achievement: 'Thành tích',
  badge: 'Huy hiệu',
  rank: 'Cấp bậc',
  rarity: 'Độ hiếm',
  earnedAt: 'Ngày đạt được',

  // PSN Ranks
  'tan-binh': 'Tân binh',
  'truong-binh': 'Trung binh',
  'chien-binh': 'Chiến binh',
  'chi-huy': 'Chỉ huy',
  'tuong-quan': 'Tướng quân',
  'tuong-lenh': 'Tướng lệnh',
  'than-binh': 'Thần binh',
  'cao-thuong': 'Cao thưởng',

  // Time
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  thisWeek: 'Tuần này',
  thisMonth: 'Tháng này',
  lastMonth: 'Tháng trước',
  thisYear: 'Năm nay',
  lastYear: 'Năm ngoái',
  minutesAgo: '{count} phút trước',
  hoursAgo: '{count} giờ trước',
  daysAgo: '{count} ngày trước',
  weeksAgo: '{count} tuần trước',
  monthsAgo: '{count} tháng trước',
  yearsAgo: '{count} năm trước',
} as const;

// Get Vietnamese text with interpolation
export function t(key: keyof typeof VIETNAMESE_TEXTS, params?: Record<string, string | number>): string {
  let text = VIETNAMESE_TEXTS[key];
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}