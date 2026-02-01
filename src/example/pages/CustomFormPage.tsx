import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';

export function CustomFormPage() {
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectValue2, setSelectValue2] = useState<string | null>(null);

  return (
    <div className="page-content">
      <div className="border border-line bg-surface p-card space-y-4 rounded-lg w-full max-w-[500px]">
        <h1 className="text-xl font-bold mb-4">Custom Form</h1>
        <div className="grid gap-3">
          <div className="flex flex-col gap-1">
            <label className="form-label">Category & Name</label>
            <div className="input-group">
              <div className="w-5/12">
                <Select
                  id="category"
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' },
                  ]}
                  value={selectValue}
                  onChange={(v) => setSelectValue(v as string | null)}
                  placeholder="Select..."
                />
              </div>
              <div className="input-group-divider"/>
              <Input className="flex-1" placeholder="Enter value..."/>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Type</label>
            <div className="w-5/12">
              <Select
                id="type"
                options={[
                  { value: 'typeA', label: 'Type A' },
                  { value: 'typeB', label: 'Type B' },
                  { value: 'typeC', label: 'Type C' },
                ]}
                value={selectValue2}
                onChange={(v) => setSelectValue2(v as string | null)}
                placeholder="Select type..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
