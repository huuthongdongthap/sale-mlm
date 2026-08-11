// Table Component - Material Design 3 compliant with full features
'use client';

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from './Input';
import { Button } from './Button';
import { Badge } from './Badge';
import { Skeleton } from './Feedback';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

// ============================================================================
// TABLE COLUMN DEFINITION
// ============================================================================

export interface TableColumn<T = Record<string, unknown>> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => ReactNode;
  cell?: (value: unknown, row: T) => ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  sticky?: 'left' | 'right';
  renderHeader?: () => ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableRowAction<T = Record<string, unknown>> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'destructive' | 'primary';
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  className?: string;
}

export interface TableSortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface TablePaginationState {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

export interface TableProps<T = Record<string, unknown>> extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sortState?: TableSortState;
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;
  pagination?: TablePaginationState & {
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  loading?: boolean;
  emptyState?: ReactNode;
  rowActions?: TableRowAction<T>[];
  stickyHeader?: boolean;
  maxHeight?: string | number;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  renderRow?: (row: T, index: number) => ReactNode;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, event: React.MouseEvent) => void;
}

// ============================================================================
// TABLE COMPONENT
// ============================================================================

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  keyAccessor,
  selectionMode = 'none',
  selectedKeys = new Set(),
  onSelectionChange,
  sortState,
  onSortChange,
  pagination,
  loading = false,
  emptyState,
  rowActions,
  stickyHeader = true,
  maxHeight,
  hoverable = true,
  striped = false,
  bordered = false,
  compact = false,
  renderRow,
  rowClassName,
  onRowClick,
  className,
  children,
  ...props
}: TableProps<T>) {
  const [internalSort, setInternalSort] = useState<TableSortState | null>(sortState || null);
  const [internalSelection, setInternalSelection] = useState<Set<string>>(selectedKeys);

  // Sync controlled props
  useEffect(() => {
    setInternalSort(sortState || null);
  }, [sortState]);

  useEffect(() => {
    setInternalSelection(selectedKeys);
  }, [selectedKeys]);

  const currentSort = sortState || internalSort;

  const handleSort = useCallback(
    (columnId: string) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column?.sortable) return;

      let newDirection: 'asc' | 'desc' = 'asc';
      if (currentSort?.columnId === columnId) {
        newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
      }

      const newSortState = { columnId, direction: newDirection };
      setInternalSort(newSortState);
      onSortChange?.(columnId, newDirection);
    },
    [columns, currentSort, onSortChange]
  );

  const handleSelectAll = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    const newKeys = new Set(internalSelection);
    if (internalSelection.size === data.length) {
      data.forEach((row) => newKeys.delete(keyAccessor(row)));
    } else {
      data.forEach((row) => newKeys.add(keyAccessor(row)));
    }
    setInternalSelection(newKeys);
    onSelectionChange?.(newKeys);
  }, [data, keyAccessor, internalSelection, selectionMode, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      if (selectionMode === 'none') return;
      const newKeys = new Set(internalSelection);
      if (selectionMode === 'single') {
        newKeys.clear();
        newKeys.add(key);
      } else {
        if (newKeys.has(key)) {
          newKeys.delete(key);
        } else {
          newKeys.add(key);
        }
      }
      setInternalSelection(newKeys);
      onSelectionChange?.(newKeys);
    },
    [internalSelection, selectionMode, onSelectionChange]
  );

  const isAllSelected = selectionMode === 'multiple' && data.length > 0 && internalSelection.size === data.length;
  const isSomeSelected = selectionMode === 'multiple' && internalSelection.size > 0 && internalSelection.size < data.length;

  const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('w-full', className)} role="status" aria-label="Đang tải dữ liệu">
        <TableSkeleton columns={visibleColumns.length} compact={compact} bordered={bordered} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && !loading) {
    return (
      <div className={cn('w-full py-12 text-center', className)}>
        {emptyState || (
          <div className="flex flex-col items-center gap-3 text-[var(--color-text-tertiary)]">
            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[var(--text-base)]">Không có dữ liệu</p>
          </div>
        )}
      </div>
    );
  }

  const tableStyle = maxHeight ? { maxHeight, overflow: 'auto' as const } : {};

  return (
    <div
      className={cn(
        'w-full overflow-auto',
        bordered && 'border border-[var(--color-border-default)] rounded-[var(--radius-lg)]',
        className
      )}
      style={tableStyle}
      {...props}
    >
      <table className="w-full border-collapse" role="grid">
        {/* Header */}
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className={cn('bg-[var(--color-bg-elevated)]', bordered && 'border-b border-[var(--color-border-default)]')}>
            {selectionMode !== 'none' && (
              <th
                className={cn(
                  'w-12 px-3 py-3',
                  'border-r border-[var(--color-border-subtle)]',
                  compact && 'py-2'
                )}
                scope="col"
              >
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={handleSelectAll}
                  aria-label={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  disabled={data.length === 0}
                />
              </th>
            )}
            {visibleColumns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left font-medium text-[var(--text-sm)] text-[var(--color-text-secondary)] uppercase tracking-wider',
                  'border-r border-[var(--color-border-subtle)]',
                  'last:border-r-0',
                  'whitespace-nowrap',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sticky === 'left' && 'sticky left-0 bg-[var(--color-bg-elevated)] z-20',
                  column.sticky === 'right' && 'sticky right-0 bg-[var(--color-bg-elevated)] z-20',
                  column.sortable && 'cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors',
                  compact && 'py-2',
                  column.headerClassName
                )}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
                onClick={column.sortable ? () => handleSort(column.id) : undefined}
                aria-sort={
                  currentSort?.columnId === column.id
                    ? currentSort.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <div className="flex items-center gap-2">
                  {column.renderHeader ? column.renderHeader() : column.header}
                  {column.sortable && currentSort?.columnId === column.id && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {currentSort.direction === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {rowActions && rowActions.length > 0 && (
              <th
                className={cn(
                  'w-12 px-3 py-3 text-center',
                  'border-r border-[var(--color-border-subtle)]',
                  compact && 'py-2'
                )}
                scope="col"
              >
                <span className="sr-only">Thao tác</span>
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((row, rowIndex) => {
            const rowKey = keyAccessor(row);
            const isSelected = internalSelection.has(rowKey);
            const actionsForRow = rowActions?.filter((action) => !action.hidden?.(row)) || [];

            return (
              <tr
                key={rowKey}
                className={cn(
                  'transition-colors duration-[var(--duration-fast)]',
                  hoverable && 'hover:bg-[var(--color-bg-hover)]',
                  striped && rowIndex % 2 === 1 && 'bg-[var(--color-bg-elevated)]/50',
                  isSelected && 'bg-[var(--color-gold-500)]/5',
                  bordered && 'border-t border-[var(--color-border-default)]',
                  onRowClick && 'cursor-pointer',
                  compact && 'py-1',
                  rowClassName?.(row, rowIndex)
                )}
                onClick={(e) => onRowClick?.(row, e)}
                style={{
                  // Ensure sticky columns work
                }}
              >
                {selectionMode !== 'none' && (
                  <td className={cn('px-3 py-3', 'border-r border-[var(--color-border-subtle)]', compact && 'py-2')}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectRow(rowKey)}
                      aria-label={isSelected ? `Bỏ chọn ${rowKey}` : `Chọn ${rowKey}`}
                    />
                  </td>
                )}
                {visibleColumns.map((column) => {
                  const value = column.accessorKey
                    ? row[column.accessorKey]
                    : column.accessor
                    ? column.accessor(row)
                    : column.cell
                    ? column.cell(undefined, row)
                    : null;

                  return (
                    <td
                      key={column.id}
                      className={cn(
                        'px-4 py-3 text-[var(--color-text-primary)]',
                        'border-r border-[var(--color-border-subtle)]',
                        'last:border-r-0',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.sticky === 'left' && 'sticky left-0 bg-[var(--color-bg-base)] z-10',
                        column.sticky === 'right' && 'sticky right-0 bg-[var(--color-bg-base)] z-10',
                        compact && 'py-2',
                        column.cellClassName
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      {column.cell ? column.cell(value, row) : (value as ReactNode)}
                    </td>
                  );
                })}
                {actionsForRow.length > 0 && (
                  <td className={cn('px-3 py-3 text-center', 'border-r border-[var(--color-border-subtle)]', compact && 'py-2')}>
                    <div className="inline-flex items-center justify-center gap-1">
                      {actionsForRow.map((action) => (
                        <Button
                          key={action.id}
                          variant={action.variant === 'destructive' ? 'error' : action.variant === 'primary' ? 'filled' : 'text'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          disabled={action.disabled?.(row)}
                          aria-label={action.label}
                          className={cn('p-1.5', action.className)}
                        >
                          {action.icon}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className={cn('px-4 py-3 border-t border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex flex-col sm:flex-row items-center justify-between gap-3', bordered && 'rounded-b-[var(--radius-lg)]')}>
          <div className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            <span>
              Hiển thị {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} -{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total}
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className={cn(
                'px-2 py-1 border border-[var(--color-border-default)] rounded-[var(--radius-md)]',
                'bg-[var(--color-bg-base)] text-[var(--color-text-primary)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]'
              )}
              aria-label="Số dòng mỗi trang"
            >
              {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                <option key={size} value={size}>
                  {size} dòng
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="text"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              aria-label="Trang đầu"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="text"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Trang trước"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2" aria-label="Trang hiện tại">
              {getPageNumbers(pagination.page, Math.ceil(pagination.total / pagination.pageSize)).map((pageNum) => (
                pageNum === '...' ? (
                  <span key="ellipsis" className="px-2 text-[var(--color-text-tertiary)]">
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? 'filled' : 'text'}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className="min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                )
              ))}
            </div>

            <Button
              variant="text"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              aria-label="Trang sau"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="text"
              size="sm"
              onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              aria-label="Trang cuối"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  compact?: boolean;
  bordered?: boolean;
}

function TableSkeleton({ columns, rows = 5, compact, bordered }: TableSkeletonProps) {
  return (
    <div className={cn(bordered && 'border border-[var(--color-border-default)] rounded-[var(--radius-lg)]')}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg-elevated)]">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className={cn('px-4 py-3', compact && 'py-2')}>
                <Skeleton variant="rectangular" width="80%" height="16px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={cn(bordered && 'border-t border-[var(--color-border-default)]')}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className={cn('px-4 py-3', compact && 'py-2')}>
                  <Skeleton variant="rectangular" width={colIndex === 0 ? '60%' : '80%'} height="16px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

function getPageNumbers(currentPage: number, totalPages: number, maxVisible = 5): (number | '...')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - halfVisible);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}