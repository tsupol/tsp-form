import { useState } from 'react';
import { NumberSpinner } from '../../components/NumberSpinner';

const scales = ['xs', 'sm', 'md', 'lg'] as const;

export function NumberSpinnerPage() {
  const [values, setValues] = useState<Record<string, number | ''>>({
    xs: 0, sm: 0, md: 0, lg: 0,
    'diag-xs': 0, 'diag-sm': 0, 'diag-md': 0, 'diag-lg': 0,
    minMax: 5, disabled: 3, leadingZero: 7, error: 0,
    width: 42,
  });

  const set = (key: string) => (v: number | '') => setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[900px]">
        <h1 className="heading-1">NumberSpinner</h1>
        <p className="text-muted">
          Numeric input with increment/decrement buttons. Supports two variants: <code>default</code> and <code>diagonal</code>.
        </p>

        {/* Default variant — all sizes */}
        <section className="card">
          <h3 className="heading-3 mb-4">Default Variant</h3>
          <div className="flex items-end gap-6 flex-wrap">
            {scales.map((s) => (
              <div key={s} className="flex flex-col">
                <label className="form-label">{s}</label>
                <NumberSpinner scale={s} value={values[s]} onChange={set(s)} min={0} max={99} />
              </div>
            ))}
          </div>
        </section>

        {/* Diagonal variant — all sizes */}
        <section className="card">
          <h3 className="heading-3 mb-4">Diagonal Variant</h3>
          <div className="flex items-end gap-6 flex-wrap">
            {scales.map((s) => (
              <div key={s} className="flex flex-col">
                <label className="form-label">{s}</label>
                <NumberSpinner variant="diagonal" scale={s} value={values[`diag-${s}`]} onChange={set(`diag-${s}`)} min={0} max={99} />
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="card">
          <h3 className="heading-3 mb-4">Features</h3>
          <div className="flex items-end gap-6 flex-wrap">
            <div className="flex flex-col">
              <label className="form-label">Min 0 / Max 10</label>
              <NumberSpinner value={values.minMax} onChange={set('minMax')} min={0} max={10} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Leading Zero</label>
              <NumberSpinner value={values.leadingZero} onChange={set('leadingZero')} leadingZero min={0} max={99} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Step 5</label>
              <NumberSpinner value={values.minMax} onChange={set('minMax')} step={5} min={0} max={100} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Disabled</label>
              <NumberSpinner value={values.disabled} onChange={set('disabled')} disabled />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Error</label>
              <NumberSpinner value={values.error} onChange={set('error')} error />
            </div>
          </div>
        </section>

        {/* Custom width */}
        <section className="card">
          <h3 className="heading-3 mb-4">Custom Width</h3>
          <p className="text-muted mb-3">Use Tailwind width classes via <code>className</code>.</p>
          <div className="flex items-end gap-6 flex-wrap">
            <div className="flex flex-col">
              <label className="form-label">w-40</label>
              <NumberSpinner className="w-40" value={values.width} onChange={set('width')} min={0} max={999} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">w-60</label>
              <NumberSpinner className="w-60" value={values.width} onChange={set('width')} min={0} max={999} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
