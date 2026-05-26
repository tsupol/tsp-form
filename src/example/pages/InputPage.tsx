import { useState, useRef, useMemo } from 'react';
import { Input } from '../../components/Input';
import { PopOver } from '../../components/PopOver';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';

const FRUITS = [
  'Apple', 'Apricot', 'Avocado',
  'Banana', 'Blackberry', 'Blueberry',
  'Cherry', 'Coconut', 'Cranberry',
  'Date', 'Dragonfruit',
  'Elderberry',
  'Fig',
  'Grape', 'Grapefruit', 'Guava',
  'Honeydew',
  'Kiwi',
  'Lemon', 'Lime', 'Lychee',
  'Mango', 'Melon',
  'Nectarine',
  'Orange',
  'Papaya', 'Passionfruit', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Pomegranate',
  'Raspberry',
  'Strawberry',
  'Tangerine',
  'Watermelon',
];

interface FruitAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

// Free-text input with a filtered suggestion list. Unlike Select, the user
// can submit any value — the suggestions are hints, not a constraint.
function FruitAutocomplete({ id, value, onChange }: FruitAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return FRUITS.filter((f) => f.toLowerCase().includes(q)).slice(0, 8);
  }, [value]);

  const triggerWidth = wrapperRef.current?.offsetWidth;
  const showPopover = open && suggestions.length > 0;

  const commit = (val: string) => {
    onChange(val);
    setOpen(false);
    setHighlighted(-1);
  };

  return (
    <div ref={wrapperRef}>
      <PopOver
        isOpen={showPopover}
        onClose={() => setOpen(false)}
        triggerRef={wrapperRef}
        placement="bottom"
        align="start"
        width={triggerWidth ? triggerWidth + 'px' : undefined}
        offset={4}
        trigger={
          <Input
            id={id}
            className="w-full"
            value={value}
            placeholder="Type anything..."
            autoComplete="off"
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (suggestions.length === 0) return;
                setOpen(true);
                setHighlighted((i) => (i < suggestions.length - 1 ? i + 1 : 0));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (suggestions.length === 0) return;
                setHighlighted((i) => (i > 0 ? i - 1 : suggestions.length - 1));
              } else if (e.key === 'Enter') {
                if (highlighted >= 0 && highlighted < suggestions.length) {
                  e.preventDefault();
                  commit(suggestions[highlighted]);
                } else {
                  setOpen(false);
                }
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
          />
        }
      >
        <div onMouseDown={(e) => e.preventDefault()}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={`select-popover-item ${i === highlighted ? 'highlighted' : ''}`}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => commit(s)}
            >
              {s}
            </div>
          ))}
        </div>
      </PopOver>
    </div>
  );
}

const FRUIT_OPTIONS = FRUITS.map((f) => ({ value: f, label: f }));

export function InputPage() {
  const [value, setValue] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [modalSelectValue, setModalSelectValue] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page-content">
      <div className="grid gap-4 max-w-[500px]">
        <h1 className="heading-1">Input</h1>

        <section>
          <h3 className="heading-3 mb-3">Input with Suggestions</h3>
          <p className="text-muted text-small mb-3">
            Free-text input with a suggestion list. Unlike <code>Select</code>, the user can submit any value —
            the suggestions are hints, not a constraint. Try typing "ap" or "berry".
          </p>
          <div className="card">
            <div className="flex flex-col">
              <label className="form-label" htmlFor="fruit-input">Favorite fruit</label>
              <FruitAutocomplete id="fruit-input" value={value} onChange={setValue} />
            </div>
            <div className="text-small text-muted mt-3">
              Current value: <code>{value || '(empty)'}</code>
            </div>
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-3">Input with Suggestions (inside Modal)</h3>
          <p className="text-muted text-small mb-3">
            Same autocomplete inside a modal. The popover renders via portal so it floats above the modal layer.
          </p>
          <div className="card">
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          </div>
        </section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="420px"
        ariaLabel="Fruit autocomplete in modal"
      >
        <div className="modal-header">
          <h2 className="modal-title">Pick a fruit</h2>
          <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
        </div>
        <div className="modal-content form-grid">
          <div className="flex flex-col">
            <label className="form-label" htmlFor="modal-fruit-input">Favorite fruit (autocomplete)</label>
            <FruitAutocomplete id="modal-fruit-input" value={modalValue} onChange={setModalValue} />
            <span className="text-small text-muted mt-1">Current value: <code>{modalValue || '(empty)'}</code></span>
          </div>
          <div className="flex flex-col">
            <label className="form-label" htmlFor="modal-fruit-select">Favorite fruit (Select — for comparison)</label>
            <Select
              id="modal-fruit-select"
              options={FRUIT_OPTIONS}
              value={modalSelectValue}
              onChange={(v) => setModalSelectValue(v as string | null)}
              placeholder="Pick a fruit..."
              clearable
            />
            <span className="text-small text-muted mt-1">Current value: <code>{modalSelectValue || '(empty)'}</code></span>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
