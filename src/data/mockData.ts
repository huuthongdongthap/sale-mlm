// Vietnamese SALE MLM - Mock Data Layer
// All static content decoupled from components

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'agent' | 'customer';
  status: 'active' | 'pending' | 'suspended' | 'banned';
  psnRank: PSNRank;
  createdAt: string;
  lastActiveAt: string;
}

export interface Agent extends User {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalSales: number;
  monthlySales: number;
  commissionOwed: number;
  teamSize: number;
  level: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalAmount: number;
  commission: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  icon: string;
  color: 'gold' | 'blue' | 'green' | 'purple' | 'red';
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  psnRank: PSNRank;
  monthlyRevenue: number;
  conversionRate: number;
  lastActivity: string;
}

export type PSNRank =
  | 'tan-binh'      // Tân binh - Blue
  | 'truong-binh'   // Trung binh - Purple
  | 'chien-binh'    // Chien binh - Green
  | 'chi-huy'       // Chi huy - Amber
  | 'tuong-quan'    // Tuong quan - Gold
  | 'tuong-lenh'    // Tuong lenh - Pink
  | 'than-binh'     // Than binh - Silver
  | 'cao-thuong';   // Cao thuong - Premium Gold

export const psnRankLabels: Record<PSNRank, string> = {
  'tan-binh': 'Tân binh',
  'truong-binh': 'Trung binh',
  'chien-binh': 'Chiến binh',
  'chi-huy': 'Chỉ huy',
  'tuong-quan': 'Tướng quân',
  'tuong-lenh': 'Tướng lệnh',
  'than-binh': 'Thần binh',
  'cao-thuong': 'Cao thưởng',
};

export const psnRankColors: Record<PSNRank, string> = {
  'tan-binh': '#60A5FA',
  'truong-binh': '#A78BFA',
  'chien-binh': '#34D399',
  'chi-huy': '#FBBF24',
  'tuong-quan': '#FFD700',
  'tuong-lenh': '#F472B6',
  'than-binh': '#E5E7EB',
  'cao-thuong': '#FFC107',
};

// Dashboard Metrics
export const dashboardMetrics: MetricCard[] = [
  {
    id: 'total-agents',
    label: 'Tổng Đại lý',
    value: '1,247',
    trend: 'up',
    trendValue: '+12.5% so với tháng trước',
    icon: 'users',
    color: 'gold',
  },
  {
    id: 'pending-orders',
    label: 'Đơn hàng đang xử lý',
    value: '342',
    trend: 'down',
    trendValue: '-8.2% so với hôm qua',
    icon: 'package',
    color: 'blue',
  },
  {
    id: 'revenue',
    label: 'Doanh thu tháng này',
    value: '2.4B VNĐ',
    trend: 'up',
    trendValue: '+23.1% so với tháng trước',
    icon: 'dollar-sign',
    color: 'green',
  },
  {
    id: 'commission',
    label: 'Hoa hồng phải trả',
    value: '480M VNĐ',
    trend: 'up',
    trendValue: '+5.3% so với tuần trước',
    icon: 'credit-card',
    color: 'purple',
  },
];

// Sales Funnel
export const salesFunnel: FunnelStage[] = [
  { id: 'lead', name: 'Lead', count: 1247, percentage: 100, color: '#60A5FA' },
  { id: 'qualifying', name: 'Qualifying', count: 892, percentage: 71.5, color: '#A78BFA' },
  { id: 'proposal', name: 'Proposal', count: 534, percentage: 42.8, color: '#34D399' },
  { id: 'negotiation', name: 'Negotiation', count: 287, percentage: 23.0, color: '#FBBF24' },
  { id: 'closed', name: 'Closed Won', count: 156, percentage: 12.5, color: '#FFD700' },
];

// Team Performance
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    role: 'Team Leader',
    status: 'online',
    psnRank: 'tuong-quan',
    monthlyRevenue: 450000000,
    conversionRate: 23.5,
    lastActivity: '2 phút trước',
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    role: 'Senior Agent',
    status: 'online',
    psnRank: 'chi-huy',
    monthlyRevenue: 320000000,
    conversionRate: 19.8,
    lastActivity: '5 phút trước',
  },
  {
    id: '3',
    name: 'Lê Minh Châu',
    role: 'Agent',
    status: 'away',
    psnRank: 'chien-binh',
    monthlyRevenue: 180000000,
    conversionRate: 15.2,
    lastActivity: '15 phút trước',
  },
  {
    id: '4',
    name: 'Phạm Quốc Dũng',
    role: 'Agent',
    status: 'offline',
    psnRank: 'truong-binh',
    monthlyRevenue: 95000000,
    conversionRate: 11.7,
    lastActivity: '2 giờ trước',
  },
  {
    id: '5',
    name: 'Hoàng Thị Minh',
    role: 'Junior Agent',
    status: 'online',
    psnRank: 'tan-binh',
    monthlyRevenue: 42000000,
    conversionRate: 8.3,
    lastActivity: 'Just now',
  },
  {
    id: '6',
    name: 'Vũ Đức Nam',
    role: 'Agent',
    status: 'offline',
    psnRank: 'chien-binh',
    monthlyRevenue: 210000000,
    conversionRate: 17.1,
    lastActivity: '1 ngày trước',
  },
  {
    id: '7',
    name: 'Đặng Thị Hoa',
    role: 'Agent',
    status: 'online',
    psnRank: 'chi-huy',
    monthlyRevenue: 280000000,
    conversionRate: 21.4,
    lastActivity: '30 giây trước',
  },
  {
    id: '8',
    name: 'Bùi Văn Tuấn',
    role: 'Senior Agent',
    status: 'away',
    psnRank: 'tuong-quan',
    monthlyRevenue: 380000000,
    conversionRate: 18.9,
    lastActivity: '10 phút trước',
  },
];

// Activity Feed
export const activityFeed = [
  {
    id: '1',
    user: 'Nguyễn Văn An',
    avatar: 'NA',
    action: 'đã chốt đơn hàng #ORD-2024-001247',
    entity: 'Đơn hàng',
    entityId: 'ORD-2024-001247',
    timestamp: '2024-01-15T10:30:00Z',
    value: '15.000.000 VNĐ',
  },
  {
    id: '2',
    user: 'Trần Thị Bình',
    avatar: 'TB',
    action: 'đã thêm đại lý mới: Phạm Văn Cường',
    entity: 'Đại lý',
    entityId: 'AGT-2024-00892',
    timestamp: '2024-01-15T10:15:00Z',
  },
  {
    id: '3',
    user: 'Lê Minh Châu',
    avatar: 'LC',
    action: 'hoàn thành khóa học "Kỹ năng bán hàng nâng cao"',
    entity: 'Khóa học',
    entityId: 'CRS-ADV-001',
    timestamp: '2024-01-15T09:45:00Z',
  },
  {
    id: '4',
    user: 'Hệ thống',
    avatar: '⚙',
    action: 'đã xuất báo cáo doanh thu tháng 12/2023',
    entity: 'Báo cáo',
    entityId: 'RPT-2023-12',
    timestamp: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    user: 'Phạm Quốc Dũng',
    avatar: 'PD',
    action: 'đã yêu cầu rút hoa hồng 25.000.000 VNĐ',
    entity: 'Yêu cầu rút',
    entityId: 'WDR-2024-00145',
    timestamp: '2024-01-15T07:30:00Z',
  },
];

// Training - Hive Academy
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string; // e.g., "4h 30m"
  lessons: number;
  type: 'video' | 'quiz' | 'reading' | 'live';
  level: 'beginner' | 'intermediate' | 'advanced';
  isLocked: boolean;
  progress: number; // 0-100
  category: string;
  instructor: {
    name: string;
    avatar: string;
    title: string;
  };
  tags: string[];
}

export const courses: Course[] = [
  {
    id: 'crs-001',
    title: 'Nền tảng MLM: Từ Zero đến Hero',
    description: 'Khóa học cơ bản nhất cho người mới bắt đầu. Hiểu mô hình, quy tắc, và cách xây dựng đội nhóm bền vững.',
    thumbnail: '/thumbnails/mlm-foundation.jpg',
    duration: '6h 45m',
    lessons: 24,
    type: 'video',
    level: 'beginner',
    isLocked: false,
    progress: 100,
    category: 'Cơ bản',
    instructor: {
      name: 'Chuyên gia Nguyễn Văn Chiến',
      avatar: '/avatars/chien.jpg',
      title: 'Founder & CEO',
    },
    tags: ['Cơ bản', 'MLM', 'Mindset'],
  },
  {
    id: 'crs-002',
    title: 'Kỹ năng thuyết trình & Chốt đơn',
    description: 'Học cách trình bày sản phẩm, xử lý kháng cự, và chốt đơn hiệu quả qua điện thoại & trực tiếp.',
    thumbnail: '/thumbnails/sales-skills.jpg',
    duration: '8h 20m',
    lessons: 32,
    type: 'video',
    level: 'intermediate',
    isLocked: false,
    progress: 65,
    category: 'Kỹ năng bán hàng',
    instructor: {
      name: 'Huấn luyện viên Lê Thị Hương',
      avatar: '/avatars/huong.jpg',
      title: 'Senior Sales Trainer',
    },
    tags: ['Chốt đơn', 'Xử lý kháng cự', 'Thuyết trình'],
  },
  {
    id: 'crs-003',
    title: 'Xây dựng & Phát triển đội nhóm',
    description: 'Chiến lược tuyển dụng, đào tạo nhân sự mới, định hướng đường sự nghiệp cho downline.',
    thumbnail: '/thumbnails/team-building.jpg',
    duration: '5h 10m',
    lessons: 18,
    type: 'video',
    level: 'intermediate',
    isLocked: false,
    progress: 30,
    category: 'Lãnh đạo',
    instructor: {
      name: 'Trần Minh Tuấn',
      avatar: '/avatars/tuan.jpg',
      title: 'Diamond Director',
    },
    tags: ['Tuyển dụng', 'Đào tạo', 'Lãnh đạo'],
  },
  {
    id: 'crs-004',
    title: 'Digital Marketing cho MLM',
    description: 'Tận dụng Facebook, Zalo, TikTok để thu hút khách hàng tiềm năng và xây dựng thương hiệu cá nhân.',
    thumbnail: '/thumbnails/digital-marketing.jpg',
    duration: '7h 30m',
    lessons: 28,
    type: 'video',
    level: 'advanced',
    isLocked: true,
    progress: 0,
    category: 'Marketing',
    instructor: {
      name: 'Vũ Đức Minh',
      avatar: '/avatars/minh.jpg',
      title: 'Digital Marketing Expert',
    },
    tags: ['Facebook Ads', 'Zalo Marketing', 'Personal Branding'],
  },
  {
    id: 'crs-005',
    title: 'Quản trị tài chính & Thuế cho Đại lý',
    description: 'Kiến thức bắt buộc: ghi nhận thu chi, tính hoa hồng, khai báo thuế TNCN, quản lý dòng tiền.',
    thumbnail: '/thumbnails/finance.jpg',
    duration: '3h 45m',
    lessons: 12,
    type: 'reading',
    level: 'beginner',
    isLocked: true,
    progress: 0,
    category: 'Tài chính - Pháp lý',
    instructor: {
      name: 'Kế toán trưởng Phạm Thị Lan',
      avatar: '/avatars/lan.jpg',
      title: 'Chief Accountant',
    },
    tags: ['Kế toán', 'Thuế', 'Tài chính'],
  },
];

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'video' | 'quiz' | 'reading' | 'live';
  duration: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  content?: string;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
}

export const lessons: Lesson[] = [
  {
    id: 'les-001',
    courseId: 'crs-001',
    title: 'Bài 1: MLM là gì? Phân biệt MLM và Lừa đảo đa cấp',
    type: 'video',
    duration: '15:30',
    order: 1,
    isLocked: false,
    isCompleted: true,
    videoUrl: '/videos/mlm-intro.mp4',
  },
  {
    id: 'les-002',
    courseId: 'crs-001',
    title: 'Bài 2: Mô hình hoa hồng SALE MLM chi tiết',
    type: 'video',
    duration: '22:15',
    order: 2,
    isLocked: false,
    isCompleted: true,
    videoUrl: '/videos/commission-model.mp4',
  },
  {
    id: 'les-003',
    courseId: 'crs-001',
    title: 'Bài 3: Quy trình đăng ký & xác thực đại lý',
    type: 'video',
    duration: '18:45',
    order: 3,
    isLocked: false,
    isCompleted: true,
    videoUrl: '/videos/registration.mp4',
  },
  {
    id: 'les-004',
    courseId: 'crs-001',
    title: 'Quiz: Kiểm tra kiến thức cơ bản MLM',
    type: 'quiz',
    duration: '10:00',
    order: 4,
    isLocked: false,
    isCompleted: true,
    quizQuestions: [
      {
        id: 'q1',
        question: 'MLM viết tắt của từ gì?',
        type: 'single',
        options: ['Multi-Level Marketing', 'Multi-Layer Money', 'Marketing Level Multi', 'Money Level Marketing'],
        correctAnswer: 0,
        explanation: 'MLM = Multi-Level Marketing (Tiếp thị đa cấp)',
      },
      {
        id: 'q2',
        question: 'Đâu KHÔNG phải đặc điểm của MLM hợp pháp?',
        type: 'single',
        options: ['Có sản phẩm/dịch vụ thực tế', 'Thu nhập chủ yếu từ tuyển người mới', 'Có chính sách hoa hồng minh bạch', 'Tuân thủ luật pháp'],
        correctAnswer: 1,
        explanation: 'MLM hợp pháp thu nhập từ bán sản phẩm, KHÔNG từ phí tham gia/tuyển người',
      },
    ],
  },
  {
    id: 'les-005',
    courseId: 'crs-002',
    title: 'Bài 1: Kỹ thuật SPIN Selling trong MLM',
    type: 'video',
    duration: '25:20',
    order: 1,
    isLocked: false,
    isCompleted: true,
    videoUrl: '/videos/spin-selling.mp4',
  },
  {
    id: 'les-006',
    courseId: 'crs-002',
    title: 'Bài 2: Xử lý 10 kháng cự phổ biến nhất',
    type: 'video',
    duration: '30:10',
    order: 2,
    isLocked: false,
    isCompleted: false,
    videoUrl: '/videos/objections.mp4',
  },
];

// Achievements
export const achievements = [
  {
    id: 'ach-001',
    title: 'Đại lý tháng',
    description: 'Top 1 doanh số tháng',
    icon: 'trophy',
    rarity: 'legendary' as const,
    earnedAt: '2024-01-10',
    color: '#FFD700',
  },
  {
    id: 'ach-002',
    title: 'Người khai phá',
    description: 'Tuyển được 50 đại lý cấp 1',
    icon: 'users',
    rarity: 'epic' as const,
    earnedAt: '2023-12-15',
    color: '#F472B6',
  },
  {
    id: 'ach-003',
    title: 'Học sinh xuất sắc',
    description: 'Hoàn thành 10 khóa học',
    icon: 'graduation-cap',
    rarity: 'rare' as const,
    earnedAt: '2023-11-20',
    color: '#A78BFA',
  },
  {
    id: 'ach-004',
    title: 'Kỷ lục chốt đơn',
    description: 'Chốt 20 đơn trong 1 ngày',
    icon: 'zap',
    rarity: 'epic' as const,
    earnedAt: '2023-10-05',
    color: '#34D399',
  },
  {
    id: 'ach-005',
    title: 'Người hướng dẫn',
    description: 'Giúp 10 downline lên rank',
    icon: 'hand-heart',
    rarity: 'common' as const,
    earnedAt: '2023-09-01',
    color: '#60A5FA',
  },
];

// Quick Actions
export const quickActions = [
  {
    id: 'create-order',
    label: 'Tạo đơn hàng mới',
    icon: 'plus-circle',
    color: 'gold',
    href: '/admin/orders/create',
  },
  {
    id: 'add-agent',
    label: 'Thêm đại lý',
    icon: 'user-plus',
    color: 'blue',
    href: '/admin/agents/create',
  },
  {
    id: 'payout',
    label: 'Thanh toán hoa hồng',
    icon: 'credit-card',
    color: 'green',
    href: '/admin/payouts',
  },
  {
    id: 'report',
    label: 'Xuất báo cáo',
    icon: 'download',
    color: 'purple',
    href: '/admin/reports',
  },
  {
    id: 'broadcast',
    label: 'Gửi thông báo',
    icon: 'megaphone',
    color: 'red',
    href: '/admin/broadcast',
  },
  {
    id: 'settings',
    label: 'Cài đặt hệ thống',
    icon: 'settings',
    color: 'gray',
    href: '/admin/settings',
  },
];

// Navigation
export const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'home', href: '/dashboard', badge: null },
  { id: 'people', label: 'Đội ngũ', icon: 'users', href: '/dashboard/people', badge: '12' },
  { id: 'training', label: 'Kiến thức', icon: 'graduation-cap', href: '/training', badge: '3' },
  { id: 'analytics', label: 'Phân tích', icon: 'bar-chart', href: '/dashboard/analytics', badge: null },
  { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '/admin/settings', badge: null },
];

// Admin - Users Table
export const adminUsers = [
  {
    id: 'USER-001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@salemlm.vn',
    phone: '0901 234 567',
    role: 'admin',
    status: 'active',
    psnRank: 'tuong-quan',
    registeredAt: '2023-01-15',
    lastLogin: '2024-01-15 10:30',
    totalRevenue: 2400000000,
  },
  {
    id: 'USER-002',
    name: 'Trần Thị Bình',
    email: 'binh.tran@salemlm.vn',
    phone: '0902 345 678',
    role: 'manager',
    status: 'active',
    psnRank: 'chi-huy',
    registeredAt: '2023-03-22',
    lastLogin: '2024-01-15 10:25',
    totalRevenue: 1800000000,
  },
  {
    id: 'USER-003',
    name: 'Lê Minh Châu',
    email: 'chau.le@salemlm.vn',
    phone: '0903 456 789',
    role: 'agent',
    status: 'active',
    psnRank: 'chien-binh',
    registeredAt: '2023-06-10',
    lastLogin: '2024-01-15 09:45',
    totalRevenue: 950000000,
  },
  {
    id: 'USER-004',
    name: 'Phạm Quốc Dũng',
    email: 'dung.pham@salemlm.vn',
    phone: '0904 567 890',
    role: 'agent',
    status: 'pending',
    psnRank: 'truong-binh',
    registeredAt: '2023-09-05',
    lastLogin: '2024-01-14 14:20',
    totalRevenue: 420000000,
  },
  {
    id: 'USER-005',
    name: 'Hoàng Thị Minh',
    email: 'minh.hoang@salemlm.vn',
    phone: '0905 678 901',
    role: 'agent',
    status: 'suspended',
    psnRank: 'tan-binh',
    registeredAt: '2023-11-12',
    lastLogin: '2024-01-10 16:00',
    totalRevenue: 180000000,
  },
  {
    id: 'USER-006',
    name: 'Vũ Đức Nam',
    email: 'nam.vu@salemlm.vn',
    phone: '0906 789 012',
    role: 'agent',
    status: 'active',
    psnRank: 'chien-binh',
    registeredAt: '2023-05-20',
    lastLogin: '2024-01-13 11:15',
    totalRevenue: 1100000000,
  },
  {
    id: 'USER-007',
    name: 'Đặng Thị Hoa',
    email: 'hoa.dang@salemlm.vn',
    phone: '0907 890 123',
    role: 'agent',
    status: 'active',
    psnRank: 'chi-huy',
    registeredAt: '2023-04-18',
    lastLogin: '2024-01-15 10:28',
    totalRevenue: 1450000000,
  },
  {
    id: 'USER-008',
    name: 'Bùi Văn Tuấn',
    email: 'tuan.bui@salemlm.vn',
    phone: '0908 901 234',
    role: 'agent',
    status: 'active',
    psnRank: 'tuong-quan',
    registeredAt: '2023-02-28',
    lastLogin: '2024-01-15 10:10',
    totalRevenue: 3200000000,
  },
];

// Landing Page Content
export const landingContent = {
  hero: {
    headline: 'SALE MLM - Hệ thống quản trị bán hàng đa cấp số 1 Việt Nam',
    subheadline: 'Quản lý đại lý, theo dõi doanh thu, tự động hóa hoa hồng, đào tạo đội ngũ - Tất cả trong một nền tảng.',
    ctaPrimary: { label: 'Dùng thử miễn phí 14 ngày', href: '/register' },
    ctaSecondary: { label: 'Xem demo trực tuyến', href: '/demo' },
    trustIndicators: [
      { label: '5.000+', desc: 'Đại lý hoạt động' },
      { label: '2.000 tỷ', desc: 'VNĐ doanh thu/tháng' },
      { label: '99.9%', desc: 'Uptime hệ thống' },
      { label: '24/7', desc: 'Hỗ trợ kỹ thuật' },
    ],
  },
  features: [
    {
      id: 'dashboard',
      title: 'Dashboard thời gian thực',
      description: 'Theo dõi KPI, doanh thu, hoa hồng, đội ngũ trên một màn hình. Cập nhật mỗi phút.',
      icon: 'bar-chart',
      color: 'gold',
    },
    {
      id: 'people',
      title: 'Quản trị đội ngũ đa cấp',
      description: 'Cây genealogy trực quan, phân cấp rõ ràng, theo dõi hiệu suất từng cấp độ downline.',
      icon: 'git-branch',
      color: 'blue',
    },
    {
      id: 'commission',
      title: 'Tự động hóa hoa hồng',
      description: 'Tính toán hoa hồng nhiều cấp, nhiều chính sách. Xuất phiếu thanh toán 1 click.',
      icon: 'calculator',
      color: 'green',
    },
    {
      id: 'training',
      title: 'Học viện Hive Academy',
      description: 'Hệ thống khóa học video, quiz, chứng chỉ. Theo dõi tiến độ học tập từng đại lý.',
      icon: 'graduation-cap',
      color: 'purple',
    },
    {
      id: 'orders',
      title: 'Quản lý đơn hàng thông minh',
      description: 'Từ đặt hàng → kho → vận chuyển → hoàn tiền. Tích hợp sẵn GHTK, GHN, Viettel Post.',
      icon: 'package',
      color: 'red',
    },
    {
      id: 'analytics',
      title: 'Phân tích sâu & Dự báo',
      description: 'Biểu đồ funnel, cohort analysis, dự báo doanh thu AI. Ra quyết định dựa trên data.',
      icon: 'trending-up',
      color: 'cyan',
    },
  ],
  pricing: [
    {
      id: 'starter',
      name: 'Khởi nghiệp',
      price: '0',
      period: 'đ/tuần đầu',
      description: 'Dành cho cá nhân vừa bắt đầu',
      features: [
        'Tối đa 50 đại lý',
        'Dashboard cơ bản',
        'Tính hoa hồng 1 cấp',
        'Học viện cơ bản (5 khóa)',
        'Hỗ trợ qua email',
      ],
      cta: 'Bắt đầu miễn phí',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Chuyên nghiệp',
      price: '299.000',
      period: 'VNĐ/tháng',
      description: 'Dành cho team leader, nhóm nhỏ',
      features: [
        'Tối đa 500 đại lý',
        'Dashboard nâng cao',
        'Tính hoa hồng đa cấp (tới cấp 5)',
        'Học viện đầy đủ',
        'Tích hợp vận chuyển',
        'Xuất báo cáo Excel/PDF',
        'Hỗ trợ ưu tiên Zalo/Phone',
      ],
      cta: 'Dùng thử 14 ngày',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Doanh nghiệp',
      price: 'Liên hệ',
      period: '',
      description: 'Dành cho công ty MLM quy mô lớn',
      features: [
        'Đại lý không giới hạn',
        'Dashboard tùy chỉnh',
        'Chính sách hoa hồng riêng',
        'API truy cập dữ liệu',
        'SSO & RBAC nâng cao',
        'Chuyển gia chuyên biệt',
        'SLA 99.9% + hỗ trợ 24/7',
        'Triển khai on-premise',
      ],
      cta: 'Liên hệ báo giá',
      popular: false,
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'Anh Minh - Diamond Director',
      role: 'Đội ngũ 500+ đại lý',
      avatar: '/avatars/minh.jpg',
      content: 'SALE MLM giúp tôi quản trị 500+ đại lý chỉ với 1 người admin. Tự động hóa hoa hồng tiết kiệm 40h/tháng.',
      rating: 5,
    },
    {
      id: 'test-2',
      name: 'Chị Lan - Team Leader',
      role: 'Đội ngũ 120+ đại lý',
      avatar: '/avatars/lan.jpg',
      content: 'Học viện Hive Academy thực sự chất lượng. Các đại lý mới tự học xong lên đơn hàng ngay mà không cần tôi cắm chốt.',
      rating: 5,
    },
    {
      id: 'test-3',
      name: 'Anh Tuấn - Founder',
      role: 'Công ty MLM 1000+ đại lý',
      avatar: '/avatars/tuan.jpg',
      content: 'Chuyển từ Excel sang SALE MLM, doanh thu tăng 35% nhờ quản trị chặt chẽ hơn. Đầu tư hoàn vốn sau 2 tháng.',
      rating: 5,
    },
  ],
  faq: [
    {
      question: 'SALE MLM có phù hợp cho người mới bắt đầu MLM không?',
      answer: 'Hoàn toàn phù hợp. Gói Khởi nghiệp miễn phí giúp bạn làm quen với hệ thống, học khóa cơ bản tại Hive Academy, và quản lý 50 đại lý đầu tiên không tốn chi phí.',
    },
    {
      question: 'Hệ thống tính hoa hồng như thế nào?',
      answer: 'Hỗ trợ đa dạng mô hình: Binary, Unilevel, Matrix, Hybrid. Bạn cấu hình % hoa hồng theo cấp, điều kiện lên rank, bonus doanh số nhóm. Hệ thống tự tính và xuất phiếu thanh toán.',
    },
    {
      question: 'Dữ liệu của tôi có an toàn không?',
      answer: 'Chúng tôi sử dụng AWS Singapore với mã hóa AES-256, backup hàng ngày, SOC 2 Type II certified. Dữ liệu không được chia sẻ cho bên thứ 3. Bạn có thể xuất toàn bộ data bất cứ lúc nào.',
    },
    {
      question: 'Có tích hợp với phần mềm kế toán không?',
      answer: 'Có. Tích hợp sẵn MISA, Fast, Bravo, Misake. Xuất file Excel/CSV chuẩn để import vào phần mềm kế toán khác. API mở cho developer tự tích hợp.',
    },
    {
      question: 'Hỗ trợ kỹ thuật như thế nào?',
      answer: 'Gói Pro: Zalo/Phone 8h-22h 매일. Gói Enterprise: 24/7 với account manager riêng. Có group Zalo cộng đồng 5000+ user hỗ trợ lẫn nhau.',
    },
  ],
  footer: {
    company: {
      name: 'SALE MLM',
      description: 'Nền tảng quản trị bán hàng đa cấp hiện đại nhất Việt Nam. Tự động hóa vận hành, tập trung tăng trưởng.',
      logo: '/logo.svg',
    },
    links: {
      product: [
        { label: 'Tính năng', href: '/features' },
        { label: 'Giá cả', href: '/pricing' },
        { label: 'Học viện', href: '/academy' },
        { label: 'Tích hợp', href: '/integrations' },
        { label: 'API Docs', href: '/docs/api' },
      ],
      company: [
        { label: 'Về chúng tôi', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Tuyển dụng', href: '/careers' },
        { label: 'Đối tác', href: '/partners' },
        { label: 'Liên hệ', href: '/contact' },
      ],
      legal: [
        { label: 'Quy định sử dụng', href: '/terms' },
        { label: 'Chính sách bảo mật', href: '/privacy' },
        { label: 'Chính sách cookie', href: '/cookies' },
        { label: 'Tuân thủ pháp lý', href: '/compliance' },
      ],
      support: [
        { label: 'Trung tâm trợ giúp', href: '/help' },
        { label: 'Hướng dẫn sử dụng', href: '/guides' },
        { label: 'Cộng đồng Zalo', href: 'https://zalo.me/g/salemlm' },
        { label: 'Báo cáo lỗi', href: '/bug-report' },
        { label: 'Yêu cầu tính năng', href: '/feature-request' },
      ],
    },
    social: [
      { platform: 'facebook', href: 'https://facebook.com/salemlm.vn', label: 'Facebook' },
      { platform: 'youtube', href: 'https://youtube.com/@salemlm', label: 'YouTube' },
      { platform: 'tiktok', href: 'https://tiktok.com/@salemlm', label: 'TikTok' },
      { platform: 'linkedin', href: 'https://linkedin.com/company/salemlm', label: 'LinkedIn' },
    ],
    copyright: '© 2024 SALE MLM. All rights reserved.',
  },
};

export type {
  MetricCard,
  FunnelStage,
  TeamMember,
  Course,
  Lesson,
  QuizQuestion,
  Order,
  OrderItem,
  Agent,
  User,
};