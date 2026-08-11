// Vietnamese SALE MLM - Shared TypeScript Types
// Central type definitions for the entire application

// ============================================================================
// DESIGN SYSTEM TYPES
// ============================================================================

export type ColorScheme = 'light' | 'dark' | 'system';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type SpacingToken =
  | 'space-1' | 'space-2' | 'space-3' | 'space-4' | 'space-5'
  | 'space-6' | 'space-7' | 'space-8' | 'space-9' | 'space-10';

export type RadiusToken = 'radius-xs' | 'radius-sm' | 'radius-md' | 'radius-lg' | 'radius-xl' | 'radius-full';

export type ShadowToken = 'shadow-sm' | 'shadow-md' | 'shadow-lg' | 'shadow-gold-sm' | 'shadow-gold-lg';

export type TextSize = 'text-xs' | 'text-sm' | 'text-base' | 'text-md' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl';

export type FontWeight = 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold';

export type LineHeight = 'leading-tight' | 'leading-snug' | 'leading-normal' | 'leading-relaxed';

export type ZIndex = 'z-base' | 'z-dropdown' | 'z-sticky' | 'z-overlay' | 'z-modal' | 'z-toast' | 'z-tooltip';

export type DurationToken = 'duration-fast' | 'duration-normal' | 'duration-slow' | 'duration-page';

export type EasingToken = 'easing-enter' | 'easing-exit' | 'easing-spring';

export type IconSize = 'icon-xs' | 'icon-sm' | 'icon-md' | 'icon-lg' | 'icon-xl';

// ============================================================================
// COLOR SYSTEM TYPES
// ============================================================================

export type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'gold';

export type SurfaceColor =
  | 'bg-base'
  | 'bg-card'
  | 'bg-elevated'
  | 'bg-hover'
  | 'bg-active';

export type TextColor =
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'text-disabled'
  | 'text-on-gold';

export type BorderColor = 'border-default' | 'border-subtle' | 'border-focus';

export type PSNRankColor =
  | 'psn-tan-binh'
  | 'psn-truong-binh'
  | 'psn-chien-binh'
  | 'psn-chi-huy'
  | 'psn-tuong-quan'
  | 'psn-tuong-lenh'
  | 'psn-than-binh'
  | 'psn-cao-thuong';

export type GoldShade =
  | 'gold-50' | 'gold-100' | 'gold-200' | 'gold-300' | 'gold-400'
  | 'gold-500' | 'gold-600' | 'gold-700' | 'gold-800' | 'gold-900'
  | 'gold-electric';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface PolymorphicProps<T extends React.ElementType> {
  as?: T;
}

export type ComponentProps<T extends React.ElementType, P = {}> = P & BaseComponentProps & PolymorphicProps<T>;

export interface HTMLComponentProps<T extends HTMLElement, P = {}> extends P, BaseComponentProps {
  ref?: React.Ref<T>;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface ContainerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

export interface GridProps extends BaseComponentProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: SpacingToken;
  children: React.ReactNode;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: SpacingToken;
  wrap?: boolean;
  children: React.ReactNode;
}

export interface StackProps extends BaseComponentProps {
  direction?: 'vertical' | 'horizontal';
  gap?: SpacingToken;
  divider?: React.ReactNode;
  children: React.ReactNode;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export type ButtonVariant =
  | 'filled'
  | 'outlined'
  | 'tonal'
  | 'text'
  | 'elevated'
  | 'gold'
  | 'gradient';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends HTMLComponentProps<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string; // If provided, renders as <a>
}

export interface CardProps extends HTMLComponentProps<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled' | 'gold';
  padding?: SpacingToken;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface BadgeProps extends HTMLComponentProps<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold' | 'psn';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
  psnRank?: PSNRank;
}

export type PSNRank =
  | 'tan-binh'
  | 'truong-binh'
  | 'chien-binh'
  | 'chi-huy'
  | 'tuong-quan'
  | 'tuong-lenh'
  | 'than-binh'
  | 'cao-thuong';

export interface InputProps extends HTMLComponentProps<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
}

export interface TextareaProps extends HTMLComponentProps<HTMLTextAreaElement> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  rows?: number;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}

export interface SelectProps extends HTMLComponentProps<HTMLSelectElement> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface CheckboxProps extends HTMLComponentProps<HTMLInputElement> {
  label: string;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export interface RadioProps extends HTMLComponentProps<HTMLInputElement> {
  label: string;
  value: string;
  name: string;
  disabled?: boolean;
  required?: boolean;
}

export interface RadioGroupProps extends BaseComponentProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  direction?: 'vertical' | 'horizontal';
  error?: string;
}

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SwitchProps extends HTMLComponentProps<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface SliderProps extends HTMLComponentProps<HTMLInputElement> {
  min: number;
  max: number;
  step?: number;
  value: number | [number, number];
  onChange: (value: number | [number, number]) => void;
  disabled?: boolean;
  marks?: SliderMark[];
  label?: string;
}

export interface SliderMark {
  value: number;
  label?: string;
}

// ============================================================================
// FEEDBACK COMPONENT TYPES
// ============================================================================

export interface AlertProps extends HTMLComponentProps<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gold';
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface ToastProps extends HTMLComponentProps<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gold';
  title: string;
  description?: string;
  duration?: number; // ms, 0 = no auto-dismiss
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}

export interface ModalProps extends HTMLComponentProps<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export interface DialogProps extends ModalProps {
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => void;
  loading?: boolean;
}

export interface DrawerProps extends HTMLComponentProps<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  title?: string;
  children: React.ReactNode;
}

export interface TooltipProps extends BaseComponentProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  delay?: number;
  children: React.ReactElement;
}

export interface PopoverProps extends BaseComponentProps {
  content: React.ReactNode;
  trigger?: 'click' | 'hover' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  children: React.ReactElement;
}

export interface ProgressProps extends HTMLComponentProps<HTMLProgressElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export interface CircularProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export interface SkeletonProps extends HTMLComponentProps<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

// ============================================================================
// NAVIGATION COMPONENT TYPES
// ============================================================================

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'gold';
  children?: NavItem[];
  disabled?: boolean;
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface TabsProps extends BaseComponentProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'line' | 'enclosed' | 'soft';
  fullWidth?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content: React.ReactNode;
}

// ============================================================================
// DATA DISPLAY COMPONENT TYPES
// ============================================================================

export interface TableColumn<T = Record<string, unknown>> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => React.ReactNode;
  cell?: (value: unknown, row: T) => React.ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  sticky?: 'left' | 'right';
  renderHeader?: () => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sortState?: { columnId: string; direction: 'asc' | 'desc' };
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  loading?: boolean;
  emptyState?: React.ReactNode;
  rowActions?: TableRowAction<T>[];
  stickyHeader?: boolean;
  maxHeight?: string | number;
}

export interface TableRowAction<T = Record<string, unknown>> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface AvatarProps extends HTMLComponentProps<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'away' | 'offline' | 'busy';
  statusPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
}

export interface AvatarGroupProps extends BaseComponentProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarProps['size'];
  overlap?: boolean;
}

export interface ChipProps extends HTMLComponentProps<HTMLSpanElement> {
  label: string;
  icon?: React.ReactNode;
  avatar?: AvatarProps;
  variant?: 'default' | 'outlined' | 'filled';
  removable?: boolean;
  onRemove?: () => void;
  clickable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export interface DividerProps extends HTMLComponentProps<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  children?: React.ReactNode;
  inset?: boolean;
}

export interface ListProps<T = Record<string, unknown>> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSeparator?: (index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export interface AccordionProps extends BaseComponentProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  onChange?: (openKeys: string[]) => void;
  variant?: 'default' | 'bordered' | 'filled';
}

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TreeViewProps<T = Record<string, unknown>> extends BaseComponentProps {
  items: TreeItem<T>[];
  onSelect?: (item: T) => void;
  onExpand?: (item: T, expanded: boolean) => void;
  selectedKey?: string;
  expandedKeys?: Set<string>;
  renderItem: (item: T, props: { selected: boolean; expanded: boolean; level: number }) => React.ReactNode;
  getChildren?: (item: T) => TreeItem<T>[];
}

export interface TreeItem<T = Record<string, unknown>> {
  id: string;
  data: T;
  children?: TreeItem<T>[];
  hasChildren?: boolean;
}

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}

export interface FormSectionProps extends BaseComponentProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export interface FieldArrayProps<T = Record<string, unknown>> extends BaseComponentProps {
  fields: T[];
  renderField: (field: T, index: number, helpers: FieldArrayHelpers<T>) => React.ReactNode;
  renderAddButton?: () => React.ReactNode;
  minItems?: number;
  maxItems?: number;
}

export interface FieldArrayHelpers<T> {
  add: (field?: Partial<T>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  update: (index: number, field: Partial<T>) => void;
}

// ============================================================================
// CHART TYPES
// ============================================================================

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  meta?: Record<string, unknown>;
}

export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'area' | 'bar' | 'scatter';
}

export interface ChartConfig {
  xAxis?: {
    type?: 'category' | 'number' | 'time';
    label?: string;
    tickFormatter?: (value: string | number | Date) => string;
  };
  yAxis?: {
    label?: string;
    tickFormatter?: (value: number) => string;
    min?: number;
    max?: number;
  };
  tooltip?: {
    formatter?: (value: number, name: string, dataPoint: ChartDataPoint) => React.ReactNode;
  };
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  grid?: {
    show?: boolean;
    strokeDasharray?: string;
  };
  colors?: string[];
  responsive?: boolean;
  animation?: boolean | { duration: number; easing: string };
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseToastReturn {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'onClose'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseMediaQueryReturn {
  matches: boolean;
}

export interface UseBreakpointReturn {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface UseThemeReturn {
  theme: ColorScheme;
  setTheme: (theme: ColorScheme) => void;
  resolvedTheme: 'light' | 'dark';
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  remove: () => void;
}

export interface UseSessionStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  remove: () => void;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
}

export interface UseThrottleReturn<T> {
  throttledValue: T;
}

export interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
}

export interface UseClickOutsideReturn {
  ref: React.RefObject<HTMLElement>;
}

export interface UseOnScreenReturn {
  isVisible: boolean;
}

export interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export interface UseIdReturn {
  id: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & { pagination: PaginationMeta };
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  psnRank: PSNRank;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'customer';

export type UserStatus = 'active' | 'pending' | 'suspended' | 'banned' | 'archived';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  conditions?: Record<string, unknown>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  captcha?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  sponsorId?: string;
  placementId?: string;
  termsAccepted: boolean;
  marketingOptIn?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

// ============================================================================
// BUSINESS DOMAIN TYPES
// ============================================================================

export interface Agent {
  id: string;
  userId: string;
  code: string;
  tier: AgentTier;
  level: number;
  parentId?: string;
  sponsorId?: string;
  placementId?: string;
  position?: 'left' | 'right';
  status: AgentStatus;
  monthlyPV: number;
  monthlyGV: number;
  totalPV: number;
  totalGV: number;
  commissionBalance: number;
  pendingCommission: number;
  paidCommission: number;
  rankAchievedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AgentTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  brandId?: string;
  images: ProductImage[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  pv: number; // Personal Volume
  gv: number; // Group Volume
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  barcode?: string;
  isActive: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  inventoryQuantity: number;
  lowStockThreshold: number;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  agentId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned'
  | 'on_hold';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed' | 'cancelled';

export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered' | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  pv: number;
  gv: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}

export interface Commission {
  id: string;
  agentId: string;
  orderId: string;
  orderNumber: string;
  type: CommissionType;
  level: number;
  rate: number;
  amount: number;
  pv: number;
  gv: number;
  status: CommissionStatus;
  period: string; // YYYY-MM
  paidAt?: string;
  createdAt: string;
}

export type CommissionType =
  | 'direct'
  | 'override'
  | 'generation'
  | 'leadership'
  | 'rank_bonus'
  | 'volume_bonus'
  | 'matching_bonus'
  | 'fast_start'
  | 'infinity'
  | 'custom';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled' | 'clawback';

export interface Payout {
  id: string;
  agentId: string;
  period: string;
  totalCommission: number;
  totalAdjustments: number;
  netAmount: number;
  status: PayoutStatus;
  paymentMethod?: string;
  paymentReference?: string;
  processedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

export interface TrainingProgress {
  userId: string;
  courseId: string;
  courseTitle: string;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  certificateId?: string;
  score?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number; // seconds
}

export interface QuizAnswer {
  questionId: string;
  answer: number | number[];
  correct: boolean;
  points: number;
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  earnedAt: string;
  metadata?: Record<string, unknown>;
}

export type AchievementType =
  | 'sales'
  | 'recruitment'
  | 'training'
  | 'rank'
  | 'milestone'
  | 'special'
  | 'leaderboard';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
}

export type NotificationType =
  | 'order'
  | 'commission'
  | 'payout'
  | 'rank_up'
  | 'training'
  | 'system'
  | 'promotion'
  | 'team';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  parameters: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: ReportStatus;
  fileUrl?: string;
  generatedAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}

export type ReportType =
  | 'sales'
  | 'commission'
  | 'agent_performance'
  | 'team_performance'
  | 'inventory'
  | 'payout'
  | 'tax'
  | 'custom';

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'expired';

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface SystemSettings {
  general: GeneralSettings;
  commission: CommissionSettings;
  ranking: RankingSettings;
  email: EmailSettings;
  sms: SMSSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  localization: LocalizationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
  currencyPosition: 'left' | 'right';
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface CommissionSettings {
  models: CommissionModel[];
  defaultModel: string;
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  payoutDay: number; // 1-31 or 1-7
  minimumPayout: number;
  processingFee: number;
  processingFeeType: 'fixed' | 'percentage';
  holdPeriod: number; // days
}

export interface CommissionModel {
  id: string;
  name: string;
  description: string;
  type: 'unilevel' | 'binary' | 'matrix' | 'hybrid' | 'custom';
  levels: CommissionLevel[];
  bonuses: CommissionBonus[];
  isActive: boolean;
}

export interface CommissionLevel {
  level: number;
  percentage: number;
  minPV?: number;
  minGV?: number;
  maxAmount?: number;
}

export interface CommissionBonus {
  id: string;
  name: string;
  type: 'rank' | 'volume' | 'matching' | 'fast_start' | 'leadership' | 'infinity';
  condition: string; // JSON logic
  value: number;
  valueType: 'fixed' | 'percentage';
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
}

export interface RankingSettings {
  ranks: Rank[];
  requirements: RankRequirement[];
  autoPromotion: boolean;
  demotionProtection: number; // months
}

export interface Rank {
  id: string;
  name: string;
  code: string;
  level: number;
  color: string;
  icon: string;
  benefits: string[];
  isPSNRank: boolean;
}

export interface RankRequirement {
  rankId: string;
  personalPV?: number;
  groupGV?: number;
  activeLegs?: number;
  qualifiedLegs?: number;
  maxLegPercentage?: number;
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  templates: Record<string, EmailTemplate>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  variables: string[];
}

export interface SMSSettings {
  provider: 'twilio' | 'vonage' | 'plivo' | 'viettel' | 'mobifone' | 'vinaphone';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  brandName?: string;
  templates: Record<string, SMSTemplate>;
}

export interface SMSTemplate {
  content: string;
  variables: string[];
}

export interface PaymentSettings {
  providers: PaymentProvider[];
  defaultCurrency: string;
  autoCapture: boolean;
  refundPolicy: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: 'vnpay' | 'momo' | 'zalopay' | 'stripe' | 'paypal' | 'bank_transfer' | 'cod';
  enabled: boolean;
  config: Record<string, string>;
  fees: PaymentFee[];
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
}

export interface PaymentFee {
  type: 'fixed' | 'percentage';
  value: number;
  min?: number;
  max?: number;
}

export interface ShippingSettings {
  carriers: ShippingCarrier[];
  defaultCarrier: string;
  freeShippingThreshold: number;
  defaultPackage: PackageDimensions;
  trackingEnabled: boolean;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  config: Record<string, string>;
  services: ShippingService[];
  coverage: string[]; // provinces
}

export interface ShippingService {
  id: string;
  name: string;
  code: string;
  estimatedDays: { min: number; max: number };
  priceCalculator: 'weight' | 'distance' | 'fixed' | 'custom';
  basePrice: number;
  pricePerKg?: number;
  pricePerKm?: number;
  maxWeight?: number;
  maxDimensions?: PackageDimensions;
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface LocalizationSettings {
  defaultLanguage: string;
  supportedLanguages: Language[];
  fallbackLanguage: string;
  rtlLanguages: string[];
  dateFormats: Record<string, string>;
  numberFormats: Record<string, string>;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  enabled: boolean;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  twoFactorEnabled: boolean;
  twoFactorMethods: ('totp' | 'sms' | 'email')[];
  apiRateLimit: number; // requests per minute
  corsOrigins: string[];
  contentSecurityPolicy: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number; // days
  historyCount: number;
  preventCommon: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  fontFamily: string;
  logoLight: string;
  logoDark: string;
  favicon: string;
  customCSS: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ValueOf<T> = T[keyof T];

export type KeyOf<T> = keyof T;

export type NonEmptyArray<T> = [T, ...T[]];

export type PrevNext<T> = { prev: T | null; next: T | null };

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

export type Dictionary<T = unknown> = Record<string, T>;

export type EventHandler<T = Event> = (event: T) => void;

export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// ============================================================================
// RE-EXPORTS
// ============================================================================

export * from './mockData';