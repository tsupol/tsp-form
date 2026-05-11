// ============================================================================
// Pattern 1 — List + Detail with status filters
//
// Mirrors: frontend-tsp-form/src/pages/inventory/PurchaseOrdersPage.tsx
//          route: /admin/inventory/po/:poId?
//
// Production endpoints this would hit (real apiClient):
//   GET  /v_purchase_orders?po_type=eq.PURCHASE&order=created_at.desc...
//   GET  /v_po_detail?po_id=eq.X
//   GET  /v_ref_po_statuses, /v_ref_owner_types
//   POST /rpc/fn_po_submit | fn_po_approve | fn_po_reject | fn_po_cancel
//
// Here those are served by mockClient (../shared/mockClient).
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageNav, PageNavPanel, MobileHeader, Badge, Select, Button, Modal, TextArea,
  DataTable, useSnackbarContext,
} from '../../../../index';
import { ArrowLeft, ArrowRightFromLine, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { mockClient } from './shared/mockClient';
import type { Po, Ref } from './shared/fixtures';
import { useMockQuery } from './shared/useMockQuery';
import { fmtCurrency, fmtDateTime, fmtNum } from './shared/format';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  DRAFT: 'default',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  COMPLETED: 'info',
  REJECTED: 'danger',
  CANCELLED: 'default',
};

export function PurchaseOrdersExample() {
  const { addSnackbar } = useSnackbarContext();
  const navigate = useNavigate();
  const { poId: poIdParam } = useParams<{ poId?: string }>();
  const selectedPoId = poIdParam ? Number(poIdParam) : null;
  const setSelectedPoId = (id: number | null) => {
    if (id) navigate(`/page-examples/list-detail/${id}`, { replace: true });
    else navigate('/page-examples/list-detail', { replace: true });
  };

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterOwnership, setFilterOwnership] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const { data: statusRefs } = useMockQuery(
    ['ref', 'po_statuses'],
    () => mockClient.get<Ref[]>('/v_ref_po_statuses?is_active=is.true&order=sort_order'),
  );
  const { data: ownershipRefs } = useMockQuery(
    ['ref', 'owner_types'],
    () => mockClient.get<Ref[]>('/v_ref_owner_types?is_active=is.true&order=sort_order'),
  );

  const statusOptions = useMemo(
    () => (statusRefs ?? []).map((r) => ({ value: r.code, label: r.name_en })),
    [statusRefs],
  );
  const ownershipOptions = useMemo(
    () => (ownershipRefs ?? []).map((r) => ({ value: r.code, label: r.name_en })),
    [ownershipRefs],
  );

  const statusLabel = (code: string) => statusRefs?.find((r) => r.code === code)?.name_en ?? code;
  const ownershipLabel = (code: string) => ownershipRefs?.find((r) => r.code === code)?.name_en ?? code;

  const listKey = ['purchase-orders', filterStatus, filterOwnership, pageIndex, pageSize] as const;
  const { data: listData, isFetching, refetch: refetchList } = useMockQuery(
    listKey,
    () => {
      let url = '/v_purchase_orders?po_type=eq.PURCHASE&order=created_at.desc';
      if (filterStatus) url += `&status=eq.${filterStatus}`;
      if (filterOwnership) url += `&ownership=eq.${filterOwnership}`;
      return mockClient.getPaginated<Po>(url, { page: pageIndex + 1, pageSize });
    },
    { keepPreviousData: true },
  );

  const poList = listData?.data ?? [];
  const totalCount = listData?.totalCount ?? 0;

  const { data: poDetailArr, isFetching: detailFetching, refetch: refetchDetail } = useMockQuery(
    ['po-detail', selectedPoId],
    () => mockClient.get<Po[]>(`/v_po_detail?po_id=eq.${selectedPoId}`),
    { enabled: !!selectedPoId, keepPreviousData: true },
  );
  const poDetail = poDetailArr?.[0] ?? null;

  useEffect(() => { setPageIndex(0); }, [filterStatus, filterOwnership]);

  const invalidate = () => { refetchList(); refetchDetail(); };

  return (
    <PageNav panels={['list', 'detail']} className="h-dvh">
      {({ isMobile, isRoot, goTo, goBack }) => (
        <>
          {isMobile && (
            <MobileHeader className="mobile-header-bordered">
              <div className="mobile-header-start">
                {isRoot ? (
                  <button
                    className="flex items-center justify-center w-nav h-nav cursor-pointer bg-transparent border-none text-current"
                    onClick={() => window.dispatchEvent(new CustomEvent('sidemenu:open'))}
                  >
                    <ArrowRightFromLine size={18} />
                  </button>
                ) : (
                  <button
                    className="flex items-center justify-center w-nav h-nav cursor-pointer bg-transparent border-none text-current"
                    onClick={goBack}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
              </div>
              <div className="mobile-header-title mobile-header-title-truncate">
                {isRoot ? 'Purchase Orders' : poDetail?.po_no ?? ''}
              </div>
              <div className="mobile-header-end w-nav" />
            </MobileHeader>
          )}

          {!isMobile && (
            <div className="flex-none px-4 py-2.5 border-b border-line flex items-center gap-4">
              <h1 className="heading-2 shrink-0">Purchase Orders</h1>
              <span className="text-xs text-subtle">List + Detail pattern with status filters</span>
            </div>
          )}

          <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
            <PageNavPanel
              id="list"
              className={isMobile ? '' : 'w-1/2 xl:w-5/12 border-r border-line flex flex-col'}
            >
              <div className="flex-none flex flex-col gap-2 p-2 border-b border-line">
                <div className="flex gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <Select
                      options={statusOptions}
                      value={filterStatus}
                      onChange={(v) => setFilterStatus((v as string) || null)}
                      placeholder="All statuses"
                      size="sm"
                      showChevron
                      clearable
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Select
                      options={ownershipOptions}
                      value={filterOwnership}
                      onChange={(v) => setFilterOwnership((v as string) || null)}
                      placeholder="All ownership"
                      size="sm"
                      showChevron
                      clearable
                    />
                  </div>
                </div>
              </div>

              <DataTable<Po>
                data={poList}
                renderRow={(row) => {
                  const po = row.original;
                  const isSelected = po.po_id === selectedPoId;
                  return (
                    <button
                      key={po.po_id}
                      className={`w-full text-left px-4 py-2.5 border-b border-line flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-item-active-bg text-item-active-fg' : 'hover:bg-surface-hover'
                      }`}
                      onClick={() => {
                        setSelectedPoId(po.po_id);
                        if (isMobile) goTo('detail');
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-sm truncate">{po.po_no}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 mt-0.5">
                          <Badge size="xs" color={STATUS_COLOR[po.status] ?? 'default'}>
                            {statusLabel(po.status)}
                          </Badge>
                          <Badge
                            size="xs"
                            variant="outline"
                            color={po.ownership === 'HOLDING' ? 'info' : po.ownership === 'COMPANY' ? 'secondary' : 'default'}
                          >
                            {ownershipLabel(po.ownership)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0 min-w-0">
                        <div className="text-xs text-subtle">{fmtDateTime(po.created_at)}</div>
                        <div className="text-[11px] text-subtle mt-0.5 truncate">
                          {[po.branch_name, po.supplier_name].filter(Boolean).join(' · ')}{' '}
                          <span className="text-fg">({po.total_lines})</span>
                        </div>
                      </div>
                    </button>
                  );
                }}
                enablePagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageSizeOptions={[10, 15, 20, 30]}
                rowCount={totalCount}
                onPageChange={({ pageIndex: pi, pageSize: ps }) => {
                  setPageIndex(pi);
                  setPageSize(ps);
                }}
                className={`flex-1 min-h-0 panel-datatable ${isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}
                noResults={<div className="p-8 text-center text-subtle">No data</div>}
              />
            </PageNavPanel>

            <PageNavPanel id="detail" className={isMobile ? '' : 'flex-1 min-w-0 flex flex-col'}>
              {poDetail ? (
                <PoDetailPanel
                  detail={poDetail}
                  loading={detailFetching}
                  isMobile={isMobile}
                  ownershipLabel={ownershipLabel}
                  statusLabel={statusLabel}
                  onRefresh={invalidate}
                  addSnackbar={addSnackbar}
                />
              ) : selectedPoId && detailFetching ? (
                <CenterMsg>Loading…</CenterMsg>
              ) : selectedPoId ? (
                <CenterMsg icon><ClipboardList size={32} className="mx-auto mb-2 opacity-40" />Not found</CenterMsg>
              ) : (
                <CenterMsg icon><ClipboardList size={32} className="mx-auto mb-2 opacity-40" />Select a PO to view details</CenterMsg>
              )}
            </PageNavPanel>
          </div>
        </>
      )}
    </PageNav>
  );
}

function CenterMsg({ children, icon }: { children: React.ReactNode; icon?: boolean }) {
  return (
    <div className="flex-1 h-full flex items-center justify-center text-subtle">
      <div className="text-center">
        {icon ? children : <span>{children}</span>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Detail panel
// ────────────────────────────────────────────────────────────────────────────

type ActionKind = 'submit' | 'approve' | 'reject' | 'cancel';

function PoDetailPanel({
  detail, loading, isMobile, ownershipLabel, statusLabel, onRefresh, addSnackbar,
}: {
  detail: Po;
  loading: boolean;
  isMobile: boolean;
  ownershipLabel: (c: string) => string;
  statusLabel: (c: string) => string;
  onRefresh: () => void;
  addSnackbar: (opts: { message: React.ReactNode }) => void;
}) {
  const [actionModal, setActionModal] = useState<ActionKind | null>(null);

  const isDraft = detail.status === 'DRAFT';
  const isPending = detail.status === 'PENDING_APPROVAL';
  const isApproved = detail.status === 'APPROVED';

  return (
    <div className="relative flex flex-col h-full">
      {loading && (
        <div className="absolute inset-0 bg-bg/50 z-10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isMobile && (
        <div className="flex-none flex items-center h-panel-header-h px-4 border-b border-line gap-2">
          <span className="font-semibold">{detail.po_no}</span>
          <Badge size="xs" color={STATUS_COLOR[detail.status] ?? 'default'}>
            {statusLabel(detail.status)}
          </Badge>
          <Badge size="xs" color="default">{ownershipLabel(detail.ownership)}</Badge>
        </div>
      )}

      {/* Summary */}
      <div className="flex-none grid grid-cols-3 gap-3 px-4 py-3 border-b border-line bg-surface">
        <div>
          <div className="text-xs text-subtle">Supplier</div>
          <div className="font-semibold text-sm truncate">{detail.supplier_name ?? '—'}</div>
          {detail.supplier_ref && (
            <div className="text-xs text-subtle truncate">{detail.supplier_ref}</div>
          )}
        </div>
        <div>
          <div className="text-xs text-subtle">Total qty</div>
          <div className="font-semibold text-sm tabular-nums">{fmtNum(detail.c_total_qty)}</div>
          <div className="text-xs text-subtle">{detail.c_total_lines} lines</div>
        </div>
        <div>
          <div className="text-xs text-subtle">Total amount</div>
          <div className="font-semibold text-sm tabular-nums">{fmtCurrency(detail.c_total_amount)}</div>
        </div>
      </div>

      {/* Receiving progress */}
      {(isApproved || detail.status === 'COMPLETED') && (
        <div className="flex-none px-4 py-2.5 border-b border-line">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-subtle">Receiving progress</span>
            <span className="tabular-nums font-medium">
              {fmtNum(detail.c_received_qty)} / {fmtNum(detail.c_total_qty)} ({detail.received_percent}%)
            </span>
          </div>
          <div className="h-1.5 bg-fg/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all"
                 style={{ width: `${Math.min(detail.received_percent, 100)}%` }} />
          </div>
        </div>
      )}

      <div className="flex-none px-4 py-2 border-b border-line flex flex-wrap gap-x-6 gap-y-1 text-xs text-subtle">
        <span>Created: {fmtDateTime(detail.created_at)}</span>
        {detail.submitted_at && <span>Submitted: {fmtDateTime(detail.submitted_at)}</span>}
        {detail.approved_at && <span>Approved: {fmtDateTime(detail.approved_at)}</span>}
        {detail.cancelled_at && <span>Cancelled: {fmtDateTime(detail.cancelled_at)}</span>}
      </div>

      {detail.notes && (
        <div className="flex-none px-4 py-2 border-b border-line text-xs text-subtle italic">
          {detail.notes}
        </div>
      )}

      {/* Lines */}
      <div className="flex-1 overflow-auto better-scroll">
        <div className="px-4 pt-3 pb-1">
          <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">
            Lines ({detail.lines.length})
          </h3>
        </div>
        {detail.lines.map((line) => (
          <div key={line.line_id} className="px-4 py-2.5 border-b border-line flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {[line.brand_name, line.family_name, line.model_name].filter(Boolean).join(' ')}
              </div>
              <div className="text-xs text-subtle truncate">
                {line.variant_name} · {line.sku_code}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-medium tabular-nums">{fmtNum(line.qty)} pcs</div>
              <div className="text-xs text-subtle tabular-nums">@ {fmtCurrency(line.unit_cost)}</div>
              <div className="text-xs font-medium tabular-nums">{fmtCurrency(line.line_total)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action footer */}
      {(isDraft || isPending) && (
        <div className="flex-none px-4 py-3 border-t border-line flex flex-wrap gap-2 items-center">
          {(isDraft || isPending) && (
            <Button size="sm" variant="outline" color="danger" onClick={() => setActionModal('cancel')}>
              Cancel
            </Button>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            {isPending && (
              <Button size="sm" variant="outline" color="danger" onClick={() => setActionModal('reject')}>
                Reject
              </Button>
            )}
            {isDraft && (
              <Button size="sm" color="primary" onClick={() => setActionModal('submit')}>
                Submit
              </Button>
            )}
            {isPending && (
              <Button size="sm" color="primary" onClick={() => setActionModal('approve')}>
                Approve
              </Button>
            )}
          </div>
        </div>
      )}

      <PoActionModal
        action={actionModal}
        po={detail}
        onClose={() => setActionModal(null)}
        onSuccess={(label) => {
          setActionModal(null);
          onRefresh();
          addSnackbar({
            message: (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                <span>{label}</span>
              </div>
            ),
          });
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Action modal — submit / approve / reject / cancel
// ────────────────────────────────────────────────────────────────────────────

const ACTION_RPC: Record<ActionKind, string> = {
  submit: 'fn_po_submit',
  approve: 'fn_po_approve',
  reject: 'fn_po_reject',
  cancel: 'fn_po_cancel',
};
const ACTION_TITLE: Record<ActionKind, string> = {
  submit: 'Submit PO',
  approve: 'Approve PO',
  reject: 'Reject PO',
  cancel: 'Cancel PO',
};
const ACTION_CONFIRM: Record<ActionKind, string> = {
  submit: 'Submit this PO for approval?',
  approve: 'Approve this PO?',
  reject: 'Reject this PO. The supplier will be notified.',
  cancel: 'Cancel this PO. This cannot be undone.',
};
const ACTION_SUCCESS: Record<ActionKind, string> = {
  submit: 'PO submitted for approval',
  approve: 'PO approved',
  reject: 'PO rejected',
  cancel: 'PO cancelled',
};

function PoActionModal({
  action, po, onClose, onSuccess,
}: {
  action: ActionKind | null;
  po: Po;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (action) { setReason(''); setError(''); } }, [action]);

  if (!action) return <Modal open={false} onClose={onClose}><div /></Modal>;

  const isDanger = action === 'reject' || action === 'cancel';
  const showReason = action === 'reject' || action === 'cancel';
  const reasonRequired = action === 'reject';
  const canConfirm = !pending && (!reasonRequired || !!reason.trim());

  const confirm = async () => {
    setPending(true);
    setError('');
    try {
      const params: Record<string, unknown> = { p_po_id: po.po_id };
      if (action === 'reject' && reason.trim()) params.p_reason = reason.trim();
      if (action === 'cancel' && reason.trim()) params.p_reason = reason.trim();
      await mockClient.rpc(ACTION_RPC[action], params);
      onSuccess(ACTION_SUCCESS[action]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={!!action} onClose={onClose} maxWidth="28rem" width="100%">
      <div className="flex flex-col overflow-hidden">
        <div className="modal-header">
          <h2 className="modal-title">{ACTION_TITLE[action]}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-content">
          {error && (
            <div className="alert alert-danger mb-4">
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="mb-4 px-3 py-2.5 rounded-md bg-surface border border-line">
            <div className="font-medium text-sm">{po.po_no}</div>
            {po.supplier_name && <div className="text-xs text-subtle">{po.supplier_name}</div>}
            <div className="text-xs text-subtle">
              {po.c_total_lines} lines · {fmtNum(po.c_total_qty)} pcs · {fmtCurrency(po.c_total_amount)}
            </div>
          </div>
          <p className="text-sm text-subtle mb-4">{ACTION_CONFIRM[action]}</p>

          {showReason && (
            <div className="form-grid gap-4">
              <div className="flex flex-col">
                <label className="form-label">
                  Reason{reasonRequired && ' *'}
                </label>
                <TextArea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Add a brief reason"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            color={isDanger ? 'danger' : 'primary'}
            onClick={confirm}
            disabled={!canConfirm}
          >
            {pending ? 'Working…' : ACTION_TITLE[action]}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
