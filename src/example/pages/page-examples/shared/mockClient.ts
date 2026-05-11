// Mock API client that mimics the consumer's apiClient interface.
// The real apiClient (in frontend-tsp-form/src/lib/api.ts) talks to PostgREST;
// this one reads from in-memory fixtures so the example pages can demo the UX
// without a backend.
//
// Endpoints mimicked here are intentionally close to PostgREST shape so the
// example pages look like the real production code:
//   apiClient.get<T>(url)                          → GET /v_xxx?filter=eq.foo&order=created_at.desc
//   apiClient.getPaginated<T>(url, { page, pageSize }) → same + paginated envelope
//   apiClient.rpc<T>(name, params)                 → POST /rpc/fn_xxx

import { fixtures, type Po, type Asset, type User } from './fixtures';

const LATENCY_MS = 150;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── URL parser ──────────────────────────────────────────────────────────────
// Parses PostgREST-style "?col=eq.value&col2=ilike.*foo*&order=created_at.desc"
interface ParsedUrl {
  table: string;
  filters: { col: string; op: string; value: string }[];
  order: { col: string; desc: boolean }[];
  search: { cols: string[]; needle: string } | null;
}

function parseUrl(url: string): ParsedUrl {
  const [pathPart, queryPart = ''] = url.replace(/^\/+/, '').split('?');
  const table = pathPart;
  const params = new URLSearchParams(queryPart);
  const filters: ParsedUrl['filters'] = [];
  const order: ParsedUrl['order'] = [];
  let search: ParsedUrl['search'] = null;

  params.forEach((rawValue, key) => {
    if (key === 'order') {
      rawValue.split(',').forEach((spec) => {
        const [col, dir] = spec.split('.');
        order.push({ col, desc: dir === 'desc' });
      });
      return;
    }
    if (key === 'or') {
      // or=(username.ilike.*x*,email.ilike.*x*)
      const inner = rawValue.replace(/^\(/, '').replace(/\)$/, '');
      const parts = inner.split(',');
      const cols: string[] = [];
      let needle = '';
      parts.forEach((p) => {
        const [col, , val] = p.split('.');
        cols.push(col);
        needle = (val ?? '').replace(/^\*|\*$/g, '');
      });
      search = { cols, needle };
      return;
    }
    // col=eq.value | col=ilike.*x* | col=in.(A,B)
    const dot = rawValue.indexOf('.');
    const op = rawValue.slice(0, dot);
    const value = rawValue.slice(dot + 1);
    filters.push({ col: key, op, value });
  });

  return { table, filters, order, search };
}

function matchesFilter(row: Record<string, unknown>, f: { col: string; op: string; value: string }): boolean {
  const v = row[f.col];
  if (f.op === 'eq') return String(v) === f.value;
  if (f.op === 'is') {
    if (f.value === 'true') return v === true;
    if (f.value === 'false') return v === false;
    if (f.value === 'null') return v === null || v === undefined;
    return false;
  }
  if (f.op === 'ilike') {
    const needle = f.value.replace(/^\*|\*$/g, '').toLowerCase();
    return typeof v === 'string' && v.toLowerCase().includes(needle);
  }
  if (f.op === 'in') {
    const list = f.value.replace(/^\(/, '').replace(/\)$/, '').split(',');
    return list.includes(String(v));
  }
  return true;
}

function applyFilters<T extends Record<string, unknown>>(rows: T[], parsed: ParsedUrl): T[] {
  let out = rows;
  if (parsed.filters.length > 0) {
    out = out.filter((row) => parsed.filters.every((f) => matchesFilter(row, f)));
  }
  if (parsed.search && parsed.search.needle) {
    const { cols, needle } = parsed.search;
    const n = needle.toLowerCase();
    out = out.filter((row) =>
      cols.some((c) => {
        const v = row[c];
        return typeof v === 'string' && v.toLowerCase().includes(n);
      }),
    );
  }
  if (parsed.order.length > 0) {
    const sorted = out.slice();
    sorted.sort((a, b) => {
      for (const o of parsed.order) {
        const av = a[o.col];
        const bv = b[o.col];
        if (av === bv) continue;
        if (av === null || av === undefined) return o.desc ? 1 : -1;
        if (bv === null || bv === undefined) return o.desc ? -1 : 1;
        if (av! < bv!) return o.desc ? 1 : -1;
        if (av! > bv!) return o.desc ? -1 : 1;
      }
      return 0;
    });
    out = sorted;
  }
  return out;
}

// ── Table router ────────────────────────────────────────────────────────────
type AnyRow = Record<string, unknown>;

function getTable(name: string): AnyRow[] {
  switch (name) {
    case 'v_purchase_orders': return fixtures.purchaseOrders as unknown as AnyRow[];
    case 'v_po_detail': return fixtures.purchaseOrders as unknown as AnyRow[];
    case 'v_assets': return fixtures.assets as unknown as AnyRow[];
    case 'v_users': return fixtures.users as unknown as AnyRow[];
    case 'v_roles': return fixtures.roles as unknown as AnyRow[];
    case 'v_companies': return fixtures.companies as unknown as AnyRow[];
    case 'v_branches': return fixtures.branches as unknown as AnyRow[];
    case 'v_holdings': return fixtures.holdings as unknown as AnyRow[];
    case 'v_ref_po_statuses': return fixtures.poStatusRefs as unknown as AnyRow[];
    case 'v_ref_owner_types': return fixtures.ownershipRefs as unknown as AnyRow[];
    default: return [];
  }
}

// ── Public API ──────────────────────────────────────────────────────────────
export const mockClient = {
  async get<T>(url: string): Promise<T> {
    await sleep(LATENCY_MS);
    const parsed = parseUrl(url);
    const rows = getTable(parsed.table);
    const out = applyFilters(rows, parsed);
    return out as unknown as T;
  },

  async getPaginated<T>(
    url: string,
    { page, pageSize }: { page: number; pageSize: number },
  ): Promise<{ data: T[]; totalCount: number }> {
    await sleep(LATENCY_MS);
    const parsed = parseUrl(url);
    const rows = getTable(parsed.table);
    const filtered = applyFilters(rows, parsed);
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);
    return { data: slice as unknown as T[], totalCount: filtered.length };
  },

  async rpc<T>(name: string, params: Record<string, unknown>): Promise<T> {
    await sleep(LATENCY_MS);
    switch (name) {
      case 'fn_po_submit':
      case 'fn_po_approve':
      case 'fn_po_reject':
      case 'fn_po_cancel':
      case 'fn_po_close':
      case 'fn_po_revert_to_draft': {
        const id = Number(params.p_po_id);
        const po = fixtures.purchaseOrders.find((p) => p.po_id === id);
        if (!po) throw new Error('PO not found');
        if (name === 'fn_po_submit') po.status = 'PENDING_APPROVAL';
        if (name === 'fn_po_approve') { po.status = 'APPROVED'; po.approved_at = new Date().toISOString(); }
        if (name === 'fn_po_reject') po.status = 'REJECTED';
        if (name === 'fn_po_cancel') { po.status = 'CANCELLED'; po.cancelled_at = new Date().toISOString(); }
        if (name === 'fn_po_close') po.status = 'COMPLETED';
        if (name === 'fn_po_revert_to_draft') po.status = 'DRAFT';
        return {} as T;
      }
      case 'user_set_active': {
        const id = Number(params.p_user_id);
        const u = fixtures.users.find((x) => x.id === id);
        if (!u) throw new Error('User not found');
        u.is_active = Boolean(params.p_is_active);
        return {} as T;
      }
      case 'user_create': {
        const id = Math.max(...fixtures.users.map((u) => u.id)) + 1;
        const newUser: User = {
          id,
          username: String(params.p_username),
          role_code: String(params.p_role_code),
          role_scope: fixtures.roles.find((r) => r.code === params.p_role_code)?.scope ?? 'HOLDING',
          holding_id: 1,
          holding_code: 'TSP',
          holding_name: 'TSP Holding',
          company_id: params.p_company_id ? Number(params.p_company_id) : null,
          company_code: null,
          company_name: params.p_company_id ? fixtures.companies.find((c) => c.id === Number(params.p_company_id))?.name ?? null : null,
          branch_id: params.p_branch_id ? Number(params.p_branch_id) : null,
          branch_code: null,
          branch_name: params.p_branch_id ? fixtures.branches.find((b) => b.id === Number(params.p_branch_id))?.name ?? null : null,
          is_active: true,
          must_change_password: true,
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        fixtures.users.unshift(newUser);
        return {} as T;
      }
      case 'user_update': {
        const id = Number(params.p_user_id);
        const u = fixtures.users.find((x) => x.id === id);
        if (!u) throw new Error('User not found');
        u.username = String(params.p_username);
        u.role_code = String(params.p_role_code);
        u.role_scope = fixtures.roles.find((r) => r.code === params.p_role_code)?.scope ?? u.role_scope;
        u.company_id = params.p_company_id ? Number(params.p_company_id) : null;
        u.branch_id = params.p_branch_id ? Number(params.p_branch_id) : null;
        u.is_active = Boolean(params.p_is_active);
        u.updated_at = new Date().toISOString();
        return {} as T;
      }
      case 'user_change_role': {
        const id = Number(params.p_user_id);
        const u = fixtures.users.find((x) => x.id === id);
        if (!u) throw new Error('User not found');
        u.role_code = String(params.p_new_role_code);
        u.role_scope = fixtures.roles.find((r) => r.code === params.p_new_role_code)?.scope ?? u.role_scope;
        return {} as T;
      }
      case 'user_set_password':
      case 'user_reset_password': {
        if (name === 'user_reset_password') {
          return { temp_password: 'Temp-' + Math.random().toString(36).slice(2, 8) } as unknown as T;
        }
        return {} as T;
      }
      default:
        return {} as T;
    }
  },
};

export type { Po, Asset, User };
