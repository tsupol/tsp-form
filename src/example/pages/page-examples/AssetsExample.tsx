// ============================================================================
// Pattern 2 — List + Detail with search + compound filters
//
// Mirrors: frontend-tsp-form/src/pages/inventory/AssetsPage.tsx
//          route: /admin/inventory/assets/:assetId?
//
// Production endpoints this would hit (real apiClient):
//   GET /v_assets?order=created_at.desc&current_bucket=eq.X&branch_id=eq.Y
//                &or=(asset_code.ilike.*kw*,serial_no.ilike.*kw*)
//
// Differs from Pattern 1: adds a search input, multiple inline filters at
// wider breakpoints, and a "More filters" PopOver with a count badge when
// extra filters are hidden.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageNav, PageNavPanel, MobileHeader, Badge, Select, Input, Button, PopOver,
  DataTable,
} from '../../../../index';
import { ArrowLeft, ArrowRightFromLine, Box, Search, SlidersHorizontal } from 'lucide-react';
import { mockClient } from './shared/mockClient';
import type { Asset, Branch } from './shared/fixtures';
import { useMockQuery } from './shared/useMockQuery';
import { fmtCurrency, fmtDateTime } from './shared/format';

const BUCKET_OPTIONS = [
  { value: 'ON_HAND_AVAILABLE', label: 'Available' },
  { value: 'QUARANTINED', label: 'Quarantined' },
  { value: 'IN_REPAIR', label: 'In repair' },
  { value: 'IN_USE_INTERNAL', label: 'Internal use' },
  { value: 'IN_TRANSIT_OUTBOUND', label: 'In transit' },
  { value: 'WITH_CUSTOMER_ACTIVE', label: 'With customer' },
  { value: 'DISPOSED_SOLD_SCRAP', label: 'Disposed' },
  { value: 'WRITTEN_OFF', label: 'Written off' },
];

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'REFURBISHED', label: 'Refurbished' },
  { value: 'USED_A', label: 'Used A' },
  { value: 'USED_B', label: 'Used B' },
];

const BUCKET_COLOR: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default' | 'secondary'> = {
  ON_HAND_AVAILABLE: 'success',
  QUARANTINED: 'warning',
  IN_REPAIR: 'info',
  IN_USE_INTERNAL: 'secondary',
  IN_TRANSIT_OUTBOUND: 'info',
  WITH_CUSTOMER_ACTIVE: 'default',
  DISPOSED_SOLD_SCRAP: 'danger',
  WRITTEN_OFF: 'danger',
};

function bucketLabel(b: string) { return BUCKET_OPTIONS.find((o) => o.value === b)?.label ?? b; }
function conditionLabel(c: string) { return CONDITION_OPTIONS.find((o) => o.value === c)?.label ?? c; }

export function AssetsExample() {
  const navigate = useNavigate();
  const { assetId: assetIdParam } = useParams<{ assetId?: string }>();
  const selectedId = assetIdParam ? Number(assetIdParam) : null;
  const setSelectedId = (id: number | null) => {
    if (id) navigate(`/page-examples/list-detail-filters/${id}`, { replace: true });
    else navigate('/page-examples/list-detail-filters', { replace: true });
  };

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterBucket, setFilterBucket] = useState<string | null>(null);
  const [filterBranchId, setFilterBranchId] = useState<number | null>(null);
  const [filterCondition, setFilterCondition] = useState<string | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: branches = [] } = useMockQuery(
    ['branches'],
    () => mockClient.get<Branch[]>('/v_branches?is_active=is.true&order=name'),
  );
  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: String(b.id), label: b.name })),
    [branches],
  );
  const BRAND_OPTIONS = [
    { value: 'Apple', label: 'Apple' },
    { value: 'Samsung', label: 'Samsung' },
    { value: 'Google', label: 'Google' },
    { value: 'Xiaomi', label: 'Xiaomi' },
    { value: 'OnePlus', label: 'OnePlus' },
  ];

  const extraFilterCount = [filterBrand, filterCondition].filter(Boolean).length;

  const { data: listData, isFetching } = useMockQuery(
    ['assets', debouncedSearch, filterBucket, filterBranchId, filterCondition, filterBrand, pageIndex, pageSize] as const,
    () => {
      let url = '/v_assets?order=created_at.desc';
      if (filterBucket) url += `&current_bucket=eq.${filterBucket}`;
      if (filterBranchId) url += `&branch_id=eq.${filterBranchId}`;
      if (filterCondition) url += `&condition_grade=eq.${filterCondition}`;
      if (filterBrand) url += `&brand_name=eq.${encodeURIComponent(filterBrand)}`;
      if (debouncedSearch) {
        url += `&or=(asset_code.ilike.*${debouncedSearch}*,serial_no.ilike.*${debouncedSearch}*)`;
      }
      return mockClient.getPaginated<Asset>(url, { page: pageIndex + 1, pageSize });
    },
    { keepPreviousData: true },
  );

  const list = listData?.data ?? [];
  const totalCount = listData?.totalCount ?? 0;

  useEffect(() => { setPageIndex(0); }, [debouncedSearch, filterBucket, filterBranchId, filterCondition, filterBrand]);

  const { data: fallbackArr } = useMockQuery(
    ['asset-fallback', selectedId],
    () => mockClient.get<Asset[]>(`/v_assets?asset_id=eq.${selectedId}`),
    { enabled: !!selectedId && !list.find((a) => a.asset_id === selectedId) },
  );
  const selectedAsset = list.find((a) => a.asset_id === selectedId) ?? fallbackArr?.[0] ?? null;

  return (
    <PageNav panels={['list', 'detail']} className="h-dvh">
      {({ isMobile, isRoot, goTo, goBack }) => (
        <>
          {isMobile && (
            <MobileHeader className="mobile-header-bordered">
              <div className="mobile-header-start">
                {isRoot ? (
                  <button className="flex items-center justify-center w-nav h-nav cursor-pointer bg-transparent border-none text-current"
                          onClick={() => window.dispatchEvent(new CustomEvent('sidemenu:open'))}>
                    <ArrowRightFromLine size={18} />
                  </button>
                ) : (
                  <button className="flex items-center justify-center w-nav h-nav cursor-pointer bg-transparent border-none text-current"
                          onClick={goBack}>
                    <ArrowLeft size={20} />
                  </button>
                )}
              </div>
              <div className="mobile-header-title mobile-header-title-truncate">
                {isRoot ? 'Assets' : selectedAsset?.asset_code ?? ''}
              </div>
              <div className="mobile-header-end w-12" />
            </MobileHeader>
          )}

          {!isMobile && (
            <div className="flex-none px-4 py-2.5 border-b border-line flex items-center gap-4">
              <h1 className="heading-2 shrink-0">Assets</h1>
              <span className="text-xs text-subtle">List + Detail with search and compound filters</span>
            </div>
          )}

          {/* Filter bar spans both panels */}
          {(isRoot || !isMobile) && (
            <div className="flex-none flex flex-col gap-2 p-2 border-b border-line">
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search code or serial"
                    size="sm"
                    startIcon={<Search size={16} />}
                  />
                </div>
                <div className="flex-1 min-w-0 hidden sm:block">
                  <Select
                    options={BUCKET_OPTIONS}
                    value={filterBucket}
                    onChange={(val) => setFilterBucket((val as string) || null)}
                    placeholder="All statuses"
                    size="sm"
                    showChevron
                    clearable
                  />
                </div>
                <div className="flex-1 min-w-0 hidden md:block">
                  <Select
                    options={branchOptions}
                    value={filterBranchId !== null ? String(filterBranchId) : null}
                    onChange={(val) => setFilterBranchId(val ? Number(val) : null)}
                    placeholder="All branches"
                    size="sm"
                    showChevron
                    clearable
                  />
                </div>
                <div className="flex-1 min-w-0 hidden lg:block">
                  <Select
                    options={CONDITION_OPTIONS}
                    value={filterCondition}
                    onChange={(val) => setFilterCondition((val as string) || null)}
                    placeholder="All conditions"
                    size="sm"
                    showChevron
                    clearable
                  />
                </div>
                <div className="flex-1 min-w-0 hidden xl:block">
                  <Select
                    options={BRAND_OPTIONS}
                    value={filterBrand || null}
                    onChange={(val) => { setFilterBrand((val as string) || ''); setPageIndex(0); }}
                    placeholder="All brands"
                    size="sm"
                    showChevron
                    clearable
                  />
                </div>
                <PopOver
                  isOpen={filterPopoverOpen}
                  onClose={() => setFilterPopoverOpen(false)}
                  triggerRef={filterTriggerRef}
                  placement="bottom"
                  align="end"
                  maxWidth="320px"
                >
                  <div className="flex flex-col gap-3 p-3">
                    <div className="text-xs font-medium text-subtle uppercase tracking-wide">More filters</div>
                    <div className="sm:hidden flex flex-col gap-2">
                      <Select options={BUCKET_OPTIONS} value={filterBucket} onChange={(val) => setFilterBucket((val as string) || null)} placeholder="All statuses" size="sm" showChevron clearable />
                    </div>
                    <div className="md:hidden flex flex-col gap-2">
                      <Select options={branchOptions} value={filterBranchId !== null ? String(filterBranchId) : null} onChange={(val) => setFilterBranchId(val ? Number(val) : null)} placeholder="All branches" size="sm" showChevron clearable />
                    </div>
                    <div className="lg:hidden flex flex-col gap-2">
                      <Select options={CONDITION_OPTIONS} value={filterCondition} onChange={(val) => setFilterCondition((val as string) || null)} placeholder="All conditions" size="sm" showChevron clearable />
                    </div>
                    <div className="xl:hidden flex flex-col gap-2">
                      <Select options={BRAND_OPTIONS} value={filterBrand || null} onChange={(val) => { setFilterBrand((val as string) || ''); setPageIndex(0); }} placeholder="All brands" size="sm" showChevron clearable />
                    </div>
                  </div>
                </PopOver>
                <Button
                  ref={filterTriggerRef}
                  size="sm"
                  variant="outline"
                  className={`relative btn-icon-sm shrink-0 ${extraFilterCount > 0 ? 'text-primary-fg' : ''}`}
                  onClick={() => setFilterPopoverOpen((v) => !v)}
                >
                  <SlidersHorizontal size={14} />
                  {extraFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-contrast text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {extraFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
            <PageNavPanel id="list" className={isMobile ? '' : 'w-1/2 xl:w-5/12 border-r border-line flex flex-col'}>
              <DataTable<Asset>
                data={list}
                renderRow={(row) => {
                  const a = row.original;
                  const isSelected = a.asset_id === selectedId;
                  return (
                    <button
                      key={a.asset_id}
                      className={`w-full text-left px-4 py-2.5 border-b border-line flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-surface-hover'
                      }`}
                      onClick={() => { setSelectedId(a.asset_id); if (isMobile) goTo('detail'); }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span className="font-medium text-sm truncate">{a.asset_code}</span>
                        </div>
                        <div className="text-xs text-subtle truncate">
                          {a.brand_name} {a.family_name} · {a.variant_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1 -ml-0.5">
                          <Badge size="xs" color={BUCKET_COLOR[a.current_bucket] ?? 'default'}>
                            {bucketLabel(a.current_bucket)}
                          </Badge>
                          <span className="text-xs text-subtle">{conditionLabel(a.condition_grade)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium tabular-nums">{fmtCurrency(a.current_cost_basis)}</div>
                        <div className="text-xs text-subtle">{fmtDateTime(a.created_at)}</div>
                        <div className="text-xs text-subtle truncate">{a.branch_name}</div>
                      </div>
                    </button>
                  );
                }}
                enablePagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageSizeOptions={[10, 15, 20, 30]}
                rowCount={totalCount}
                onPageChange={({ pageIndex: pi, pageSize: ps }) => { setPageIndex(pi); setPageSize(ps); }}
                className={`flex-1 min-h-0 panel-datatable ${isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}
                noResults={<div className="p-8 text-center text-subtle">No data</div>}
              />
            </PageNavPanel>

            <PageNavPanel id="detail" className={isMobile ? '' : 'flex-1 flex flex-col'}>
              {selectedAsset ? (
                <AssetDetailPanel asset={selectedAsset} isMobile={isMobile} />
              ) : (
                <div className="flex-1 h-full flex items-center justify-center text-subtle">
                  <div className="text-center">
                    <Box size={32} className="mx-auto mb-2 opacity-40" />
                    Select an asset to view details
                  </div>
                </div>
              )}
            </PageNavPanel>
          </div>
        </>
      )}
    </PageNav>
  );
}

function AssetDetailPanel({ asset, isMobile }: { asset: Asset; isMobile: boolean }) {
  return (
    <div className="relative flex flex-col h-full">
      {!isMobile && (
        <div className="flex-none flex items-center h-panel-header-h px-4 border-b border-line gap-2">
          <span className="font-semibold">{asset.asset_code}</span>
          <Badge size="xs" color={BUCKET_COLOR[asset.current_bucket] ?? 'default'}>
            {bucketLabel(asset.current_bucket)}
          </Badge>
          <span className="text-xs text-subtle">{conditionLabel(asset.condition_grade)}</span>
        </div>
      )}

      <div className="flex-none px-4 py-3 border-b border-line bg-surface">
        <div className="text-xs text-subtle">
          {[asset.brand_name, asset.family_name, asset.model_name].filter(Boolean).join(' > ')}
        </div>
        <div className="font-semibold text-sm mt-0.5">{asset.variant_name}</div>
        <div className="text-xs text-subtle">{asset.sku_code}</div>
        {asset.manufacturer_color && (
          <div className="text-xs text-subtle mt-0.5">Color: {asset.manufacturer_color}</div>
        )}
      </div>

      <div className="flex-none grid grid-cols-2 gap-3 px-4 py-3 border-b border-line">
        <div>
          <div className="text-xs text-subtle">Serial no.</div>
          <div className="text-sm font-mono">{asset.serial_no ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs text-subtle">IMEI</div>
          <div className="text-sm font-mono">{asset.imei ?? '—'}</div>
        </div>
      </div>

      <div className="flex-none grid grid-cols-2 gap-3 px-4 py-3 border-b border-line">
        <div>
          <div className="text-xs text-subtle">Branch</div>
          <div className="font-semibold text-sm">{asset.branch_name}</div>
        </div>
        <div>
          <div className="text-xs text-subtle">Company</div>
          <div className="font-semibold text-sm">{asset.company_name}</div>
        </div>
      </div>

      <div className="flex-none grid grid-cols-2 gap-3 px-4 py-3 border-b border-line">
        <div>
          <div className="text-xs text-subtle">Cost</div>
          <div className="font-semibold text-sm tabular-nums">{fmtCurrency(asset.current_cost_basis)}</div>
          {asset.current_cost_basis !== asset.original_cost_basis && (
            <div className="text-xs text-subtle tabular-nums line-through">{fmtCurrency(asset.original_cost_basis)}</div>
          )}
        </div>
        <div>
          <div className="text-xs text-subtle">Retail</div>
          <div className="font-semibold text-sm tabular-nums">{fmtCurrency(asset.current_retail_price)}</div>
          {asset.current_retail_price !== asset.original_retail_price && (
            <div className="text-xs text-subtle tabular-nums line-through">{fmtCurrency(asset.original_retail_price)}</div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto better-scroll p-4 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="text-xs">
            <span className="text-subtle">Contractable: </span>
            <span className={asset.is_contractable ? 'text-success' : 'text-fg/50'}>
              {asset.is_contractable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-subtle">Sellable: </span>
            <span className={asset.is_sellable ? 'text-success' : 'text-fg/50'}>
              {asset.is_sellable ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-subtle">
          <span>Registered: {fmtDateTime(asset.created_at)}</span>
          <span>Updated: {fmtDateTime(asset.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}
