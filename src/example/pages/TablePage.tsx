import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from '../../components/Table';
import { DataTable, DataTableColumnHeader, createSelectColumn } from '../../components/DataTable';
import { Input } from '../../components/Input';

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

const statusStyle: Record<string, string> = {
  success: 'color: #22c55e',
  processing: 'color: #f59e0b',
  pending: 'color: #6b7280',
  failed: 'color: #ef4444',
};

const paymentColumns: ColumnDef<Payment, any>[] = [
  createSelectColumn<Payment>(),
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span style={{ [statusStyle[status].split(': ')[0]]: statusStyle[status].split(': ')[1], fontWeight: 500, textTransform: 'capitalize' as const }}>
          {status}
        </span>
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
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

// ── Page ────────────────────────────────────────────────────────────

export const TablePage = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  return (
    <div className="page-content" style={{ maxWidth: '64rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Table & DataTable</h1>

      {/* ── Section 1: Basic Table ── */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Basic Table</h2>
        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>
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
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>DataTable — Columns Mode</h2>
        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>
          Full-featured data table with sorting, filtering, pagination, and row selection.
        </p>
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
          toolbar={(table) => (
            <div className="data-table-toolbar">
              <Input
                placeholder="Filter emails..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                style={{ maxWidth: '16rem' }}
                size="sm"
              />
            </div>
          )}
        />
      </section>

      {/* ── Section 3: DataTable (freeform mode) ── */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>DataTable — Freeform Mode</h2>
        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>
          Card-style rows using <code>renderRow</code> with div-based layout.
        </p>
        <DataTable
          data={users}
          enablePagination
          pageSize={4}
          pageSizeOptions={[4, 8, 12]}
          size="sm"
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
                <div style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: `${roleColor[user.role]}20`,
                  color: roleColor[user.role],
                }}>
                  {user.role}
                </div>
                <div style={{ fontSize: '0.8125rem', opacity: 0.5, whiteSpace: 'nowrap' }}>
                  {user.joinedDate}
                </div>
              </div>
            );
          }}
        />
      </section>

      {/* ── Section 4: Striped variant ── */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Striped Table</h2>
        <DataTable
          data={payments.slice(0, 8)}
          columns={[
            { accessorKey: 'id', header: 'ID' },
            { accessorKey: 'email', header: 'Email' },
            {
              accessorKey: 'amount',
              header: 'Amount',
              cell: ({ row }) => {
                const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.getValue('amount'));
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
