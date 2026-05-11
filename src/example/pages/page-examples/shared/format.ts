export function fmtCurrency(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(v);
}

export function fmtNum(v: number): string {
  return new Intl.NumberFormat('en-US').format(v);
}

export function fmtDateTime(v: string | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
