// ============================================================================
// Users management example (not PageNav — full-page DataTable with row actions)
//
// Mirrors: frontend-tsp-form/src/pages/UsersPage.tsx
//          route: /admin/users
//
// Production endpoints (real apiClient):
//   GET  /v_users?...filters...&order=username
//   GET  /v_holdings, /v_roles, /v_companies, /v_branches
//   POST /rpc/user_create | user_update | user_set_active | user_change_role
//        /rpc/user_set_password | user_reset_password
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  DataTable, DataTableColumnHeader, DataTableFooter, createSelectColumn,
  Button, Input, Select, PopOver, MenuItem, MenuSeparator, Badge, Modal, Switch,
  MobileHeader, useSnackbarContext, FormErrorMessage,
  type ColumnDef, type RowSelectionState, type SortingState,
} from '../../../../index';
import {
  Plus, MoreHorizontal, Pencil, ShieldCheck, ShieldOff, KeyRound, Trash2, Ban,
  XCircle, CheckCircle, Eye, EyeOff, Copy, SlidersHorizontal, ArrowRightFromLine,
} from 'lucide-react';
import { mockClient } from './shared/mockClient';
import type { User, Role, Company, Branch, Holding } from './shared/fixtures';
import { useMockQuery } from './shared/useMockQuery';

// ── data hooks ──────────────────────────────────────────────────────────────
function useHoldings() {
  return useMockQuery(['holdings'], () =>
    mockClient.get<Holding[]>('/v_holdings?is_active=is.true&order=name'),
  );
}
function useRoles() {
  return useMockQuery(['roles'], () => mockClient.get<Role[]>('/v_roles?order=code'));
}
function useCompanies(holdingId?: string) {
  const filter = holdingId ? `&holding_id=eq.${holdingId}` : '';
  return useMockQuery(['companies', holdingId ?? 'all'], () =>
    mockClient.get<Company[]>(`/v_companies?is_active=is.true${filter}&order=name`),
  );
}
function useBranches(companyId: string | null) {
  return useMockQuery(['branches-of', companyId], () =>
    mockClient.get<Branch[]>(`/v_branches?is_active=is.true&company_id=eq.${companyId}&order=name`),
    { enabled: !!companyId },
  );
}

// ── Row actions menu ────────────────────────────────────────────────────────
function RowActions({
  user, onEdit, onChangeRole, onPasswordManage, onToggleActive, onDelete,
}: {
  user: User;
  onEdit: (u: User) => void;
  onChangeRole: (u: User) => void;
  onPasswordManage: (u: User) => void;
  onToggleActive: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopOver
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="bottom"
      align="end"
      offset={4}
      openDelay={0}
      trigger={
        <button
          className="p-1 rounded hover:bg-surface-hover transition-colors cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
          <MoreHorizontal size={16} className="opacity-50" />
        </button>
      }
    >
      <div className="py-1 min-w-[160px]">
        <MenuItem icon={<Pencil size={14} />} label="Edit" onClick={() => { setOpen(false); onEdit(user); }} />
        <MenuItem icon={<KeyRound size={14} />} label="Password" onClick={() => { setOpen(false); onPasswordManage(user); }} />
        <MenuItem icon={<ShieldCheck size={14} />} label="Change role" onClick={() => { setOpen(false); onChangeRole(user); }} />
        <MenuSeparator />
        <MenuItem
          icon={user.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
          label={user.is_active ? 'Deactivate' : 'Activate'}
          onClick={() => { setOpen(false); onToggleActive(user); }}
        />
        <MenuItem icon={<Trash2 size={14} />} label="Delete" onClick={() => { setOpen(false); onDelete(user); }} danger />
      </div>
    </PopOver>
  );
}

// ── Toggle active modal ─────────────────────────────────────────────────────
function ToggleActiveModal({
  user, open, onClose, onSaved,
}: { user: User | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const { addSnackbar } = useSnackbarContext();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const deactivating = user?.is_active ?? true;

  const confirm = async () => {
    if (!user) return;
    setPending(true);
    setError('');
    try {
      await mockClient.rpc('user_set_active', { p_user_id: user.id, p_is_active: !user.is_active });
      addSnackbar({
        message: (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>User {deactivating ? 'deactivated' : 'activated'}</span>
          </div>
        ),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="24rem" width="100%">
      <div className="flex flex-col overflow-hidden">
        <div className="modal-header">
          <h2 className="modal-title">{deactivating ? 'Deactivate user' : 'Activate user'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          {error && (
            <div className="alert alert-danger mb-4">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          <p className="text-sm">
            {deactivating ? 'Deactivate' : 'Activate'} <strong>{user?.username}</strong>?
          </p>
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button color={deactivating ? 'danger' : 'primary'} disabled={pending} onClick={confirm}>
            {pending ? 'Working…' : deactivating ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Create user modal ───────────────────────────────────────────────────────
interface CreateForm { username: string; password: string; role_code: string; company_id: string; branch_id: string }

function CreateUserModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { addSnackbar } = useSnackbarContext();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { username: '', password: '', role_code: '', company_id: '', branch_id: '' },
  });

  const roleCode = watch('role_code');
  const companyId = watch('company_id');

  const { data: roles = [] } = useRoles();
  const selectedRole = roles.find((r) => r.code === roleCode);
  const needsCompany = selectedRole ? ['COMPANY', 'BRANCH'].includes(selectedRole.scope) : false;
  const needsBranch = selectedRole?.scope === 'BRANCH';

  const { data: companies = [] } = useCompanies();
  const { data: branches = [] } = useBranches(needsBranch && companyId ? companyId : null);

  const onSubmit = async (data: CreateForm) => {
    setPending(true);
    setError('');
    try {
      await mockClient.rpc('user_create', {
        p_username: data.username,
        p_password: data.password,
        p_role_code: data.role_code,
        p_company_id: needsCompany ? Number(data.company_id) : null,
        p_branch_id: needsBranch ? Number(data.branch_id) : null,
      });
      addSnackbar({
        message: <div className="alert alert-success"><CheckCircle size={18} /><span>User created</span></div>,
      });
      reset();
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} maxWidth="28rem" width="100%">
      <form className="flex flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-header">
          <h2 className="modal-title">Create user</h2>
          <button type="button" className="modal-close-btn" onClick={() => { reset(); onClose(); }} aria-label="Close">×</button>
        </div>
        <div className="modal-content form-grid">
          {error && (
            <div className="alert alert-danger"><XCircle size={18} /><span>{error}</span></div>
          )}
          <div className="flex flex-col">
            <label className="form-label">Username</label>
            <Input error={!!errors.username} {...register('username', { required: 'Username required' })} />
            <FormErrorMessage error={errors.username} />
          </div>
          <div className="flex flex-col">
            <label className="form-label">Password</label>
            <Input
              type={showPw ? 'text' : 'password'}
              error={!!errors.password}
              endIcon={showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              onEndIconClick={() => setShowPw(!showPw)}
              {...register('password', {
                required: 'Password required',
                minLength: { value: 8, message: 'Min 8 chars' },
              })}
            />
            <FormErrorMessage error={errors.password} />
          </div>
          <div className="flex flex-col">
            <label className="form-label">Role</label>
            <Select
              options={roles.map((r) => ({ value: r.code, label: r.name }))}
              value={roleCode || null}
              onChange={(val) => {
                setValue('role_code', (val as string) ?? '', { shouldValidate: true });
                setValue('company_id', '');
                setValue('branch_id', '');
              }}
              placeholder="Select role"
              showChevron
              searchable={false}
              error={!!errors.role_code}
            />
            <input type="hidden" {...register('role_code', { required: 'Role required' })} />
            <FormErrorMessage error={errors.role_code} />
          </div>
          {needsCompany && (
            <div className="flex flex-col">
              <label className="form-label">Company</label>
              <Select
                options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
                value={companyId || null}
                onChange={(val) => { setValue('company_id', (val as string) ?? ''); setValue('branch_id', ''); }}
                placeholder="Select company"
                showChevron
              />
            </div>
          )}
          {needsBranch && (
            <div className="flex flex-col">
              <label className="form-label">Branch</label>
              <Select
                options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
                value={watch('branch_id') || null}
                onChange={(val) => setValue('branch_id', (val as string) ?? '')}
                placeholder="Select branch"
                showChevron
                disabled={!companyId}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" color="primary" disabled={pending}>
            {pending ? 'Working…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit user modal ─────────────────────────────────────────────────────────
interface EditForm { username: string; role_code: string; company_id: string; branch_id: string; is_active: boolean }

function EditUserModal({
  user, open, onClose, onSaved,
}: { user: User | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const { addSnackbar } = useSnackbarContext();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<EditForm>({
    defaultValues: { username: '', role_code: '', company_id: '', branch_id: '', is_active: true },
  });

  useEffect(() => {
    if (user && open) {
      reset({
        username: user.username,
        role_code: user.role_code,
        company_id: user.company_id ? String(user.company_id) : '',
        branch_id: user.branch_id ? String(user.branch_id) : '',
        is_active: user.is_active,
      });
      setError('');
    }
  }, [user, open, reset]);

  const roleCode = watch('role_code');
  const companyId = watch('company_id');

  const { data: roles = [] } = useRoles();
  const selectedRole = roles.find((r) => r.code === roleCode);
  const needsCompany = selectedRole ? ['COMPANY', 'BRANCH'].includes(selectedRole.scope) : false;
  const needsBranch = selectedRole?.scope === 'BRANCH';

  const { data: companies = [] } = useCompanies();
  const { data: branches = [] } = useBranches(needsBranch && companyId ? companyId : null);

  const onSubmit = async (data: EditForm) => {
    if (!user) return;
    setPending(true);
    setError('');
    try {
      await mockClient.rpc('user_update', {
        p_user_id: user.id,
        p_username: data.username,
        p_company_id: needsCompany ? Number(data.company_id) : null,
        p_branch_id: needsBranch ? Number(data.branch_id) : null,
        p_role_code: data.role_code,
        p_is_active: data.is_active,
      });
      addSnackbar({ message: <div className="alert alert-success"><CheckCircle size={18} /><span>User updated</span></div> });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="28rem" width="100%">
      <form className="flex flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-header">
          <h2 className="modal-title">Edit user</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-content form-grid">
          {error && <div className="alert alert-danger"><XCircle size={18} /><span>{error}</span></div>}
          <div className="flex flex-col">
            <label className="form-label">Username</label>
            <Input error={!!errors.username} {...register('username', { required: 'Username required' })} />
            <FormErrorMessage error={errors.username} />
          </div>
          <div className="flex flex-col">
            <label className="form-label">Role</label>
            <Select
              options={roles.map((r) => ({ value: r.code, label: r.name }))}
              value={roleCode || null}
              onChange={(val) => {
                setValue('role_code', (val as string) ?? '', { shouldValidate: true });
                setValue('company_id', '');
                setValue('branch_id', '');
              }}
              placeholder="Select role"
              showChevron
              searchable={false}
            />
            <input type="hidden" {...register('role_code', { required: 'Role required' })} />
            <FormErrorMessage error={errors.role_code} />
          </div>
          {needsCompany && (
            <div className="flex flex-col">
              <label className="form-label">Company</label>
              <Select
                options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
                value={companyId || null}
                onChange={(val) => { setValue('company_id', (val as string) ?? ''); setValue('branch_id', ''); }}
                placeholder="Select company"
                showChevron
              />
            </div>
          )}
          {needsBranch && (
            <div className="flex flex-col">
              <label className="form-label">Branch</label>
              <Select
                options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
                value={watch('branch_id') || null}
                onChange={(val) => setValue('branch_id', (val as string) ?? '')}
                placeholder="Select branch"
                showChevron
                disabled={!companyId}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <label className="form-label mb-0">Active</label>
            <Controller
              name="is_active"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Switch ref={ref} checked={value} onChange={(e) => onChange(e.target.checked)} />
              )}
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary" disabled={pending}>
            {pending ? 'Working…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Change role modal ───────────────────────────────────────────────────────
function ChangeRoleModal({
  user, open, onClose, onSaved,
}: { user: User | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const { addSnackbar } = useSnackbarContext();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const { data: roles = [] } = useRoles();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<{ role_code: string }>({
    defaultValues: { role_code: '' },
  });

  useEffect(() => {
    if (user && open) { reset({ role_code: user.role_code }); setError(''); }
  }, [user, open, reset]);

  const onSubmit = async (data: { role_code: string }) => {
    if (!user) return;
    setPending(true);
    setError('');
    try {
      await mockClient.rpc('user_change_role', { p_user_id: user.id, p_new_role_code: data.role_code });
      addSnackbar({ message: <div className="alert alert-success"><CheckCircle size={18} /><span>Role updated</span></div> });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="24rem" width="100%">
      <form className="flex flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-header">
          <h2 className="modal-title">Change role</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-content form-grid">
          {error && <div className="alert alert-danger"><XCircle size={18} /><span>{error}</span></div>}
          <div className="flex flex-col">
            <label className="form-label">Role</label>
            <Select
              options={roles.map((r) => ({ value: r.code, label: r.name }))}
              value={watch('role_code') || null}
              onChange={(val) => setValue('role_code', (val as string) ?? '', { shouldValidate: true })}
              placeholder="Select role"
              showChevron
              searchable={false}
            />
            <input type="hidden" {...register('role_code', { required: 'Role required' })} />
            <FormErrorMessage error={errors.role_code} />
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary" disabled={pending}>
            {pending ? 'Working…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Password modal ──────────────────────────────────────────────────────────
function PasswordModal({
  user, open, onClose,
}: { user: User | null; open: boolean; onClose: () => void }) {
  const { addSnackbar } = useSnackbarContext();
  const [mode, setMode] = useState<'set' | 'reset'>('set');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{ password: string; confirmPassword: string }>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleClose = () => {
    setMode('set'); reset(); setError(''); setShowPw(false); setShowConfirm(false); setTempPassword(null);
    onClose();
  };

  const onSet = async (data: { password: string; confirmPassword: string }) => {
    if (!user) return;
    setPending(true);
    setError('');
    try {
      await mockClient.rpc('user_set_password', { p_user_id: user.id, p_new_password: data.password });
      addSnackbar({ message: <div className="alert alert-success"><CheckCircle size={18} /><span>Password updated</span></div> });
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  const onReset = async () => {
    if (!user) return;
    setPending(true);
    setError('');
    try {
      const res = await mockClient.rpc<{ temp_password: string }>('user_reset_password', { p_user_id: user.id });
      setTempPassword(res.temp_password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  const copy = async () => {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    addSnackbar({ message: <div className="alert alert-success"><CheckCircle size={18} /><span>Copied</span></div> });
  };

  if (tempPassword) {
    return (
      <Modal open={open} onClose={handleClose} maxWidth="28rem" width="100%">
        <div className="flex flex-col overflow-hidden">
          <div className="modal-header">
            <h2 className="modal-title">Temporary password</h2>
            <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close">×</button>
          </div>
          <div className="modal-content">
            <div className="alert alert-success mb-4"><CheckCircle size={18} /><span>Password reset for {user?.username}</span></div>
            <div className="flex flex-col">
              <label className="form-label">Temporary password</label>
              <div className="flex gap-2">
                <Input value={tempPassword} readOnly className="flex-1 font-mono" />
                <Button type="button" variant="outline" startIcon={<Copy size={16} />} onClick={copy} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={handleClose}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="28rem" width="100%">
      <div className="flex flex-col overflow-hidden">
        <div className="modal-header">
          <h2 className="modal-title">Manage password</h2>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          <div className="flex gap-1 p-1 bg-surface rounded mb-4">
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors cursor-pointer ${
                mode === 'set' ? 'bg-primary text-primary-contrast' : 'text-subtle hover:bg-surface-hover'
              }`}
              onClick={() => { setMode('set'); reset(); }}
            >
              Set password
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors cursor-pointer ${
                mode === 'reset' ? 'bg-primary text-primary-contrast' : 'text-subtle hover:bg-surface-hover'
              }`}
              onClick={() => { setMode('reset'); reset(); }}
            >
              Reset password
            </button>
          </div>

          {error && <div className="alert alert-danger mb-4"><XCircle size={18} /><span>{error}</span></div>}

          {mode === 'set' ? (
            <form id="set-pw-form" onSubmit={handleSubmit(onSet)} className="form-grid">
              <div className="flex flex-col">
                <label className="form-label">New password</label>
                <Input
                  type={showPw ? 'text' : 'password'}
                  error={!!errors.password}
                  endIcon={showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  onEndIconClick={() => setShowPw(!showPw)}
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                />
                <FormErrorMessage error={errors.password} />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Confirm password</label>
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  error={!!errors.confirmPassword}
                  endIcon={showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  onEndIconClick={() => setShowConfirm(!showConfirm)}
                  {...register('confirmPassword', {
                    required: 'Required',
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                />
                <FormErrorMessage error={errors.confirmPassword} />
              </div>
            </form>
          ) : (
            <p className="text-sm">Generate a temporary password for <strong>{user?.username}</strong>?</p>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
          {mode === 'set' ? (
            <Button type="submit" form="set-pw-form" color="primary" disabled={pending}>
              {pending ? 'Working…' : 'Set password'}
            </Button>
          ) : (
            <Button type="button" color="primary" disabled={pending} onClick={onReset}>
              {pending ? 'Working…' : 'Reset password'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export function UsersExample() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [filterHolding, setFilterHolding] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [toggleUser, setToggleUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount =
    [filterRole, filterHolding, filterCompany, filterBranch].filter(Boolean).length
    + (sorting.length > 0 ? 1 : 0);

  const { data: holdings = [] } = useHoldings();
  const { data: roles = [] } = useRoles();
  const { data: filterCompanies = [] } = useCompanies(filterHolding || undefined);
  const { data: filterBranches = [] } = useBranches(filterCompany || null);

  const holdingOptions = holdings.map((h) => ({ value: String(h.id), label: h.name }));
  const roleOptions = roles.map((r) => ({ value: r.code, label: r.name }));
  const roleMap = useMemo(() => new Map(roles.map((r) => [r.code, r.name])), [roles]);
  const companyOptions = filterCompanies.map((c) => ({ value: String(c.id), label: c.name }));
  const branchOptions = filterBranches.map((b) => ({ value: String(b.id), label: b.name }));

  const buildEndpoint = useCallback(() => {
    const params: string[] = [];
    if (search.trim()) params.push(`or=(username.ilike.*${search.trim()}*)`);
    if (filterHolding) params.push(`holding_id=eq.${filterHolding}`);
    if (filterCompany) params.push(`company_id=eq.${filterCompany}`);
    if (filterBranch) params.push(`branch_id=eq.${filterBranch}`);
    if (filterRole) params.push(`role_code=eq.${filterRole}`);
    if (sorting.length > 0) {
      const order = sorting.map((s) => `${s.id}.${s.desc ? 'desc' : 'asc'}`).join(',');
      params.push(`order=${order}`);
    }
    return `/v_users${params.length ? `?${params.join('&')}` : ''}`;
  }, [search, filterHolding, filterCompany, filterBranch, filterRole, sorting]);

  const { data, isFetching, refetch } = useMockQuery(
    ['users', pageIndex, pageSize, search, filterHolding, filterCompany, filterBranch, filterRole, sorting] as const,
    () => mockClient.getPaginated<User>(buildEndpoint(), { page: pageIndex + 1, pageSize }),
    { keepPreviousData: true },
  );

  const users = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const selectedCount = Object.keys(rowSelection).length;
  const getSelectedUsers = () =>
    Object.keys(rowSelection).map((i) => users[Number(i)]).filter(Boolean);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPageIndex(0);
      setRowSelection({});
    }, 300);
  };

  const resetPage = () => { setPageIndex(0); setRowSelection({}); };

  const handleBulk = async (action: 'activate' | 'deactivate') => {
    const targets = getSelectedUsers();
    if (targets.length === 0) return;
    await Promise.allSettled(
      targets.map((u) =>
        mockClient.rpc('user_set_active', { p_user_id: u.id, p_is_active: action === 'activate' }),
      ),
    );
    refetch();
    setRowSelection({});
  };

  const columns: ColumnDef<User>[] = [
    createSelectColumn<User>(),
    {
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-medium">{row.getValue('username') as string}</div>
          <div className="text-[11px] text-subtle">{roleMap.get(row.original.role_code) ?? row.original.role_code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role_scope',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
      cell: ({ row }) => (
        <Badge size="sm" className="capitalize">{row.getValue('role_scope') as string}</Badge>
      ),
    },
    {
      accessorKey: 'company_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => {
        const company = row.getValue('company_name') as string | null;
        const branch = row.original.branch_name;
        if (!company) return <span className="opacity-30">—</span>;
        return (
          <div>
            <div className="text-xs">{company}</div>
            {branch && <div className="text-[11px] text-subtle">{branch}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const active = row.getValue('is_active') as boolean;
        return <Badge size="sm" color={active ? 'success' : 'danger'}>{active ? 'Active' : 'Inactive'}</Badge>;
      },
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <RowActions
          user={row.original}
          onEdit={setEditUser}
          onChangeRole={setChangeRoleUser}
          onPasswordManage={setPasswordUser}
          onToggleActive={setToggleUser}
          onDelete={() => { /* placeholder */ }}
        />
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <MobileHeader className="mobile-header-bordered md:hidden">
        <div className="mobile-header-start">
          <button className="flex items-center justify-center w-nav h-nav cursor-pointer bg-transparent border-none text-current"
                  onClick={() => window.dispatchEvent(new CustomEvent('sidemenu:open'))}>
            <ArrowRightFromLine size={18} />
          </button>
        </div>
        <div className="mobile-header-title mobile-header-title-truncate">Users</div>
        <div className="mobile-header-end px-2">
          <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover cursor-pointer text-current"
                  onClick={() => setCreateOpen(true)}>
            <Plus size={18} />
          </button>
        </div>
      </MobileHeader>

      <div className="page-content responsive-dvh-mobile-header">
        <div className="flex items-center justify-between mb-4 flex-none max-md:hidden">
          <h1 className="heading-2">Users</h1>
          <Button color="primary" startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Create
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-none pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Search username"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                size="sm"
              />
            </div>
            <div className="hidden sm:block flex-1 min-w-0">
              <Select options={roleOptions} value={filterRole || null}
                      onChange={(v) => { setFilterRole((v as string) ?? ''); resetPage(); }}
                      placeholder="All roles" size="sm" showChevron clearable searchable={false} />
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <Select options={holdingOptions} value={filterHolding || null}
                      onChange={(v) => { setFilterHolding((v as string) ?? ''); setFilterCompany(''); setFilterBranch(''); resetPage(); }}
                      placeholder="All holdings" size="sm" showChevron clearable />
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <Select options={companyOptions} value={filterCompany || null}
                      onChange={(v) => { setFilterCompany((v as string) ?? ''); setFilterBranch(''); resetPage(); }}
                      placeholder="All companies" size="sm" showChevron clearable />
            </div>
            <div className="hidden xl:block flex-1 min-w-0">
              <Select options={branchOptions} value={filterBranch || null}
                      onChange={(v) => { setFilterBranch((v as string) ?? ''); resetPage(); }}
                      placeholder="All branches" size="sm" showChevron clearable disabled={!filterCompany} />
            </div>
            <div className="xl:hidden shrink-0">
              <PopOver
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                placement="bottom"
                align="end"
                maxWidth="300px"
                trigger={
                  <Button variant="outline" size="sm" className="relative btn-icon-sm" onClick={() => setFilterOpen(!filterOpen)}>
                    <SlidersHorizontal size={16} />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-contrast text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                }
              >
                <div className="flex flex-col gap-3 p-3">
                  <div className="text-xs font-medium text-subtle uppercase tracking-wide">Filters</div>
                  <Select options={roleOptions} value={filterRole || null} onChange={(v) => { setFilterRole((v as string) ?? ''); resetPage(); }} placeholder="All roles" size="sm" showChevron clearable searchable={false} />
                  <Select options={holdingOptions} value={filterHolding || null} onChange={(v) => { setFilterHolding((v as string) ?? ''); setFilterCompany(''); setFilterBranch(''); resetPage(); }} placeholder="All holdings" size="sm" showChevron clearable />
                  <Select options={companyOptions} value={filterCompany || null} onChange={(v) => { setFilterCompany((v as string) ?? ''); setFilterBranch(''); resetPage(); }} placeholder="All companies" size="sm" showChevron clearable />
                  <Select options={branchOptions} value={filterBranch || null} onChange={(v) => { setFilterBranch((v as string) ?? ''); resetPage(); }} placeholder="All branches" size="sm" showChevron clearable disabled={!filterCompany} />
                </div>
              </PopOver>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-subtle">{selectedCount} selected</span>
              <Button variant="outline" size="sm" startIcon={<Ban size={14} />}
                      onClick={() => handleBulk('deactivate')}>Deactivate</Button>
              <Button variant="outline" size="sm" startIcon={<ShieldCheck size={14} />}
                      onClick={() => handleBulk('activate')}>Activate</Button>
              <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>Clear</Button>
            </div>
          )}
        </div>

        {/* Desktop DataTable */}
        <DataTable
          data={users}
          columns={columns}
          enableSorting
          manualSorting
          sorting={sorting}
          onSortingChange={(updater) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(next);
            setPageIndex(0);
          }}
          enablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50]}
          rowCount={totalCount}
          onPageChange={({ pageIndex: pi, pageSize: ps }) => {
            setPageIndex(pi); setPageSize(ps); setRowSelection({});
          }}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          className={`flex-1 min-h-0 hidden md:flex panel-datatable ${isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}
          noResults={<div className="p-8 text-center text-subtle">No users</div>}
        />

        {/* Mobile card list */}
        <div className={`flex-1 min-h-0 flex flex-col md:hidden ${isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <div className="flex-1 overflow-auto better-scroll pb-8">
            {users.length === 0 ? (
              <div className="p-8 text-center text-subtle">No users</div>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 px-1 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.username}</div>
                      <div className="text-sm text-subtle truncate">{roleMap.get(user.role_code) ?? user.role_code}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" className="capitalize">{user.role_scope}</Badge>
                        {user.company_name && <span className="text-xs text-subtle truncate">{user.company_name}</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge size="sm" color={user.is_active ? 'success' : 'danger'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <RowActions
                      user={user}
                      onEdit={setEditUser}
                      onChangeRole={setChangeRoleUser}
                      onPasswordManage={setPasswordUser}
                      onToggleActive={setToggleUser}
                      onDelete={() => { /* placeholder */ }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <DataTableFooter
            currentPage={pageIndex + 1}
            totalPages={Math.max(1, Math.ceil(totalCount / pageSize))}
            onPageChange={(p) => { setPageIndex(p - 1); setRowSelection({}); }}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50]}
            onPageSizeChange={(ps) => { setPageSize(ps); setPageIndex(0); setRowSelection({}); }}
            totalRows={totalCount}
          />
        </div>
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={refetch} />
      <EditUserModal user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSaved={refetch} />
      <ToggleActiveModal user={toggleUser} open={!!toggleUser} onClose={() => setToggleUser(null)} onSaved={refetch} />
      <PasswordModal user={passwordUser} open={!!passwordUser} onClose={() => setPasswordUser(null)} />
      <ChangeRoleModal user={changeRoleUser} open={!!changeRoleUser} onClose={() => setChangeRoleUser(null)} onSaved={refetch} />
    </>
  );
}
