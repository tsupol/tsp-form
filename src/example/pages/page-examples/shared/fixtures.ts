// Mock fixtures. Field names mirror the production API
// (v_purchase_orders, v_po_detail, v_assets, v_users) so example pages
// can be cross-referenced with the real consumer code without renaming.

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export interface PoLine {
  line_id: number;
  model_id: number;
  model_name: string;
  model_code: string;
  sku_code: string;
  variant_id: number;
  variant_name: string;
  brand_name: string;
  family_name: string;
  qty: number;
  unit_cost: number;
  line_total: number;
}

export interface Po {
  po_id: number;
  po_no: string;
  holding_id: number;
  company_id: number;
  company_name: string;
  branch_id: number | null;
  branch_name: string | null;
  po_type: string;
  status: string;
  ownership: string;
  supplier_name: string | null;
  supplier_ref: string | null;
  total_lines: number;
  c_total_lines: number;
  c_total_qty: number;
  c_total_amount: number;
  c_received_qty: number;
  c_received_amount: number;
  outstanding_qty: number;
  outstanding_amount: number;
  received_percent: number;
  submitted_at: string | null;
  approved_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_by: number;
  created_at: string;
  lines: PoLine[];
}

export interface Asset {
  asset_id: number;
  holding_id: number;
  company_id: number;
  company_name: string;
  branch_id: number;
  branch_name: string;
  asset_code: string;
  current_bucket: string;
  condition_grade: string;
  original_cost_basis: number;
  current_cost_basis: number;
  original_retail_price: number;
  current_retail_price: number;
  variant_id: number;
  model_id: number;
  sku_code: string;
  variant_name: string;
  manufacturer_color: string | null;
  model_name: string;
  model_code: string;
  family_name: string;
  brand_name: string;
  serial_no: string | null;
  imei: string | null;
  is_contractable: boolean;
  is_sellable: boolean;
  source_po_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  role_code: string;
  role_scope: string;
  holding_id: number | null;
  holding_code: string | null;
  holding_name: string | null;
  company_id: number | null;
  company_code: string | null;
  company_name: string | null;
  branch_id: number | null;
  branch_code: string | null;
  branch_name: string | null;
  is_active: boolean;
  must_change_password: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role { code: string; name: string; description: string; scope: 'HOLDING' | 'COMPANY' | 'BRANCH' }
export interface Company { id: number; holding_id: number; code: string; name: string; is_active: boolean }
export interface Branch { id: number; holding_id: number; company_id: number; code: string; name: string; is_active: boolean }
export interface Holding { id: number; code: string; name: string; is_active: boolean }
export interface Ref { code: string; name_th: string; name_en: string; sort_order: number; is_active: boolean }

// ──────────────────────────────────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────────────────────────────────

const holdings: Holding[] = [
  { id: 1, code: 'TSP', name: 'TSP Holding', is_active: true },
  { id: 2, code: 'ACM', name: 'Acme Group', is_active: true },
];

const companies: Company[] = [
  { id: 10, holding_id: 1, code: 'TSP-RETAIL', name: 'TSP Retail Co.', is_active: true },
  { id: 11, holding_id: 1, code: 'TSP-SVC', name: 'TSP Service Co.', is_active: true },
  { id: 20, holding_id: 2, code: 'ACM-NORTH', name: 'Acme North', is_active: true },
];

const branches: Branch[] = [
  { id: 100, holding_id: 1, company_id: 10, code: 'BKK-01', name: 'Bangkok Central', is_active: true },
  { id: 101, holding_id: 1, company_id: 10, code: 'BKK-02', name: 'Bangkok Sukhumvit', is_active: true },
  { id: 102, holding_id: 1, company_id: 10, code: 'CNX-01', name: 'Chiang Mai', is_active: true },
  { id: 110, holding_id: 1, company_id: 11, code: 'SVC-01', name: 'Service Hub BKK', is_active: true },
  { id: 200, holding_id: 2, company_id: 20, code: 'ACM-N1', name: 'Acme North Main', is_active: true },
];

const roles: Role[] = [
  { code: 'HOLDING_ADMIN',     name: 'Holding Admin',     scope: 'HOLDING', description: 'Group-wide admin' },
  { code: 'COMPANY_ADMIN',     name: 'Company Admin',     scope: 'COMPANY', description: 'Company-scoped admin' },
  { code: 'COMPANY_INVENTORY', name: 'Company Inventory', scope: 'COMPANY', description: 'Inventory ops' },
  { code: 'BRANCH_MANAGER',    name: 'Branch Manager',    scope: 'BRANCH',  description: 'Branch manager' },
  { code: 'BRANCH_STAFF',      name: 'Branch Staff',      scope: 'BRANCH',  description: 'Branch staff' },
];

const poStatusRefs: Ref[] = [
  { code: 'DRAFT',             name_th: 'ฉบับร่าง', name_en: 'Draft',             sort_order: 1, is_active: true },
  { code: 'PENDING_APPROVAL',  name_th: 'รออนุมัติ', name_en: 'Pending Approval',  sort_order: 2, is_active: true },
  { code: 'APPROVED',          name_th: 'อนุมัติแล้ว', name_en: 'Approved',         sort_order: 3, is_active: true },
  { code: 'COMPLETED',         name_th: 'เสร็จสิ้น', name_en: 'Completed',         sort_order: 4, is_active: true },
  { code: 'REJECTED',          name_th: 'ปฏิเสธ', name_en: 'Rejected',             sort_order: 5, is_active: true },
  { code: 'CANCELLED',         name_th: 'ยกเลิก', name_en: 'Cancelled',            sort_order: 6, is_active: true },
];

const ownershipRefs: Ref[] = [
  { code: 'HOLDING',  name_th: 'กลุ่ม', name_en: 'Holding',  sort_order: 1, is_active: true },
  { code: 'COMPANY',  name_th: 'บริษัท', name_en: 'Company', sort_order: 2, is_active: true },
  { code: 'BRANCH',   name_th: 'สาขา', name_en: 'Branch',    sort_order: 3, is_active: true },
];

// ── PO seed: 60 rows across statuses/ownership ───────────────────────────
const PO_BRANDS = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus'];
const PO_FAMILIES = ['iPhone 15', 'Galaxy S24', 'Pixel 8', 'Redmi 13', 'OnePlus 12'];
const PO_VARIANTS = ['128GB Black', '256GB White', '512GB Blue', '1TB Titanium'];
const SUPPLIERS = ['Pacific Distribution', 'Asia Mobile Supply', 'Northern Trade Co.', 'Quick Wholesale', 'Global Imports Ltd.'];
const STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];
const OWNERSHIPS = ['HOLDING', 'COMPANY', 'BRANCH'];

function daysAgo(d: number): string {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString();
}

function generatePoLines(poId: number, count: number): PoLine[] {
  const out: PoLine[] = [];
  for (let i = 0; i < count; i++) {
    const brand = PO_BRANDS[(poId + i) % PO_BRANDS.length];
    const family = PO_FAMILIES[(poId + i) % PO_FAMILIES.length];
    const variant = PO_VARIANTS[(poId * 3 + i) % PO_VARIANTS.length];
    const qty = ((poId + i) % 5) + 1;
    const unitCost = 12000 + ((poId * 73 + i * 41) % 18) * 1000;
    out.push({
      line_id: poId * 100 + i,
      model_id: 1000 + ((poId + i) % 25),
      model_name: `${family} Pro`,
      model_code: `M${1000 + ((poId + i) % 25)}`,
      sku_code: `SKU-${brand.slice(0,2).toUpperCase()}-${1000 + i}-${poId}`,
      variant_id: 5000 + ((poId * 3 + i) % 50),
      variant_name: variant,
      brand_name: brand,
      family_name: family,
      qty,
      unit_cost: unitCost,
      line_total: qty * unitCost,
    });
  }
  return out;
}

function buildPo(i: number): Po {
  const id = i + 1;
  const status = STATUSES[i % STATUSES.length];
  const ownership = OWNERSHIPS[i % OWNERSHIPS.length];
  const company = companies[i % companies.length];
  const isBranch = ownership === 'BRANCH';
  const branch = isBranch ? branches.find((b) => b.company_id === company.id) ?? branches[0] : null;
  const lineCount = (i % 4) + 1;
  const lines = generatePoLines(id, lineCount);
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const totalAmount = lines.reduce((s, l) => s + l.line_total, 0);
  const isApproved = status === 'APPROVED' || status === 'COMPLETED';
  const receivedPercent = status === 'COMPLETED' ? 100 : isApproved ? 35 + (i % 50) : 0;
  const receivedQty = Math.floor((totalQty * receivedPercent) / 100);
  const receivedAmount = Math.floor((totalAmount * receivedPercent) / 100);
  const submitted = status !== 'DRAFT';
  return {
    po_id: id,
    po_no: `PO-2026-${String(id).padStart(4, '0')}`,
    holding_id: 1,
    company_id: company.id,
    company_name: company.name,
    branch_id: branch?.id ?? null,
    branch_name: branch?.name ?? null,
    po_type: 'PURCHASE',
    status,
    ownership,
    supplier_name: SUPPLIERS[i % SUPPLIERS.length],
    supplier_ref: i % 3 === 0 ? `REF-${1000 + i}` : null,
    total_lines: lineCount,
    c_total_lines: lineCount,
    c_total_qty: totalQty,
    c_total_amount: totalAmount,
    c_received_qty: receivedQty,
    c_received_amount: receivedAmount,
    outstanding_qty: totalQty - receivedQty,
    outstanding_amount: totalAmount - receivedAmount,
    received_percent: receivedPercent,
    submitted_at: submitted ? daysAgo(20 - (i % 18)) : null,
    approved_at: isApproved ? daysAgo(15 - (i % 12)) : null,
    cancelled_at: status === 'CANCELLED' ? daysAgo(10 - (i % 8)) : null,
    notes: i % 4 === 0 ? `Reorder for ${SUPPLIERS[i % SUPPLIERS.length]}` : null,
    created_by: 1,
    created_at: daysAgo(30 - (i % 28)),
    lines,
  };
}

const purchaseOrders: Po[] = Array.from({ length: 60 }, (_, i) => buildPo(i));

// ── Asset seed: 80 rows across buckets/conditions ────────────────────────
const BUCKETS = [
  'ON_HAND_AVAILABLE', 'QUARANTINED', 'IN_REPAIR', 'IN_USE_INTERNAL',
  'IN_TRANSIT_OUTBOUND', 'WITH_CUSTOMER_ACTIVE', 'DISPOSED_SOLD_SCRAP', 'WRITTEN_OFF',
];
const CONDITIONS = ['NEW', 'REFURBISHED', 'USED_A', 'USED_B'];

function buildAsset(i: number): Asset {
  const id = i + 1;
  const bucket = BUCKETS[i % BUCKETS.length];
  const condition = CONDITIONS[i % CONDITIONS.length];
  const brand = PO_BRANDS[i % PO_BRANDS.length];
  const family = PO_FAMILIES[i % PO_FAMILIES.length];
  const variant = PO_VARIANTS[i % PO_VARIANTS.length];
  const branch = branches[i % branches.length];
  const company = companies.find((c) => c.id === branch.company_id) ?? companies[0];
  const cost = 12000 + ((i * 71) % 20) * 500;
  const retail = cost + 4000 + ((i * 23) % 12) * 500;
  return {
    asset_id: id,
    holding_id: 1,
    company_id: company.id,
    company_name: company.name,
    branch_id: branch.id,
    branch_name: branch.name,
    asset_code: `A${String(id).padStart(5, '0')}`,
    current_bucket: bucket,
    condition_grade: condition,
    original_cost_basis: cost,
    current_cost_basis: condition === 'REFURBISHED' ? Math.floor(cost * 0.9) : cost,
    original_retail_price: retail,
    current_retail_price: condition === 'USED_B' ? Math.floor(retail * 0.7) : retail,
    variant_id: 5000 + (i % 50),
    model_id: 1000 + (i % 25),
    sku_code: `SKU-${brand.slice(0,2).toUpperCase()}-${1000 + i}`,
    variant_name: variant,
    manufacturer_color: ['Black', 'White', 'Blue', 'Titanium'][i % 4],
    model_name: `${family} Pro`,
    model_code: `M${1000 + (i % 25)}`,
    family_name: family,
    brand_name: brand,
    serial_no: `SN${100000 + i}`,
    imei: i % 2 === 0 ? `35${String(100000000000 + i).slice(-13)}` : null,
    is_contractable: bucket === 'ON_HAND_AVAILABLE',
    is_sellable: bucket === 'ON_HAND_AVAILABLE' || bucket === 'QUARANTINED',
    source_po_id: ((i % 60) + 1),
    created_at: daysAgo(60 - (i % 55)),
    updated_at: daysAgo(5 - (i % 4)),
  };
}

const assets: Asset[] = Array.from({ length: 80 }, (_, i) => buildAsset(i));

// ── Users seed ───────────────────────────────────────────────────────────
const USERNAMES = [
  'somchai', 'somsri', 'natthapong', 'wichai', 'malee',
  'chai', 'nok', 'pim', 'arthit', 'mali',
  'tanya', 'kanya', 'pichai', 'sunan', 'praphan',
  'sukanya', 'somboon', 'apichart', 'kingkaew', 'wilai',
];

function buildUser(i: number): User {
  const id = i + 1;
  const role = roles[i % roles.length];
  const scope = role.scope;
  const company = scope === 'HOLDING' ? null : companies[i % companies.length];
  const branch = scope === 'BRANCH' && company
    ? branches.find((b) => b.company_id === company.id) ?? null
    : null;
  return {
    id,
    username: USERNAMES[i % USERNAMES.length] + (i >= USERNAMES.length ? String(Math.floor(i / USERNAMES.length)) : ''),
    role_code: role.code,
    role_scope: scope,
    holding_id: 1,
    holding_code: 'TSP',
    holding_name: 'TSP Holding',
    company_id: company?.id ?? null,
    company_code: company?.code ?? null,
    company_name: company?.name ?? null,
    branch_id: branch?.id ?? null,
    branch_code: branch?.code ?? null,
    branch_name: branch?.name ?? null,
    is_active: i % 7 !== 0,
    must_change_password: false,
    is_deleted: false,
    created_at: daysAgo(90 - (i % 80)),
    updated_at: daysAgo(20 - (i % 18)),
  };
}

const users: User[] = Array.from({ length: 35 }, (_, i) => buildUser(i));

// ──────────────────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────────────────
export const fixtures = {
  holdings,
  companies,
  branches,
  roles,
  poStatusRefs,
  ownershipRefs,
  purchaseOrders,
  assets,
  users,
};
