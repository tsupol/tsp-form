import { useState } from 'react';
import { ContentPanel } from '../components/ContentPanel';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Search } from 'lucide-react';

export function ButtonGroupPage() {
  const [currency, setCurrency] = useState<string | string[] | null>('USD');

  return (
    <div className="page-content">
      <div className="grid gap-4">

        {/* Button Group */}
        <ContentPanel title="Button Group">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <div className="btn-group">
              <Button variant="outline">Left</Button>
              <Button variant="outline">Center</Button>
              <Button variant="outline">Right</Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <div className="btn-group">
              <Button color="primary">One</Button>
              <Button color="primary">Two</Button>
              <Button color="primary">Three</Button>
            </div>
            <div className="btn-group">
              <Button variant="outline" color="danger">Delete</Button>
              <Button variant="outline" color="danger" size="icon"><Trash2/></Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <div className="btn-group">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="outline" size="sm">Group</Button>
            </div>
            <div className="btn-group">
              <Button variant="outline">Medium</Button>
              <Button variant="outline">Group</Button>
            </div>
            <div className="btn-group">
              <Button variant="outline" size="lg">Large</Button>
              <Button variant="outline" size="lg">Group</Button>
            </div>
          </div>
        </ContentPanel>

        {/* Icon Toolbar */}
        <ContentPanel title="Icon Toolbar">
          <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
            <div className="btn-group">
              <Button variant="outline" size="icon"><Bold/></Button>
              <Button variant="outline" size="icon"><Italic/></Button>
              <Button variant="outline" size="icon"><Underline/></Button>
            </div>
            <div className="btn-group">
              <Button variant="outline" size="icon"><AlignLeft/></Button>
              <Button variant="outline" size="icon"><AlignCenter/></Button>
              <Button variant="outline" size="icon"><AlignRight/></Button>
            </div>
          </div>
        </ContentPanel>

        {/* Input Group */}
        <ContentPanel title="Input Group">
          <div className="flex gap-4 flex-wrap items-center border border-line bg-surface p-card">
            <div className="input-group">
              <Input placeholder="Search..."/>
              <Button color="primary"><Search/> Search</Button>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap items-center border border-line bg-surface p-card">
            <div className="input-group">
              <Button variant="outline">Action</Button>
              <Input placeholder="Type here..."/>
              <Button color="primary"><Plus/></Button>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap items-center border border-line bg-surface p-card">
            <div className="input-group">
              <div className="w-[6rem]">
                <Select searchable={false} options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }]} value={currency} onChange={setCurrency}
                        placeholder="Currency"/>
              </div>
              <div className="input-group-divider"/>
              <Input placeholder="Amount"/>
              <Button>Convert</Button>
            </div>
          </div>
        </ContentPanel>

      </div>
    </div>
  );
}
