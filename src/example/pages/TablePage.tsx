import { useState } from 'react';
import { type ColumnDef } from '../../components/DataTable';
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from '../../components/Table';
import { DataTable, DataTableColumnHeader, createSelectColumn, createExpandColumn } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PopOver } from '../../components/PopOver';
import { MenuItem, MenuSeparator } from '../../components/Menu';
import { Copy, Trash2, Eye, Ellipsis } from 'lucide-react';

// ── Basic Table data ────────────────────────────────────────────────

const invoices = [
  { invoice: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { invoice: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  { invoice: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
  { invoice: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
  { invoice: 'INV006', status: 'Pending', method: 'Bank Transfer', amount: '$200.00' },
  { invoice: 'INV007', status: 'Unpaid', method: 'Credit Card', amount: '$300.00' },
];

// ── DataTable column mode data ──────────────────────────────────────

type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

const payments: Payment[] = [
  { id: 'pay_001', amount: 316, status: 'success', email: 'ken99@yahoo.com' },
  { id: 'pay_002', amount: 242, status: 'success', email: 'abe45@gmail.com' },
  { id: 'pay_003', amount: 837, status: 'processing', email: 'monserrat44@gmail.com' },
  { id: 'pay_004', amount: 874, status: 'success', email: 'silas22@gmail.com' },
  { id: 'pay_005', amount: 721, status: 'failed', email: 'carmella@hotmail.com' },
  { id: 'pay_006', amount: 150, status: 'pending', email: 'john.doe@example.com' },
  { id: 'pay_007', amount: 499, status: 'success', email: 'sarah.j@outlook.com' },
  { id: 'pay_008', amount: 620, status: 'processing', email: 'mike.r@company.co' },
  { id: 'pay_009', amount: 310, status: 'success', email: 'lisa.w@gmail.com' },
  { id: 'pay_010', amount: 188, status: 'failed', email: 'robert.b@yahoo.com' },
  { id: 'pay_011', amount: 945, status: 'success', email: 'emma.t@gmail.com' },
  { id: 'pay_012', amount: 432, status: 'pending', email: 'david.k@outlook.com' },
  { id: 'pay_013', amount: 275, status: 'success', email: 'nina.p@company.co' },
  { id: 'pay_014', amount: 560, status: 'processing', email: 'alex.m@gmail.com' },
  { id: 'pay_015', amount: 180, status: 'failed', email: 'olivia.r@yahoo.com' },
];

const statusBadgeColor: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
  success: 'success',
  processing: 'warning',
  pending: 'default',
  failed: 'danger',
};

const paymentColumns: ColumnDef<Payment>[] = [
  createSelectColumn<Payment>(),
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ value }) => {
      const status = value as string;
      return (
        <Badge size="sm" color={statusBadgeColor[status] ?? 'default'} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ value }) => {
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      return <span style={{ fontWeight: 500 }}>{formatted}</span>;
    },
  },
];

// ── Freeform mode data ──────────────────────────────────────────────

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
};

const users: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', joinedDate: '2023-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', joinedDate: '2023-03-22' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Designer', joinedDate: '2023-05-10' },
  { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'Manager', joinedDate: '2023-06-01' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Developer', joinedDate: '2023-07-14' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Designer', joinedDate: '2023-08-20' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Developer', joinedDate: '2023-09-05' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'Admin', joinedDate: '2023-10-11' },
  { id: 9, name: 'Ivy Chen', email: 'ivy@example.com', role: 'Manager', joinedDate: '2023-11-30' },
  { id: 10, name: 'Jack Taylor', email: 'jack@example.com', role: 'Developer', joinedDate: '2024-01-08' },
  { id: 11, name: 'Karen White', email: 'karen@example.com', role: 'Designer', joinedDate: '2024-02-14' },
  { id: 12, name: 'Leo Harris', email: 'leo@example.com', role: 'Developer', joinedDate: '2024-03-20' },
];

const roleColor: Record<string, string> = {
  Admin: '#ef4444',
  Developer: '#0070f3',
  Designer: '#8b5cf6',
  Manager: '#f59e0b',
};

const roleBadgeColor: Record<string, 'danger' | 'primary' | 'secondary' | 'warning'> = {
  Admin: 'danger',
  Developer: 'primary',
  Designer: 'secondary',
  Manager: 'warning',
};

// ── Row Actions Menu (for expandOnRowClick example) ────────────────

function RowActionsMenu({ payment }: { payment: Payment }) {
  const [open, setOpen] = useState(false);
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div onClick={(e) => e.stopPropagation()}>
      <PopOver
        isOpen={open}
        onClose={() => setOpen(false)}
        placement="bottom"
        align="end"
        trigger={
          <Button
            variant="ghost"
            color="default"
            size="sm"
            className="btn-icon-sm"
            aria-label="Actions"
            onClick={() => setOpen((v) => !v)}
          >
            <Ellipsis size={16} />
          </Button>
        }
      >
        <div className="py-1 min-w-[140px]">
          <MenuItem icon={<Eye size={16} />} label="View" onClick={() => { alert(`View ${payment.id}`); setOpen(false); }} />
          <MenuItem icon={<Copy size={16} />} label="Copy email" onClick={() => { navigator.clipboard.writeText(payment.email); setOpen(false); }} />
          <MenuSeparator />
          <MenuItem icon={<Trash2 size={16} />} label="Delete" danger onClick={() => { alert(`Delete ${payment.id}`); setOpen(false); }} />
        </div>
      </PopOver>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export const TablePage = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  return (
    <div className="page-content max-w-[64rem]">
      <h1 className="heading-1 mb-8">Table & DataTable</h1>

      {/* ── Section 1: Basic Table ── */}
      <section className="mb-12">
        <h2 className="heading-3 mb-4">Basic Table</h2>
        <p className="text-muted mb-4">
          Presentational Table primitives wrapping native HTML table elements.
        </p>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: '6rem' }}>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.invoice}>
                <TableCell style={{ fontWeight: 500 }}>{inv.invoice}</TableCell>
                <TableCell>{inv.status}</TableCell>
                <TableCell>{inv.method}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{inv.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell style={{ textAlign: 'right' }}>$2,250.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      {/* ── Section 2: DataTable (columns mode) ── */}
      <section className="mb-12">
        <h2 className="heading-3 mb-4">DataTable — Columns Mode</h2>
        <p className="text-muted mb-4">
          Full-featured data table with sorting, filtering, pagination, and row selection.
        </p>
        <div className="data-table-toolbar">
          <Input
            placeholder="Filter emails..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ maxWidth: '16rem' }}
            size="sm"
          />
        </div>
        <DataTable
          data={payments}
          columns={paymentColumns}
          enableSorting
          enableFiltering
          enablePagination
          enableRowSelection
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />

        <h3 className="heading-4 mt-8 mb-2">Scrollable (fixed-height container)</h3>
        <p className="text-muted mb-4">
          When placed in a height-constrained parent, the header stays sticky at the top,
          the body scrolls, and the pagination footer stays at the bottom.
        </p>
        <div style={{ height: '24rem' }}>
          <DataTable
            data={payments}
            columns={paymentColumns}
            enableSorting
            enablePagination
            pageSize={10}
            pageSizeOptions={[5, 10, 15]}
          />
        </div>
      </section>

      {/* ── Section 3: DataTable (freeform mode) ── */}
      <section className="mb-12">
        <h2 className="heading-3 mb-4">DataTable — Freeform Mode</h2>
        <p className="text-muted mb-4">
          Card-style rows using <code>renderRow</code> with div-based layout.
        </p>
        <DataTable
          data={users}
          enablePagination
          pageSize={4}
          pageSizeOptions={[4, 8, 12]}
          controlSize="sm"
          renderRow={(row) => {
            const user = row.original;
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                borderBottom: '1px solid var(--color-line)',
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: roleColor[user.role] ?? '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>{user.email}</div>
                </div>
                <Badge size="sm" color={roleBadgeColor[user.role] ?? 'default'}>
                  {user.role}
                </Badge>
                <div style={{ fontSize: '0.8125rem', opacity: 0.5, whiteSpace: 'nowrap' }}>
                  {user.joinedDate}
                </div>
              </div>
            );
          }}
        />
      </section>

      {/* ── Section 4: Expandable Rows ── */}
      <section className="mb-12">
        <h2 className="heading-3 mb-4">Expandable Rows</h2>
        <p className="text-muted mb-4">
          Use <code>renderExpandedRow</code> and <code>createExpandColumn</code> to add
          collapsible detail rows with a chevron toggle.
        </p>
        <DataTable
          data={payments}
          columns={[
            createExpandColumn<Payment>(),
            {
              accessorKey: 'status',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
              cell: ({ value }) => {
                const status = value as string;
                return (
                  <Badge size="sm" color={statusBadgeColor[status] ?? 'default'} className="capitalize">
                    {status}
                  </Badge>
                );
              },
            },
            {
              accessorKey: 'email',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            },
            {
              accessorKey: 'amount',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
              cell: ({ value }) => {
                const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                return <span style={{ fontWeight: 500 }}>{formatted}</span>;
              },
            },
          ]}
          renderExpandedRow={(row) => {
            const p = row.original;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                <div><strong>ID:</strong> {p.id}</div>
                <div><strong>Email:</strong> {p.email}</div>
                <div><strong>Amount:</strong> ${p.amount.toFixed(2)}</div>
                <div><strong>Status:</strong> {p.status}</div>
              </div>
            );
          }}
          enableSorting
          enablePagination
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
        />
      </section>

      {/* ── Section 4b: Expand on Row Click + Actions Menu ── */}
      <section className="mb-12">
        <h2 className="heading-3 mb-4">Expand on Row Click + Actions Menu</h2>
        <p className="text-muted mb-4">
          Use <code>expandOnRowClick</code> to expand rows by clicking anywhere on the row.
          Add an actions column with a menu button — <code>e.stopPropagation()</code> prevents the click from expanding the row.
        </p>
        <DataTable
          data={payments}
          columns={[
            {
              accessorKey: 'status',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
              cell: ({ value }) => {
                const status = value as string;
                return (
                  <Badge size="sm" color={statusBadgeColor[status] ?? 'default'} className="capitalize">
                    {status}
                  </Badge>
                );
              },
            },
            {
              accessorKey: 'email',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            },
            {
              accessorKey: 'amount',
              header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
              cell: ({ value }) => {
                const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                return <span style={{ fontWeight: 500 }}>{formatted}</span>;
              },
            },
            {
              id: 'actions',
              header: '',
              cell: ({ row }) => <RowActionsMenu payment={row.original} />,
              enableSorting: false,
              className: 'w-12',
            },
          ]}
          renderExpandedRow={(row) => {
            const p = row.original;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                <div><strong>ID:</strong> {p.id}</div>
                <div><strong>Email:</strong> {p.email}</div>
                <div><strong>Amount:</strong> ${p.amount.toFixed(2)}</div>
                <div><strong>Status:</strong> {p.status}</div>
              </div>
            );
          }}
          expandOnRowClick
          enableSorting
          enablePagination
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
        />
      </section>

      {/* ── Section 5: Striped variant ── */}
      <section className="mb-12">
        <h2 className="heading-3 mb-4">Striped Table</h2>
        <DataTable
          data={payments.slice(0, 8)}
          columns={[
            { accessorKey: 'id', header: 'ID' },
            { accessorKey: 'email', header: 'Email' },
            {
              accessorKey: 'amount',
              header: 'Amount',
              cell: ({ value }) => {
                const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                return formatted;
              },
            },
          ]}
          striped
        />
      </section>
    </div>
  );
};
