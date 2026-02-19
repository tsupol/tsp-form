import { ContentPanel } from '../components/ContentPanel';
import { Badge } from '../../components/Badge';
import { Check, X, AlertTriangle, Info, Star, Zap } from 'lucide-react';

const colors = ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;
const sizes = ['xs', 'sm', 'md', 'lg'] as const;

export function BadgePage() {
  return (
    <div className="page-content">
      <div className="grid gap-4">

        {/* Solid variant */}
        <ContentPanel title="Solid (default)">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            {colors.map((c) => (
              <Badge key={c} color={c}>{c}</Badge>
            ))}
          </div>
        </ContentPanel>

        {/* Outline variant */}
        <ContentPanel title="Outline">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            {colors.map((c) => (
              <Badge key={c} color={c} variant="outline">{c}</Badge>
            ))}
          </div>
        </ContentPanel>

        {/* Sizes */}
        <ContentPanel title="Sizes">
          <div className="flex gap-2 flex-wrap items-end border border-line bg-surface p-card">
            {sizes.map((s) => (
              <Badge key={s} color="primary" size={s}>{s}</Badge>
            ))}
          </div>
        </ContentPanel>

        {/* With icons */}
        <ContentPanel title="With Icons">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <Badge color="success"><Check /> Approved</Badge>
            <Badge color="danger"><X /> Rejected</Badge>
            <Badge color="warning"><AlertTriangle /> Warning</Badge>
            <Badge color="info"><Info /> Info</Badge>
            <Badge color="primary">Featured <Star /></Badge>
            <Badge color="secondary"><Zap /> New</Badge>
          </div>
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <Badge color="success" variant="outline"><Check /> Approved</Badge>
            <Badge color="danger" variant="outline"><X /> Rejected</Badge>
            <Badge color="warning" variant="outline"><AlertTriangle /> Warning</Badge>
            <Badge color="primary" variant="outline">Featured <Star /></Badge>
          </div>
        </ContentPanel>

        {/* Icon sizes */}
        <ContentPanel title="Icons at Different Sizes">
          <div className="flex gap-2 flex-wrap items-end border border-line bg-surface p-card">
            <Badge color="success" size="xs"><Check /> Done</Badge>
            <Badge color="success" size="sm"><Check /> Done</Badge>
            <Badge color="success" size="md"><Check /> Done</Badge>
            <Badge color="success" size="lg"><Check /> Done</Badge>
          </div>
        </ContentPanel>

        {/* Truncation */}
        <ContentPanel title="Truncation">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card" style={{ maxWidth: '10rem' }}>
            <Badge color="primary" truncate>This is a very long badge label that should truncate</Badge>
            <Badge color="secondary" truncate><Star /> Long label with icon that truncates nicely</Badge>
          </div>
        </ContentPanel>

        {/* Tailwind overrides */}
        <ContentPanel title="Tailwind Utility Overrides">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <Badge color="primary">Default weight</Badge>
            <Badge color="primary" className="font-normal">font-normal</Badge>
            <Badge color="primary" className="font-bold">font-bold</Badge>
            <Badge color="primary" className="font-black">font-black</Badge>
          </div>
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <Badge color="secondary">Default size</Badge>
            <Badge color="secondary" className="text-xs">text-xs</Badge>
            <Badge color="secondary" className="text-sm">text-sm</Badge>
            <Badge color="secondary" className="text-base">text-base</Badge>
          </div>
        </ContentPanel>

        {/* CSS-only usage */}
        <ContentPanel title="CSS-only (no component)">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-outline-danger">Outline</span>
            <span className="badge badge-sm badge-success">Small</span>
          </div>
        </ContentPanel>

      </div>
    </div>
  );
}
