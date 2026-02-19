import { useState } from 'react';
import { Select, type Option, type SelectItem } from '../../components/Select';
import { Apple, Cherry, Grape, Citrus, Banana, Leaf, Globe, Star } from 'lucide-react';

const fruitOptions: Option[] = [
  { value: 'apple', label: 'Apple', icon: <Apple size={16} /> },
  { value: 'banana', label: 'Banana', icon: <Banana size={16} /> },
  { value: 'cherry', label: 'Cherry', icon: <Cherry size={16} /> },
  { value: 'grape', label: 'Grape', icon: <Grape size={16} /> },
  { value: 'lemon', label: 'Lemon', icon: <Citrus size={16} /> },
];

const longLabelOptions: Option[] = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium length option' },
  { value: 'long', label: 'This is a very long option label that should be truncated in the chip' },
  { value: 'longer', label: 'Another extremely long label to demonstrate chip truncation behavior' },
  { value: 'longest', label: 'Super duper ultra mega extremely ridiculously long option label text' },
];

const languageOptions: Option[] = [
  { value: 'en', label: 'English', icon: <Globe size={16} /> },
  { value: 'es', label: 'Spanish', icon: <Globe size={16} /> },
  { value: 'fr', label: 'French', icon: <Globe size={16} /> },
  { value: 'de', label: 'German', icon: <Globe size={16} /> },
  { value: 'ja', label: 'Japanese', icon: <Globe size={16} /> },
  { value: 'ko', label: 'Korean', icon: <Globe size={16} /> },
  { value: 'zh', label: 'Chinese', icon: <Globe size={16} /> },
];

const userOptions: Option[] = [
  { value: 'alice', label: 'Alice Johnson' },
  { value: 'bob', label: 'Bob Smith' },
  { value: 'carol', label: 'Carol Williams' },
  { value: 'dave', label: 'Dave Brown' },
  { value: 'eve', label: 'Eve Davis' },
];

const userMeta: Record<string, { role: string; email: string; status: 'online' | 'away' | 'offline' }> = {
  alice: { role: 'Admin', email: 'alice@example.com', status: 'online' },
  bob: { role: 'Developer', email: 'bob@example.com', status: 'away' },
  carol: { role: 'Designer', email: 'carol@example.com', status: 'online' },
  dave: { role: 'Manager', email: 'dave@example.com', status: 'offline' },
  eve: { role: 'Developer', email: 'eve@example.com', status: 'online' },
};

const statusColor: Record<string, string> = {
  online: '#22c55e',
  away: '#f59e0b',
  offline: '#6b7280',
};

const ratingOptions: Option[] = [
  { value: '1', label: '1 Star' },
  { value: '2', label: '2 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '5', label: '5 Stars' },
];

const groupedOptions: SelectItem[] = [
  { type: 'group', label: 'Fruits' },
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { type: 'separator' },
  { type: 'group', label: 'Vegetables' },
  { value: 'carrot', label: 'Carrot' },
  { value: 'broccoli', label: 'Broccoli' },
  { value: 'spinach', label: 'Spinach' },
];

export function SelectPage() {
  const [basic, setBasic] = useState<string | null>(null);
  const [multi, setMulti] = useState<string[] | null>(null);
  const [longMulti, setLongMulti] = useState<string[] | null>(['long', 'longer', 'longest']);
  const [maxSelect, setMaxSelect] = useState<string[] | null>(null);
  const [chipSingle, setChipSingle] = useState<string | null>('apple');
  const [clearable, setClearable] = useState<string | null>('banana');
  const [sizeSmall, setSizeSmall] = useState<string | null>(null);
  const [sizeLarge, setSizeLarge] = useState<string | null>(null);
  const [customUser, setCustomUser] = useState<string | null>(null);
  const [customRating, setCustomRating] = useState<string | null>(null);
  const [customMultiUser, setCustomMultiUser] = useState<string[] | null>(null);
  const [grouped, setGrouped] = useState<string | null>(null);
  const [multiShowSelected, setMultiShowSelected] = useState<string[] | null>(null);

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[600px]">

        {/* Basic */}
        <div className="card space-y-3">
          <h2 className="heading-3">Basic Select</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Pick a fruit</label>
            <Select
              options={fruitOptions}
              value={basic}
              onChange={(v) => setBasic(v as string)}
              placeholder="Select a fruit..."
            />
          </div>
        </div>

        {/* Grouped */}
        <div className="card space-y-3">
          <h2 className="heading-3">Grouped Options</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Pick a food</label>
            <Select
              options={groupedOptions}
              value={grouped}
              onChange={(v) => setGrouped(v as string)}
              placeholder="Select..."
            />
          </div>
        </div>

        {/* Multi select */}
        <div className="card space-y-3">
          <h2 className="heading-3">Multi Select</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Pick fruits</label>
            <Select
              options={fruitOptions}
              value={multi}
              onChange={(v) => setMulti(v as string[])}
              multiple
              placeholder="Select fruits..."
            />
          </div>
        </div>

        {/* Multi select - show selected in list */}
        <div className="card space-y-3">
          <h2 className="heading-3">Multi Select (Show Selected in List)</h2>
          <p className="text-sm text-muted">Selected items stay in the dropdown with a highlight instead of being removed.</p>
          <div className="flex flex-col gap-1">
            <label className="form-label">Pick languages</label>
            <Select
              options={languageOptions}
              value={multiShowSelected}
              onChange={(v) => setMultiShowSelected(v as string[])}
              multiple
              showSelectedInList
              placeholder="Select languages..."
            />
          </div>
        </div>

        {/* Long labels - truncation */}
        <div className="card space-y-3">
          <h2 className="heading-3">Chip Truncation</h2>
          <p className="text-sm text-muted">Long labels are truncated in chips. Customize max width with <code>--max-width-select-chip</code>.</p>
          <div className="flex flex-col gap-1">
            <label className="form-label">Default max width (10rem)</label>
            <Select
              options={longLabelOptions}
              value={longMulti}
              onChange={(v) => setLongMulti(v as string[])}
              multiple
              placeholder="Select options..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Custom max width (20rem)</label>
            <Select
              options={longLabelOptions}
              value={longMulti}
              onChange={(v) => setLongMulti(v as string[])}
              multiple
              placeholder="Select options..."
              className="[--max-width-select-chip:20rem]"
            />
          </div>
        </div>

        {/* Max select */}
        <div className="card space-y-3">
          <h2 className="heading-3">Max Select (3)</h2>
          <p className="text-sm text-muted">Cannot select more than 3 items.</p>
          <div className="flex flex-col gap-1">
            <label className="form-label">Pick up to 3 languages</label>
            <Select
              options={languageOptions}
              value={maxSelect}
              onChange={(v) => setMaxSelect(v as string[])}
              multiple
              maxSelect={3}
              placeholder="Select languages..."
            />
          </div>
        </div>

        {/* Chip display single + clearable */}
        <div className="card space-y-3">
          <h2 className="heading-3">Chip Display & Clearable</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Single with chip display</label>
            <Select
              options={fruitOptions}
              value={chipSingle}
              onChange={(v) => setChipSingle(v as string)}
              chipDisplay
              placeholder="Select a fruit..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Clearable</label>
            <Select
              options={fruitOptions}
              value={clearable}
              onChange={(v) => setClearable(v as string)}
              clearable
              placeholder="Select a fruit..."
            />
          </div>
        </div>

        {/* Sizes */}
        <div className="card space-y-3">
          <h2 className="heading-3">Sizes</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Small</label>
            <Select
              options={fruitOptions}
              value={sizeSmall}
              onChange={(v) => setSizeSmall(v as string)}
              size="sm"
              placeholder="Small select..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Large</label>
            <Select
              options={fruitOptions}
              value={sizeLarge}
              onChange={(v) => setSizeLarge(v as string)}
              size="lg"
              placeholder="Large select..."
            />
          </div>
        </div>

        {/* Disabled */}
        <div className="card space-y-3">
          <h2 className="heading-3">Disabled</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Can't touch this</label>
            <Select
              options={fruitOptions}
              value="apple"
              onChange={() => {}}
              disabled
            />
          </div>
        </div>

        {/* Custom renderOption - user list */}
        <div className="card space-y-3">
          <h2 className="heading-3">Custom Option Rendering</h2>
          <p className="text-sm text-muted">Use <code>renderOption</code> to fully customize how dropdown items look.</p>

          <div className="flex flex-col gap-1">
            <label className="form-label">User picker</label>
            <Select
              options={userOptions}
              value={customUser}
              onChange={(v) => setCustomUser(v as string)}
              placeholder="Select a user..."
              renderOption={(option) => {
                const meta = userMeta[option.value];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--color-primary)', color: 'var(--color-primary-contrast)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                    }}>
                      {option.label.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500 }}>{option.label}</span>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: statusColor[meta.status], flexShrink: 0,
                        }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {meta.role} &middot; {meta.email}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label">Rating picker</label>
            <Select
              options={ratingOptions}
              value={customRating}
              onChange={(v) => setCustomRating(v as string)}
              placeholder="Select a rating..."
              renderOption={(option, { selected }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={14} fill={i < Number(option.value) ? '#f59e0b' : 'none'} color={i < Number(option.value) ? '#f59e0b' : 'currentColor'} style={{ opacity: i < Number(option.value) ? 1 : 0.3 }} />
                    ))}
                  </span>
                  <span>{option.label}</span>
                  {selected && <span style={{ marginLeft: 'auto', opacity: 0.5 }}>&#10003;</span>}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label">Multi user picker (max 3)</label>
            <Select
              options={userOptions}
              value={customMultiUser}
              onChange={(v) => setCustomMultiUser(v as string[])}
              multiple
              maxSelect={3}
              placeholder="Select team members..."
              renderOption={(option) => {
                const meta = userMeta[option.value];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--color-primary)', color: 'var(--color-primary-contrast)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
                    }}>
                      {option.label.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500 }}>{option.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: '0.5rem' }}>{meta.role}</span>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
