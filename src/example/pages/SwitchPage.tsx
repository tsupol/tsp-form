import { useState } from 'react';
import { Switch } from '../../components/Switch';

export function SwitchPage() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <h1 className="heading-1">Switch</h1>

        {/* Sizes */}
        <section>
          <h3 className="heading-3 mb-3">Sizes</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm">
              <Switch size="sm" /> Small
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch size="md" /> Medium (default)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch size="lg" /> Large
            </label>
          </div>
        </section>

        {/* Default checked */}
        <section>
          <h3 className="heading-3 mb-3">Default Checked</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm">
              <Switch defaultChecked /> Enabled by default
            </label>
          </div>
        </section>

        {/* Controlled */}
        <section>
          <h3 className="heading-3 mb-3">Controlled</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              {checked ? 'On' : 'Off'}
            </label>
          </div>
        </section>

        {/* Disabled */}
        <section>
          <h3 className="heading-3 mb-3">Disabled</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm">
              <Switch disabled /> Disabled off
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch disabled defaultChecked /> Disabled on
            </label>
          </div>
        </section>

      </div>
    </div>
  );
}
