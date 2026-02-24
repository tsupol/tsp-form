import { useState, useMemo } from 'react';
import type { SortingState, Updater } from '../components/DataTable';

type UseDataSourceOptions<TData> = {
  data?: TData[];
  pageSize?: number;
  defaultSorting?: SortingState;
};

export function useDataSource<TData>(options?: UseDataSourceOptions<TData>) {
  const { data, pageSize: initialPageSize = 10, defaultSorting = [] } = options ?? {};

  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(next);
    setPageIndex(0);
  };

  const handlePageChange = ({ pageIndex: pi, pageSize: ps }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pi);
    setPageSize(ps);
  };

  // Client-side processing (when data is provided)
  const { rows, rowCount } = useMemo(() => {
    if (!data) return { rows: [] as TData[], rowCount: 0 };

    let processed = [...data];

    // Sort
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      processed.sort((a, b) => {
        const aVal = (a as any)[id];
        const bVal = (b as any)[id];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
        return 0;
      });
    }

    const total = processed.length;

    // Paginate
    const start = pageIndex * pageSize;
    const paged = processed.slice(start, start + pageSize);

    return { rows: paged, rowCount: total };
  }, [data, sorting, pageIndex, pageSize]);

  const tableProps = {
    sorting,
    onSortingChange: handleSortingChange,
    pageIndex,
    pageSize,
    onPageChange: handlePageChange,
    enableSorting: true as const,
    manualSorting: true as const,
    enablePagination: true as const,
  };

  return {
    sorting,
    pageIndex,
    pageSize,
    tableProps,
    rows,
    rowCount,
  };
}
