import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
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

const columns: ColumnDef<Product, any>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const cat = row.getValue('category') as string;
      return <Badge size="sm" color={categoryColor[cat] ?? 'default'}>{cat}</Badge>;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.getValue('price')),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
];

// ── Simulate server fetch ──────────────────────────────────────────

function fakeServerFetch(pageIndex: number, pageSize: number) {
  const start = pageIndex * pageSize;
  return {
    rows: allProducts.slice(start, start + pageSize),
    totalCount: allProducts.length,
  };
}

// ── Page ───────────────────────────────────────────────────────────

export const ServerPaginationPage = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const { rows, totalCount } = useMemo(
    () => fakeServerFetch(pageIndex, pageSize),
    [pageIndex, pageSize],
  );

  return (
    <div className="page-content max-w-[64rem]">
      <h1 className="heading-1 mb-2">Server-Side Pagination</h1>
      <p className="text-muted mb-8">
        DataTable receives only the current page of data. The <code>rowCount</code> prop
        tells it the total rows on the server so the built-in footer (pagination, page-size,
        row info) works correctly without loading all data at once.
      </p>

      <section className="mb-12">
        <h2 className="heading-3 mb-4">Simulated Server Fetch</h2>
        <p className="text-muted mb-4">
          73 products total — only {pageSize} loaded per page.
          Page {pageIndex + 1} of {Math.ceil(totalCount / pageSize)}.
        </p>
        <DataTable
          data={rows}
          columns={columns}
          enableSorting
          enablePagination
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          rowCount={totalCount}
          onPageChange={({ pageIndex: pi, pageSize: ps }) => {
            setPageIndex(pi);
            setPageSize(ps);
          }}
        />
      </section>
    </div>
  );
};
