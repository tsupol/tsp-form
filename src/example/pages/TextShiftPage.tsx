import { useState } from 'react';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Search, ChevronRight } from 'lucide-react';

const selectOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export function TextShiftPage() {
  const [selSm, setSelSm] = useState<string | null>('option1');
  const [selMd, setSelMd] = useState<string | null>('option1');
  const [selLg, setSelLg] = useState<string | null>('option1');

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[900px]">
        <h1 className="heading-1">Text Shift Adjusting</h1>
        <p className="text-muted">
          Verifies vertical text alignment across Input, Select, Button, and Badge at each size.
          The <code>--text-shift-y</code> variable compensates for font baseline offset.
        </p>

        {/* SM row */}
        <section className="card">
          <h2 className="heading-3 mb-4">Small (sm)</h2>
          <div className="flex items-center gap-3">
            <Input size="sm" placeholder="Input sm" className="w-48" />
            <Select
              size="sm"
              options={selectOptions}
              value={selSm}
              onChange={(v) => setSelSm(v as string | null)}
              className="w-48"
            />
            <Button size="sm">Button</Button>
            <Button size="sm" variant="outline" startIcon={<Search size={14} />}>Outline</Button>
            <Badge size="sm">Badge</Badge>
            <Badge size="sm" variant="outline" color="primary">Outline</Badge>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Input size="sm" placeholder="Search..." startIcon={<Search size={14} />} className="w-48" />
            <Select
              size="sm"
              startIcon={<Search size={14} />}
              options={selectOptions}
              value={selSm}
              onChange={(v) => setSelSm(v as string | null)}
              className="w-48"
            />
            <Button size="sm" color="primary" endIcon={<ChevronRight size={14} />}>Primary</Button>
            <Button size="sm" variant="ghost">Ghost</Button>
            <Badge size="sm" color="success">Success</Badge>
            <Badge size="sm" color="danger">Danger</Badge>
          </div>
        </section>

        {/* MD row */}
        <section className="card">
          <h2 className="heading-3 mb-4">Medium (md)</h2>
          <div className="flex items-center gap-3">
            <Input placeholder="Input md" className="w-48" />
            <Select
              options={selectOptions}
              value={selMd}
              onChange={(v) => setSelMd(v as string | null)}
              className="w-48"
            />
            <Button>Button</Button>
            <Button variant="outline" startIcon={<Search size={16} />}>Outline</Button>
            <Badge>Badge</Badge>
            <Badge variant="outline" color="primary">Outline</Badge>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Input placeholder="Search..." startIcon={<Search size={16} />} className="w-48" />
            <Select
              startIcon={<Search size={16} />}
              options={selectOptions}
              value={selMd}
              onChange={(v) => setSelMd(v as string | null)}
              className="w-48"
            />
            <Button color="primary" endIcon={<ChevronRight size={16} />}>Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge color="success">Success</Badge>
            <Badge color="danger">Danger</Badge>
          </div>
        </section>

        {/* LG row */}
        <section className="card">
          <h2 className="heading-3 mb-4">Large (lg)</h2>
          <div className="flex items-center gap-3">
            <Input size="lg" placeholder="Input lg" className="w-48" />
            <Select
              size="lg"
              options={selectOptions}
              value={selLg}
              onChange={(v) => setSelLg(v as string | null)}
              className="w-48"
            />
            <Button size="lg">Button</Button>
            <Button size="lg" variant="outline" startIcon={<Search size={20} />}>Outline</Button>
            <Badge size="lg">Badge</Badge>
            <Badge size="lg" variant="outline" color="primary">Outline</Badge>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Input size="lg" placeholder="Search..." startIcon={<Search size={20} />} className="w-48" />
            <Select
              size="lg"
              startIcon={<Search size={20} />}
              options={selectOptions}
              value={selLg}
              onChange={(v) => setSelLg(v as string | null)}
              className="w-48"
            />
            <Button size="lg" color="primary" endIcon={<ChevronRight size={20} />}>Primary</Button>
            <Button size="lg" variant="ghost">Ghost</Button>
            <Badge size="lg" color="success">Success</Badge>
            <Badge size="lg" color="danger">Danger</Badge>
          </div>
        </section>
        {/* Badge text case & language debug */}
        <section className="card">
          <h2 className="heading-3 mb-4">Badge — Text Cases &amp; Languages</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge size="xs">lowercase</Badge>
            <Badge size="xs" color="primary">UPPERCASE</Badge>
            <Badge size="xs" color="secondary">Capitalize</Badge>
            <Badge size="xs" color="success">สวัสดี</Badge>
            <Badge size="xs" color="warning">Mixed ไทย</Badge>
            <Badge size="xs" color="danger">ABCdef</Badge>
            <Badge size="xs" color="info">ทดสอบ Test</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge size="sm">lowercase</Badge>
            <Badge size="sm" color="primary">UPPERCASE</Badge>
            <Badge size="sm" color="secondary">Capitalize</Badge>
            <Badge size="sm" color="success">สวัสดี</Badge>
            <Badge size="sm" color="warning">Mixed ไทย</Badge>
            <Badge size="sm" color="danger">ABCdef</Badge>
            <Badge size="sm" color="info">ทดสอบ Test</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge>lowercase</Badge>
            <Badge color="primary">UPPERCASE</Badge>
            <Badge color="secondary">Capitalize</Badge>
            <Badge color="success">สวัสดี</Badge>
            <Badge color="warning">Mixed ไทย</Badge>
            <Badge color="danger">ABCdef</Badge>
            <Badge color="info">ทดสอบ Test</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge size="lg">lowercase</Badge>
            <Badge size="lg" color="primary">UPPERCASE</Badge>
            <Badge size="lg" color="secondary">Capitalize</Badge>
            <Badge size="lg" color="success">สวัสดี</Badge>
            <Badge size="lg" color="warning">Mixed ไทย</Badge>
            <Badge size="lg" color="danger">ABCdef</Badge>
            <Badge size="lg" color="info">ทดสอบ Test</Badge>
          </div>
        </section>

        <section className="card">
          <h2 className="heading-3 mb-4">Badge Outline — Text Cases &amp; Languages</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge size="xs" variant="outline">lowercase</Badge>
            <Badge size="xs" variant="outline" color="primary">UPPERCASE</Badge>
            <Badge size="xs" variant="outline" color="secondary">Capitalize</Badge>
            <Badge size="xs" variant="outline" color="success">สวัสดี</Badge>
            <Badge size="xs" variant="outline" color="warning">Mixed ไทย</Badge>
            <Badge size="xs" variant="outline" color="danger">ABCdef</Badge>
            <Badge size="xs" variant="outline" color="info">ทดสอบ Test</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge size="sm" variant="outline">lowercase</Badge>
            <Badge size="sm" variant="outline" color="primary">UPPERCASE</Badge>
            <Badge size="sm" variant="outline" color="secondary">Capitalize</Badge>
            <Badge size="sm" variant="outline" color="success">สวัสดี</Badge>
            <Badge size="sm" variant="outline" color="warning">Mixed ไทย</Badge>
            <Badge size="sm" variant="outline" color="danger">ABCdef</Badge>
            <Badge size="sm" variant="outline" color="info">ทดสอบ Test</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge variant="outline">lowercase</Badge>
            <Badge variant="outline" color="primary">UPPERCASE</Badge>
            <Badge variant="outline" color="secondary">Capitalize</Badge>
            <Badge variant="outline" color="success">สวัสดี</Badge>
            <Badge variant="outline" color="warning">Mixed ไทย</Badge>
            <Badge variant="outline" color="danger">ABCdef</Badge>
            <Badge variant="outline" color="info">ทดสอบ Test</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge size="lg" variant="outline">lowercase</Badge>
            <Badge size="lg" variant="outline" color="primary">UPPERCASE</Badge>
            <Badge size="lg" variant="outline" color="secondary">Capitalize</Badge>
            <Badge size="lg" variant="outline" color="success">สวัสดี</Badge>
            <Badge size="lg" variant="outline" color="warning">Mixed ไทย</Badge>
            <Badge size="lg" variant="outline" color="danger">ABCdef</Badge>
            <Badge size="lg" variant="outline" color="info">ทดสอบ Test</Badge>
          </div>
        </section>
      </div>
    </div>
  );
}
