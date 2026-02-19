import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Search } from 'lucide-react';

export function ButtonGroupPage() {
  const [currency, setCurrency] = useState<string | string[] | null>('USD');

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <h1 className="heading-1">Button Group</h1>

        {/* Button Group */}
        <section>
          <h3 className="heading-3 mb-3">Button Group</h3>
          <div className="flex gap-2 flex-wrap items-center card">
            <div className="btn-group">
              <Button variant="outline">Left</Button>
              <Button variant="outline">Center</Button>
              <Button variant="outline">Right</Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center card">
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
          <div className="flex gap-2 flex-wrap items-center card">
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
        </section>

        {/* Icon Toolbar */}
        <section>
          <h3 className="heading-3 mb-3">Icon Toolbar</h3>
          <div className="flex gap-2 flex-wrap items-center card">
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
        </section>

        {/* Input Group */}
        <section>
          <h3 className="heading-3 mb-3">Input Group</h3>
          <div className="flex gap-4 flex-wrap items-center card">
            <div className="input-group">
              <Input placeholder="Search..."/>
              <Button color="primary"><Search/> Search</Button>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap items-center card">
            <div className="input-group">
              <Button variant="outline">Action</Button>
              <div className="input-group-divider"/>
              <Input placeholder="Type here..."/>
              <Button color="primary"><Plus/></Button>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap items-center card">
            <div className="input-group">
              <div className="w-[6rem]">
                <Select searchable={false} options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }]} value={currency} onChange={setCurrency}
                        placeholder="Currency"/>
              </div>
              <div className="input-group-divider"/>
              <Input placeholder="Amount"/>
              <div className="input-group-divider"/>
              <Button>Convert</Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
