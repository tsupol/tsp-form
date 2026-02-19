import { Badge } from '../../components/Badge';
import { Check, X, AlertTriangle, Info, Star, Zap } from 'lucide-react';

const colors = ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;
const sizes = ['xs', 'sm', 'md', 'lg'] as const;

export function BadgePage() {
  return (
    <div className="page-content">
      <div className="grid gap-4">
        <h1 className="heading-1">Badge</h1>

        {/* Solid variant */}
        <section>
          <h3 className="heading-3 mb-3">Solid (default)</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            {colors.map((c) => (
              <Badge key={c} color={c}>{c}</Badge>
            ))}
          </div>
        </section>

        {/* Outline variant */}
        <section>
          <h3 className="heading-3 mb-3">Outline</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            {colors.map((c) => (
              <Badge key={c} color={c} variant="outline">{c}</Badge>
            ))}
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h3 className="heading-3 mb-3">Sizes</h3>
          <div className="flex gap-2 flex-wrap items-end card">
            {sizes.map((s) => (
              <Badge key={s} color="primary" size={s}>{s}</Badge>
            ))}
          </div>
        </section>

        {/* With icons */}
        <section>
          <h3 className="heading-3 mb-3">With Icons</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="success"><Check /> Approved</Badge>
            <Badge color="danger"><X /> Rejected</Badge>
            <Badge color="warning"><AlertTriangle /> Warning</Badge>
            <Badge color="info"><Info /> Info</Badge>
            <Badge color="primary">Featured <Star /></Badge>
            <Badge color="secondary"><Zap /> New</Badge>
          </div>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="success" variant="outline"><Check /> Approved</Badge>
            <Badge color="danger" variant="outline"><X /> Rejected</Badge>
            <Badge color="warning" variant="outline"><AlertTriangle /> Warning</Badge>
            <Badge color="primary" variant="outline">Featured <Star /></Badge>
          </div>
        </section>

        {/* Icon sizes */}
        <section>
          <h3 className="heading-3 mb-3">Icons at Different Sizes</h3>
          <div className="flex gap-2 flex-wrap items-end card">
            <Badge color="success" size="xs"><Check /> Done</Badge>
            <Badge color="success" size="sm"><Check /> Done</Badge>
            <Badge color="success" size="md"><Check /> Done</Badge>
            <Badge color="success" size="lg"><Check /> Done</Badge>
          </div>
        </section>

        {/* Truncation */}
        <section>
          <h3 className="heading-3 mb-3">Truncation</h3>
          <div className="flex gap-2 flex-wrap items-center card" style={{ maxWidth: '10rem' }}>
            <Badge color="primary" truncate>This is a very long badge label that should truncate</Badge>
            <Badge color="secondary" truncate><Star /> Long label with icon that truncates nicely</Badge>
          </div>
        </section>

        {/* Tailwind overrides */}
        <section>
          <h3 className="heading-3 mb-3">Tailwind Utility Overrides</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="primary">Default weight</Badge>
            <Badge color="primary" className="font-normal">font-normal</Badge>
            <Badge color="primary" className="font-bold">font-bold</Badge>
            <Badge color="primary" className="font-black">font-black</Badge>
          </div>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="secondary">Default size</Badge>
            <Badge color="secondary" className="text-xs">text-xs</Badge>
            <Badge color="secondary" className="text-sm">text-sm</Badge>
            <Badge color="secondary" className="text-base">text-base</Badge>
          </div>
        </section>

        {/* CSS-only usage */}
        <section>
          <h3 className="heading-3 mb-3">CSS-only (no component)</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-outline-danger">Outline</span>
            <span className="badge badge-sm badge-success">Small</span>
          </div>
        </section>

      </div>
    </div>
  );
}
