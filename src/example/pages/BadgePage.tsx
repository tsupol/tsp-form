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

        {/* With icons */}
        <section>
          <h3 className="heading-3 mb-3">With Icons</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="success" startIcon={<Check />}>Approved</Badge>
            <Badge color="danger" startIcon={<X />}>Rejected</Badge>
            <Badge color="warning" startIcon={<AlertTriangle />}>Warning</Badge>
            <Badge color="info" startIcon={<Info />}>Info</Badge>
            <Badge color="primary" endIcon={<Star />}>Featured</Badge>
            <Badge color="secondary" startIcon={<Zap />}>New</Badge>
          </div>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="success" variant="outline" startIcon={<Check />}>Approved</Badge>
            <Badge color="danger" variant="outline" startIcon={<X />}>Rejected</Badge>
            <Badge color="warning" variant="outline" startIcon={<AlertTriangle />}>Warning</Badge>
            <Badge color="primary" variant="outline" endIcon={<Star />}>Featured</Badge>
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h3 className="heading-3 mb-3">Sizes</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            {sizes.map((s) => (
              <>
                <Badge key={s} color="primary" size={s}>{s}</Badge>
                <Badge key={`${s}-icon`} color="success" size={s} startIcon={<Check />}>{s}</Badge>
              </>
            ))}
          </div>
        </section>

        {/* Icon-only */}
        <section>
          <h3 className="heading-3 mb-3">Icon Only</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="primary" size="xs" startIcon={<Star />} />
            <Badge color="primary" size="sm" startIcon={<Star />} />
            <Badge color="primary" startIcon={<Star />} />
            <Badge color="primary" size="lg" startIcon={<Star />} />
          </div>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="success" startIcon={<Check />} />
            <Badge color="danger" startIcon={<X />} />
            <Badge color="warning" startIcon={<AlertTriangle />} />
            <Badge color="info" startIcon={<Info />} />
          </div>
          <div className="flex gap-2 flex-wrap items-center card">
            <Badge color="success" variant="outline" startIcon={<Check />} />
            <Badge color="danger" variant="outline" startIcon={<X />} />
            <Badge color="warning" variant="outline" startIcon={<AlertTriangle />} />
            <Badge color="info" variant="outline" startIcon={<Info />} />
          </div>
        </section>

        {/* Truncation */}
        <section>
          <h3 className="heading-3 mb-3">Truncation</h3>
          <div className="flex gap-2 flex-wrap items-center card" style={{ maxWidth: '10rem' }}>
            <Badge color="primary" truncate>This is a very long badge label that should truncate</Badge>
            <Badge color="secondary" truncate startIcon={<Star />}>Long label with icon that truncates nicely</Badge>
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
