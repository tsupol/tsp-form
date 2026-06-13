// Demonstrates how to retheme DataTable rows via CSS custom properties.
//
// The library exposes these tokens:
//
//   --color-table-row-tint      base hue, defaults to --color-primary
//   --color-table-row-bg        rest background (default transparent)
//   --color-table-row-hover     hover background (default 6% mix of tint)
//   --color-table-row-selected  selected background (default 8% mix of tint)
//   --color-table-row-active    active background (default 14% mix of tint)
//   --color-table-row-disabled  disabled background (default transparent)
//
// Consumers override them at any scope — :root for project-wide, inline style
// on a wrapper for a per-section retheme, or a className for several instances.
// No new prop, no library code change. This page demonstrates four patterns.
//
// Selection state is wired by setting `data-state="selected"` on the row, via
// either tanstack row selection (row.getIsSelected()) or the freeform
// `getRowProps` escape hatch shown below.

import { useState } from 'react';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { Badge } from '../../components/Badge';

type Row = {
  id: string;
  city: string;
  population: string;
  status: 'OK' | 'WARN' | 'ALERT';
};

const rows: Row[] = [
  { id: '1', city: 'Bangkok',     population: '10.5 M', status: 'OK' },
  { id: '2', city: 'Chiang Mai',  population: '1.2 M',  status: 'OK' },
  { id: '3', city: 'Pattaya',     population: '1.0 M',  status: 'WARN' },
  { id: '4', city: 'Phuket',      population: '0.4 M',  status: 'OK' },
  { id: '5', city: 'Hat Yai',     population: '0.4 M',  status: 'ALERT' },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'city',       header: 'City' },
  { accessorKey: 'population', header: 'Population' },
  { accessorKey: 'status',     header: 'Status' },
];

function StatusBadge({ status }: { status: Row['status'] }) {
  const color = status === 'OK' ? 'success' : status === 'WARN' ? 'warning' : 'danger';
  return <Badge size="sm" color={color}>{status}</Badge>;
}

function FreeformRow({ row }: { row: Row }) {
  return (
    <div className="flex items-center px-3 py-2 gap-3 w-full">
      <div className="flex-1 min-w-0 text-sm font-medium truncate">{row.city}</div>
      <div className="w-24 text-sm text-subtle tabular-nums">{row.population}</div>
      <StatusBadge status={row.status} />
    </div>
  );
}

export function TableThemingPage() {
  const [selectedDefault, setSelectedDefault] = useState<string | null>('2');
  const [selectedDanger, setSelectedDanger] = useState<string | null>('5');
  const [selectedNeutral, setSelectedNeutral] = useState<string | null>('3');
  const [selectedInline, setSelectedInline] = useState<string | null>('1');

  return (
    <div className="page-content">
      <h1 className="heading-1 mb-1">Table theming</h1>
      <p className="text-subtle mb-6">
        Customize row colors per scope by overriding CSS custom properties. No
        new prop, no library code change.
      </p>

      {/* ── 1. Default theme ─────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="heading-3 mb-1">1. Default (primary tint)</h2>
        <p className="text-subtle text-sm mb-3">
          Out of the box. Hover is a 6% primary mix; selected is 8%. Click a row
          to select it.
        </p>
        <DataTable
          data={rows}
          columns={columns}
          renderRow={(row) => <FreeformRow row={row.original} />}
          getRowProps={(row) => ({
            'data-state': row.original.id === selectedDefault ? 'selected' : undefined,
            onClick: () => setSelectedDefault(row.original.id),
            style: { cursor: 'pointer' },
          })}
        />
      </section>

      {/* ── 2. Per-section override via a wrapper ────────────────────────── */}
      <section className="mb-10">
        <h2 className="heading-3 mb-1">2. Per-section override</h2>
        <p className="text-subtle text-sm mb-3">
          Wrap the subtree in any element and override the tokens via inline
          style. Only the wrapped table is affected; siblings stay default.
        </p>
        <div
          style={{
            // Override the tint — hover and selected derive from it.
            '--color-table-row-tint': 'var(--color-danger)',
          } as React.CSSProperties}
        >
          <DataTable
            data={rows}
            columns={columns}
            renderRow={(row) => <FreeformRow row={row.original} />}
            getRowProps={(row) => ({
              'data-state': row.original.id === selectedDanger ? 'selected' : undefined,
              onClick: () => setSelectedDanger(row.original.id),
              style: { cursor: 'pointer' },
            })}
          />
        </div>
      </section>

      {/* ── 3. Themed by a className ─────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="heading-3 mb-1">3. Themed by a className</h2>
        <p className="text-subtle text-sm mb-3">
          When several tables should share a theme, expose a class once and
          reuse it. (See <code>.muted-rows</code> rule defined below the page.)
        </p>
        <div className="muted-rows">
          <DataTable
            data={rows}
            columns={columns}
            renderRow={(row) => <FreeformRow row={row.original} />}
            getRowProps={(row) => ({
              'data-state': row.original.id === selectedNeutral ? 'selected' : undefined,
              onClick: () => setSelectedNeutral(row.original.id),
              style: { cursor: 'pointer' },
            })}
          />
        </div>
        <style>{`
          .muted-rows {
            --color-table-row-hover: var(--color-surface-hover);
            --color-table-row-selected: var(--color-surface-hover);
          }
        `}</style>
      </section>

      {/* ── 4. Per-row inline override ───────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="heading-3 mb-1">4. Per-row inline override</h2>
        <p className="text-subtle text-sm mb-3">
          Override on the row itself via <code>getRowProps</code> → <code>style</code>.
          Rare, but useful for one-off accents (e.g., highlight today's row).
        </p>
        <DataTable
          data={rows}
          columns={columns}
          renderRow={(row) => <FreeformRow row={row.original} />}
          getRowProps={(row) => ({
            'data-state': row.original.id === selectedInline ? 'selected' : undefined,
            onClick: () => setSelectedInline(row.original.id),
            style: {
              cursor: 'pointer',
              // Highlight ALERT rows with a danger tint that's stronger than
              // the default hover — overrides on the single row.
              ...(row.original.status === 'ALERT' && {
                '--color-table-row-hover': 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
                '--color-table-row-tint': 'var(--color-danger)',
              }),
            },
          })}
        />
      </section>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="heading-3 mb-1">Notes</h2>
        <ul className="text-sm text-subtle list-disc pl-5 space-y-1">
          <li>
            Tokens cascade through the DOM. <code>:root</code> wins app-wide,
            a wrapper wins for its subtree, an inline style wins for one row.
          </li>
          <li>
            Selection is signalled by <code>data-state="selected"</code>. Use
            tanstack's <code>row.getIsSelected()</code> if you wired it, or
            pass <code>data-state</code> via <code>getRowProps</code> when you
            track selection in component state.
          </li>
          <li>
            Consumer Tailwind classes like <code>hover:bg-*</code> on the row
            content will <em>override</em> the token-driven hover — leave the
            row container free of those classes if you want themed hover.
          </li>
        </ul>
      </section>
    </div>
  );
}
