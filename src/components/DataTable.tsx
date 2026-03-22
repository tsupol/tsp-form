import { useState, useMemo, useRef, useCallback, Fragment, type ReactNode } from 'react';
import clsx from 'clsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Chevron } from './Chevron';
import { Pagination } from './Pagination';
import { Select, type SelectItem } from './Select';
import { PopOver } from './PopOver';
import { MenuItem, MenuSeparator } from './Menu';
import '../styles/data-table.css';

// ── Types ───────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';
export type SortingState = { id: string; desc: boolean }[];
export type RowSelectionState = Record<string, boolean>;
export type RowExpansionState = Record<string, boolean>;
export type VisibilityState = Record<string, boolean>;

export type Updater<T> = T | ((old: T) => T);

export type ColumnHelper<TData> = {
  id: string;
  getCanSort: () => boolean;
  getIsSorted: () => SortDirection | false;
  toggleSorting: (desc?: boolean) => void;
};

export type RowHelper<TData> = {
  original: TData;
  index: number;
  id: string;
  getValue: (key: string) => any;
  getIsSelected: () => boolean;
  toggleSelected: (selected?: boolean) => void;
  getIsExpanded: () => boolean;
  toggleExpanded: () => void;
  getCanExpand: () => boolean;
};

export type ColumnDef<TData> = {
  id?: string;
  accessorKey?: string;
  header?: string | ((props: { column: ColumnHelper<TData> }) => ReactNode);
  cell?: (props: { row: RowHelper<TData>; value: any }) => ReactNode;
  enableSorting?: boolean;
  className?: string;
};

// ── Inline SVG icons (no external icon libs) ────────────────────────

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export type DataTableColumnHeaderProps<TData> = {
  column: ColumnHelper<TData>;
  title: string;
  className?: string;
};

export function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData>) {
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

export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ column }) => {
      // This will be patched at render time with table-level select-all
      return null;
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  };
}

// ── createExpandColumn ──────────────────────────────────────────────

export function createExpandColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'expand',
    header: '',
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null;
      return (
        <button
          type="button"
          className="data-table-expand-toggle"
          onClick={() => row.toggleExpanded()}
          aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
        >
          <Chevron direction="right" open={row.getIsExpanded()} size={16} />
        </button>
      );
    },
    enableSorting: false,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function resolveUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(current) : updater;
}

function getAccessorValue(row: any, accessorKey: string): any {
  return row[accessorKey];
}

// ── DataTableFooter (standalone) ─────────────────────────────────────

export type DataTableFooterProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (pageSize: number) => void;
  totalRows: number;
  selectedCount?: number;
  controlSize?: 'xs' | 'sm' | 'md' | 'lg';
  siblingCount?: number;
  className?: string;
};

export function DataTableFooter({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalRows,
  selectedCount,
  controlSize = 'sm',
  siblingCount,
  className,
}: DataTableFooterProps) {
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const pageSizeSelectOptions: SelectItem[] = useMemo(
    () => pageSizeOptions.map((s) => ({ value: String(s), label: String(s) })),
    [pageSizeOptions],
  );

  if (totalPages < 1) return null;

  return (
    <div className={clsx('data-table-footer', className)}>
      <div className="data-table-footer-left">
        <Select
          options={pageSizeSelectOptions}
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          size={controlSize}
          searchable={false}
          showChevron
          className="data-table-page-size-select"
        />
        <div className="data-table-footer-info">
          {selectedCount != null ? (
            <span>{selectedCount} of {totalRows} row(s) selected</span>
          ) : (
            <span>{totalRows} row(s)</span>
          )}
        </div>
      </div>
      <div className="data-table-footer-mobile">
        <PopOver
          isOpen={mobileInfoOpen}
          onClose={() => setMobileInfoOpen(false)}
          placement="top"
          align="start"
          trigger={
            <Button variant="outline" color="default" size={controlSize} className={`btn-icon${controlSize !== 'md' ? `-${controlSize}` : ''}`} onClick={() => setMobileInfoOpen((v) => !v)} startIcon={<InfoIcon />} />
          }
        >
          <div className="data-table-info-popover">
            <div className="data-table-info-popover-row-info">
              {selectedCount != null
                ? `${selectedCount} of ${totalRows} row(s) selected`
                : `${totalRows} row(s)`}
            </div>
            <MenuSeparator />
            {pageSizeOptions.map((s) => (
              <MenuItem
                key={s}
                label={`${s} per page`}
                active={pageSize === s}
                onClick={() => {
                  onPageSizeChange(s);
                  setMobileInfoOpen(false);
                }}
              />
            ))}
          </div>
        </PopOver>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        size={controlSize}
        siblingCount={siblingCount}
      />
    </div>
  );
}

// ── DataTable ───────────────────────────────────────────────────────

type DataTableBaseProps<TData> = {
  data: TData[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowCount?: number;
  onPageChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  manualSorting?: boolean;
  controlSize?: 'xs' | 'sm' | 'md' | 'lg';
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  sorting?: SortingState;
  onSortingChange?: (updater: Updater<SortingState>) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (updater: Updater<VisibilityState>) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: Updater<RowSelectionState>) => void;
  renderExpandedRow?: (row: RowHelper<TData>) => ReactNode;
  getRowCanExpand?: (original: TData, index: number) => boolean;
  expandOnRowClick?: boolean;
  rowExpansion?: RowExpansionState;
  onRowExpansionChange?: (updater: Updater<RowExpansionState>) => void;
  siblingCount?: number;
  noResults?: ReactNode;
  className?: string;
  striped?: boolean;
};

type ColumnModeProps<TData> = DataTableBaseProps<TData> & {
  columns: ColumnDef<TData>[];
  renderRow?: never;
  renderHeader?: never;
  tableClassName?: string;
};

type FreeformModeProps<TData> = DataTableBaseProps<TData> & {
  columns?: never;
  renderRow: (row: RowHelper<TData>) => ReactNode;
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
  pageIndex: controlledPageIndex,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  rowCount,
  onPageChange,
  manualSorting = false,
  controlSize = 'sm',
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  sorting: controlledSorting,
  onSortingChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  renderExpandedRow,
  getRowCanExpand,
  expandOnRowClick = false,
  rowExpansion: controlledRowExpansion,
  onRowExpansionChange,
  siblingCount,
  noResults,
  className,
  tableClassName,
  striped = false,
}: DataTableProps<TData>) {
  // Internal state with optional controlled overrides
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalRowExpansion, setInternalRowExpansion] = useState<RowExpansionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const sorting = controlledSorting ?? internalSorting;
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const rowExpansion = controlledRowExpansion ?? internalRowExpansion;
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter;
  const effectivePageIndex = controlledPageIndex ?? internalPageIndex;
  const effectivePageSize = pageSize;

  const isManualPagination = rowCount != null;

  // Resolve column IDs
  const resolvedColumns = useMemo(() => {
    if (!columns) return [];
    return columns.map((col, i) => ({
      ...col,
      _id: col.id ?? col.accessorKey ?? `col_${i}`,
    }));
  }, [columns]);

  // Visible columns
  const visibleColumns = useMemo(() => {
    return resolvedColumns.filter((col) => columnVisibility[col._id] !== false);
  }, [resolvedColumns, columnVisibility]);

  // Update sorting
  const handleSortingChange = (updater: Updater<SortingState>) => {
    if (onSortingChange) {
      onSortingChange(updater);
    } else {
      setInternalSorting((prev) => resolveUpdater(updater, prev));
    }
  };

  // Update row selection
  const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
    if (onRowSelectionChange) {
      onRowSelectionChange(updater);
    } else {
      setInternalRowSelection((prev) => resolveUpdater(updater, prev));
    }
  };

  // Shift-click bulk selection
  const lastSelectedIndex = useRef<number | null>(null);

  const handleRowCheckboxClick = useCallback(
    (displayIndex: number, checked: boolean, shiftKey: boolean, rows: RowHelper<TData>[]) => {
      if (shiftKey && lastSelectedIndex.current != null) {
        const from = Math.min(lastSelectedIndex.current, displayIndex);
        const to = Math.max(lastSelectedIndex.current, displayIndex);
        handleRowSelectionChange((prev) => {
          const next = { ...prev };
          for (let i = from; i <= to; i++) {
            if (checked) {
              next[rows[i].id] = true;
            } else {
              delete next[rows[i].id];
            }
          }
          return next;
        });
      } else {
        const row = rows[displayIndex];
        row.toggleSelected(checked);
      }
      lastSelectedIndex.current = displayIndex;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Update row expansion
  const handleRowExpansionChange = (updater: Updater<RowExpansionState>) => {
    if (onRowExpansionChange) {
      onRowExpansionChange(updater);
    } else {
      setInternalRowExpansion((prev) => resolveUpdater(updater, prev));
    }
  };

  // Update global filter
  const handleGlobalFilterChange = (value: string) => {
    if (onGlobalFilterChange) {
      onGlobalFilterChange(value);
    } else {
      setInternalGlobalFilter(value);
    }
  };

  // Create ColumnHelper for a given column
  const makeColumnHelper = (col: typeof resolvedColumns[number]): ColumnHelper<TData> => ({
    id: col._id,
    getCanSort: () => enableSorting && col.enableSorting !== false,
    getIsSorted: () => {
      const found = sorting.find((s) => s.id === col._id);
      if (!found) return false;
      return found.desc ? 'desc' : 'asc';
    },
    toggleSorting: (desc?: boolean) => {
      handleSortingChange(() => {
        const nextDesc = desc ?? false;
        return [{ id: col._id, desc: nextDesc }];
      });
    },
  });

  // Build row helpers from data
  const allRowHelpers = useMemo(() => {
    return data.map((item, index): RowHelper<TData> => {
      const id = String(index);
      return {
        original: item,
        index,
        id,
        getValue: (key: string) => getAccessorValue(item, key),
        getIsSelected: () => !!rowSelection[id],
        toggleSelected: (selected?: boolean) => {
          handleRowSelectionChange((prev) => {
            const next = { ...prev };
            const newValue = selected ?? !prev[id];
            if (newValue) {
              next[id] = true;
            } else {
              delete next[id];
            }
            return next;
          });
        },
        getIsExpanded: () => !!rowExpansion[id],
        toggleExpanded: () => {
          handleRowExpansionChange((prev) => {
            const next = { ...prev };
            if (prev[id]) {
              delete next[id];
            } else {
              next[id] = true;
            }
            return next;
          });
        },
        getCanExpand: () => {
          if (!renderExpandedRow) return false;
          if (getRowCanExpand) return getRowCanExpand(item, index);
          return true;
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, rowSelection, rowExpansion, renderExpandedRow, getRowCanExpand]);

  // Apply client-side global filter
  const filteredRows = useMemo(() => {
    if (!enableFiltering || !globalFilter) return allRowHelpers;
    const lowerFilter = globalFilter.toLowerCase();
    return allRowHelpers.filter((row) => {
      // Match against all accessor columns
      const cols = resolvedColumns.length > 0 ? resolvedColumns : [];
      if (cols.length === 0) {
        // Freeform mode — match against all string values
        return Object.values(row.original as any).some(
          (v) => v != null && String(v).toLowerCase().includes(lowerFilter),
        );
      }
      return cols.some((col) => {
        if (!col.accessorKey) return false;
        const val = getAccessorValue(row.original, col.accessorKey);
        return val != null && String(val).toLowerCase().includes(lowerFilter);
      });
    });
  }, [allRowHelpers, enableFiltering, globalFilter, resolvedColumns]);

  // Apply client-side sorting
  const sortedRows = useMemo(() => {
    if (!enableSorting || manualSorting || sorting.length === 0) return filteredRows;
    const { id: sortId, desc } = sorting[0];
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aVal = getAccessorValue(a.original, sortId);
      const bVal = getAccessorValue(b.original, sortId);
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return desc ? 1 : -1;
      if (aVal > bVal) return desc ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [filteredRows, enableSorting, manualSorting, sorting]);

  // Total rows count (for display and pagination)
  const totalRows = rowCount ?? sortedRows.length;

  // Apply client-side pagination
  const paginatedRows = useMemo(() => {
    if (!enablePagination || isManualPagination) return sortedRows;
    const start = effectivePageIndex * effectivePageSize;
    return sortedRows.slice(start, start + effectivePageSize);
  }, [sortedRows, enablePagination, isManualPagination, effectivePageIndex, effectivePageSize]);

  // The rows to render
  const displayRows = enablePagination ? paginatedRows : sortedRows;

  const totalPages = enablePagination
    ? Math.ceil(totalRows / effectivePageSize)
    : 1;
  const currentPage = effectivePageIndex + 1;

  const selectedCount = Object.keys(rowSelection).length;

  // Page change handler
  const handlePageChange = (newPageIndex: number) => {
    setInternalPageIndex(newPageIndex);
    onPageChange?.({ pageIndex: newPageIndex, pageSize: effectivePageSize });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setInternalPageSize(newPageSize);
    setInternalPageIndex(0);
    onPageChange?.({ pageIndex: 0, pageSize: newPageSize });
  };

  // Select-all for current page
  const isAllPageRowsSelected = displayRows.length > 0 &&
    displayRows.every((row) => rowSelection[row.id]);
  const toggleAllPageRowsSelected = (selected: boolean) => {
    handleRowSelectionChange((prev) => {
      const next = { ...prev };
      displayRows.forEach((row) => {
        if (selected) {
          next[row.id] = true;
        } else {
          delete next[row.id];
        }
      });
      return next;
    });
  };

  const isFreeform = !!renderRow;

  // Render header for a column
  const renderColumnHeader = (col: typeof resolvedColumns[number]) => {
    const colHelper = makeColumnHelper(col);

    // Special handling for select column
    if (col.id === 'select' && enableRowSelection) {
      return (
        <Checkbox
          checked={isAllPageRowsSelected}
          onChange={(e) => toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      );
    }

    if (typeof col.header === 'function') {
      return col.header({ column: colHelper });
    }
    return col.header ?? col._id;
  };

  // Render cell for a column and row
  const renderColumnCell = (col: typeof resolvedColumns[number], row: RowHelper<TData>, displayIndex: number) => {
    // Override select column cell to support shift-click
    if (col.id === 'select' && enableRowSelection) {
      return (
        <div
          className="data-table-select-cell"
          role="checkbox"
          aria-checked={row.getIsSelected()}
          aria-label="Select row"
          onClick={(e: React.MouseEvent) => {
            const checked = !row.getIsSelected();
            handleRowCheckboxClick(displayIndex, checked, e.shiftKey, displayRows);
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onChange={() => {}}
            tabIndex={-1}
            aria-hidden
          />
        </div>
      );
    }
    const value = col.accessorKey ? getAccessorValue(row.original, col.accessorKey) : undefined;
    if (col.cell) {
      return col.cell({ row, value });
    }
    return value != null ? String(value) : '';
  };

  return (
    <div className={clsx('data-table', className)}>
      <div className="data-table-content better-scroll">
        {isFreeform ? (
          /* ── Freeform mode ── */
          <div className="data-table-freeform">
            {renderHeader && (
              <div className="data-table-freeform-header">
                {renderHeader()}
              </div>
            )}
            <div className="data-table-freeform-body">
              {displayRows.length > 0 ? (
                displayRows.map((row) => (
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
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead key={col._id} className={col.className}>
                    {renderColumnHeader(col)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length > 0 ? (
                displayRows.map((row, displayIndex) => (
                  <Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      className={clsx(expandOnRowClick && row.getCanExpand() && 'data-table-row-expandable')}
                      onClick={expandOnRowClick && row.getCanExpand() ? () => row.toggleExpanded() : undefined}
                    >
                      {visibleColumns.map((col) => (
                        <TableCell key={col._id} className={col.className}>
                          {renderColumnCell(col, row, displayIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                    {renderExpandedRow && row.getIsExpanded() && (
                      <tr className="data-table-expanded-row">
                        <td colSpan={visibleColumns.length} className="data-table-expanded-cell">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length}>
                    <div className="data-table-no-results">
                      {noResults ?? 'No results.'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {enablePagination && (
        <DataTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => handlePageChange(page - 1)}
          pageSize={effectivePageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={handlePageSizeChange}
          totalRows={totalRows}
          selectedCount={enableRowSelection ? selectedCount : undefined}
          controlSize={controlSize}
          siblingCount={siblingCount}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
