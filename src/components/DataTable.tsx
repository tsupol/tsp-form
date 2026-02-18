import { useState, useMemo, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type Row,
  type Table as TanstackTable,
  type Column,
  type OnChangeFn,
} from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Checkbox } from './Checkbox';
import { Pagination } from './Pagination';
import { Select, type SelectItem } from './Select';
import { PopOver } from './PopOver';
import { MenuItem, MenuSeparator } from './Menu';
import '../styles/data-table.css';

// ── Inline SVG icons (no external icon libs) ────────────────────────

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="data-table-info-icon">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// ── Sort icons ──────────────────────────────────────────────────────

const SortAscIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="data-table-sort-icon">
    <path d="M12 5v14" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const SortDescIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="data-table-sort-icon">
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

const SortNoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="data-table-sort-icon">
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

// ── DataTableColumnHeader ───────────────────────────────────────────

export type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      className={clsx('data-table-column-header', className)}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      {sorted === 'asc' ? <SortAscIcon /> : sorted === 'desc' ? <SortDescIcon /> : <SortNoneIcon />}
    </button>
  );
}

// ── createSelectColumn ──────────────────────────────────────────────

export function createSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableColumnFilter: false,
  };
}

// ── DataTable ───────────────────────────────────────────────────────

type DataTableBaseProps<TData> = {
  data: TData[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Controls the size of both the "rows per page" Select and the Pagination */
  size?: 'sm' | 'md' | 'lg';
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  toolbar?: (table: TanstackTable<TData>) => ReactNode;
  noResults?: ReactNode;
  className?: string;
  striped?: boolean;
};

type ColumnModeProps<TData> = DataTableBaseProps<TData> & {
  columns: ColumnDef<TData, any>[];
  renderRow?: never;
  renderHeader?: never;
  tableClassName?: string;
};

type FreeformModeProps<TData> = DataTableBaseProps<TData> & {
  columns?: never;
  renderRow: (row: Row<TData>) => ReactNode;
  renderHeader?: () => ReactNode;
  tableClassName?: never;
};

export type DataTableProps<TData> = ColumnModeProps<TData> | FreeformModeProps<TData>;

export function DataTable<TData>({
  data,
  columns,
  renderRow,
  renderHeader,
  enableSorting = false,
  enableFiltering = false,
  enablePagination = false,
  enableRowSelection = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  size = 'md',
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  toolbar,
  noResults,
  className,
  tableClassName,
  striped = false,
}: DataTableProps<TData>) {
  // Internal state with optional controlled overrides
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  // For freeform mode, we need a minimal column definition so TanStack can manage rows
  const effectiveColumns: ColumnDef<TData, any>[] = columns ?? [{
    id: '__placeholder',
    header: () => null,
    cell: () => null,
  }];

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    enableRowSelection,
    state: {
      sorting: controlledSorting ?? internalSorting,
      columnFilters: controlledColumnFilters ?? internalColumnFilters,
      columnVisibility: controlledColumnVisibility ?? internalColumnVisibility,
      rowSelection: controlledRowSelection ?? internalRowSelection,
      globalFilter: controlledGlobalFilter ?? internalGlobalFilter,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
    initialState: {
      pagination: { pageSize },
    },
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1; // 1-based

  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const totalRows = table.getFilteredRowModel().rows.length;

  const selectSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  const pageSizeSelectOptions: SelectItem[] = useMemo(
    () => pageSizeOptions.map((s) => ({ value: String(s), label: String(s) })),
    [pageSizeOptions],
  );

  const isFreeform = !!renderRow;

  return (
    <div className={clsx('data-table', className)}>
      {toolbar?.(table)}

      {isFreeform ? (
        /* ── Freeform mode ── */
        <div className="data-table-freeform">
          {renderHeader && (
            <div className="data-table-freeform-header">
              {renderHeader()}
            </div>
          )}
          <div className="data-table-freeform-body">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <div key={row.id}>{renderRow(row)}</div>
              ))
            ) : (
              <div className="data-table-no-results">
                {noResults ?? 'No results.'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Column mode ── */
        <Table className={clsx(striped && 'table-striped', tableClassName)}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={effectiveColumns.length}>
                  <div className="data-table-no-results">
                    {noResults ?? 'No results.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {enablePagination && totalPages > 0 && (
        <div className="data-table-footer">
          <div className="data-table-footer-info">
            {enableRowSelection ? (
              <span>{selectedCount} of {totalRows} row(s) selected</span>
            ) : (
              <span>{totalRows} row(s)</span>
            )}
          </div>
          <div className="data-table-page-size">
            <span>Rows per page</span>
            <Select
              options={pageSizeSelectOptions}
              value={String(table.getState().pagination.pageSize)}
              onChange={(v) => table.setPageSize(Number(v))}
              size={selectSize}
              searchable={false}
              showChevron
              className="data-table-page-size-select"
            />
          </div>
          <div className="data-table-footer-mobile">
            <PopOver
              isOpen={mobileInfoOpen}
              onClose={() => setMobileInfoOpen(false)}
              placement="top"
              align="start"
              trigger={
                <button type="button" className="data-table-info-btn" onClick={() => setMobileInfoOpen((v) => !v)}>
                  <InfoIcon />
                </button>
              }
            >
              <div className="data-table-info-popover">
                <div className="data-table-info-popover-row-info">
                  {enableRowSelection
                    ? `${selectedCount} of ${totalRows} row(s) selected`
                    : `${totalRows} row(s)`}
                </div>
                <MenuSeparator />
                {pageSizeOptions.map((s) => (
                  <MenuItem
                    key={s}
                    label={`${s} per page`}
                    active={table.getState().pagination.pageSize === s}
                    onClick={() => { table.setPageSize(s); setMobileInfoOpen(false); }}
                  />
                ))}
              </div>
            </PopOver>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            size={size}
          />
        </div>
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
