import { useState, useEffect } from 'react';
import { type ColumnDef, type SortingState } from '../../components/DataTable';
import { DataTable, DataTableColumnHeader } from '../../components/DataTable';
import { Badge } from '../../components/Badge';

// ── Fake server dataset (73 products) ──────────────────────────────

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
};

const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const allProducts: Product[] = Array.from({ length: 73 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  category: categories[i % 5],
  price: Math.round((10 + ((i * 37 + 13) % 200)) * 100) / 100,
  stock: (i * 17 + 3) % 150,
}));

const categoryColor: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  Electronics: 'primary',
  Clothing: 'secondary',
  Books: 'success',
  Home: 'warning',
  Sports: 'danger',
};

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ value }) => {
      const cat = value as string;
      return <Badge size="sm" color={categoryColor[cat] ?? 'default'}>{cat}</Badge>;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ value }) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
];

// ── Simulate server fetch ──────────────────────────────────────────

function fakeServerFetch(pageIndex: number, pageSize: number, sorting: SortingState) {
  let sorted = [...allProducts];
  if (sorting.length > 0) {
    const { id, desc } = sorting[0];
    sorted.sort((a, b) => {
      const aVal = a[id as keyof Product];
      const bVal = b[id as keyof Product];
      if (aVal < bVal) return desc ? 1 : -1;
      if (aVal > bVal) return desc ? -1 : 1;
      return 0;
    });
  }
  const start = pageIndex * pageSize;
  return {
    rows: sorted.slice(start, start + pageSize),
    totalCount: sorted.length,
  };
}

// ── Page ───────────────────────────────────────────────────────────

export const ServerPaginationPage = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [rows, setRows] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = fakeServerFetch(pageIndex, pageSize, sorting);
      setRows(result.rows);
      setTotalCount(result.totalCount);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pageIndex, pageSize, sorting]);

  return (
    <div className="page-content h-dvh max-h-dvh max-w-[64rem] flex flex-col overflow-hidden">
      <h1 className="heading-1 mb-2 flex-none">Server-Side Pagination</h1>
      <p className="text-muted mb-4 flex-none">
        DataTable receives only the current page of data. Controlled <code>pageIndex</code> and
        {' '}<code>manualSorting</code> let the consumer own pagination and sort state.
        Sorting resets to page 1 and data is sorted server-side before slicing.
      </p>

      <section className="flex-1 min-h-0 flex flex-col">
        <h2 className="heading-3 mb-4 flex-none">Simulated Server Fetch</h2>
        <p className="text-muted mb-4 flex-none">
          73 products total — only {pageSize} loaded per page.
          Page {pageIndex + 1} of {Math.ceil(totalCount / pageSize)}.
        </p>
        <DataTable
          data={rows}
          columns={columns}
          enableSorting
          manualSorting
          enablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          rowCount={totalCount}
          sorting={sorting}
          onSortingChange={(updater) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(next);
            setPageIndex(0);
          }}
          onPageChange={({ pageIndex: pi, pageSize: ps }) => {
            setPageIndex(pi);
            setPageSize(ps);
          }}
          className="flex-1 min-h-0"
        />
      </section>
    </div>
  );
};
