import { useState } from 'react';
import { Checkbox } from '../../components/Checkbox';
import { LabeledCheckbox } from '../../components/LabeledCheckbox';

export function CheckboxPage() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <h1 className="heading-1">Checkbox</h1>

        {/* Basic */}
        <section>
          <h3 className="heading-3 mb-3">Basic</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox /> Unchecked
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox defaultChecked /> Checked
            </label>
          </div>
        </section>

        {/* Controlled */}
        <section>
          <h3 className="heading-3 mb-3">Controlled</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              {checked ? 'Checked' : 'Unchecked'}
            </label>
          </div>
        </section>

        {/* Disabled */}
        <section>
          <h3 className="heading-3 mb-3">Disabled</h3>
          <div className="flex gap-4 items-center card">
            <label className="flex items-center gap-2 text-sm cursor-pointer opacity-50">
              <Checkbox disabled /> Disabled unchecked
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer opacity-50">
              <Checkbox disabled defaultChecked /> Disabled checked
            </label>
          </div>
        </section>

        {/* LabeledCheckbox */}
        <section>
          <h3 className="heading-3 mb-3">LabeledCheckbox</h3>
          <div className="card flex flex-col gap-2">
            <LabeledCheckbox label="Email notifications" defaultChecked />
            <LabeledCheckbox label="SMS notifications" />
            <LabeledCheckbox label="Push notifications" defaultChecked />
            <LabeledCheckbox label="Disabled option" disabled />
          </div>
        </section>

      </div>
    </div>
  );
}
