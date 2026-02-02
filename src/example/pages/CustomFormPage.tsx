import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Search } from 'lucide-react';
import { AsyncSelectSection } from './custom-page-sections/AsyncSelectSection';

export function CustomFormPage() {
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectValue3, setSelectValue3] = useState<string | null>(null);

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg w-full max-w-[600px]">
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
              <label className="form-label">Status</label>
              <div className="w-5/12">
                <Select
                  id="status"
                  startIcon={<Search size={16}/>}
                  options={[
                    { value: 'active', label: 'Active', icon: <span style={{ color: '#22c55e' }}>●</span> },
                    { value: 'pending', label: 'Pending', icon: <span style={{ color: '#eab308' }}>●</span> },
                    { value: 'inactive', label: 'Inactive', icon: <span style={{ color: '#ef4444' }}>●</span> },
                  ]}
                  value={selectValue3}
                  onChange={(v) => setSelectValue3(v as string | null)}
                  placeholder="Select status..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Submit</Button>
            </div>
          </div>
        </div>
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg w-full max-w-[600px]">
          <AsyncSelectSection/>
        </div>
      </div>
    </div>
  );
}
