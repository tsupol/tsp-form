import { useState } from 'react';
import { Input } from '../../components/Input';
import { TextArea } from '../../components/TextArea';
import { MaskedInput } from '../../components/MaskedInput';
import { Select } from '../../components/Select';
import { Checkbox } from '../../components/Checkbox';
import { LabeledCheckbox } from '../../components/LabeledCheckbox';
import { RadioGroup } from '../../components/RadioGroup';
import { Switch } from '../../components/Switch';
import { Slider } from '../../components/Slider';
import { NumberSpinner } from '../../components/NumberSpinner';
import { InputDatePicker } from '../../components/InputDatePicker';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { FileUploader } from '../../components/FileUploader';
import { ImageUploader } from '../../components/ImageUploader';
import { Button } from '../../components/Button';
import { Search } from 'lucide-react';

const selectOptions = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3' },
];

const radioOptions = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

export function DisabledStatePage() {
  const [disabled, setDisabled] = useState(true);
  const [selectVal, setSelectVal] = useState<string | null>('opt1');
  const [multiSelectVal, setMultiSelectVal] = useState<string | string[] | null>(['opt1', 'opt2']);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [labeledCheckboxVal, setLabeledCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('a');
  const [switchVal, setSwitchVal] = useState(true);
  const [sliderVal, setSliderVal] = useState(50);
  const [spinnerVal, setSpinnerVal] = useState<number | "">(5);
  const [dateVal, setDateVal] = useState<Date | null>(new Date());
  const [rangeFrom, setRangeFrom] = useState<Date | null>(new Date());
  const [rangeTo, setRangeTo] = useState<Date | null>(null);

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[900px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1">Disabled States</h1>
            <p className="text-subtle">All form components in their disabled state.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="form-label !mb-0">Disabled</label>
            <Switch checked={disabled} onChange={() => setDisabled(d => !d)} />
          </div>
        </div>

        {/* Text Inputs */}
        <section className="card">
          <h2 className="heading-3 mb-4">Text Inputs</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className="form-label">Input</label>
              <Input disabled={disabled} defaultValue="Hello world" placeholder="Type here..." />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Input with Icon</label>
              <Input disabled={disabled} defaultValue="Search term" placeholder="Search..." startIcon={<Search size={16} />} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Masked (Phone)</label>
              <MaskedInput disabled={disabled} mask="pattern" pattern="(###) ###-####" value="1234567890" placeholder="(___) ___-____" />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Masked (Number)</label>
              <MaskedInput disabled={disabled} mask="number" value="12345.67" placeholder="0.00" />
            </div>
            <div className="flex flex-col col-span-2">
              <label className="form-label">TextArea</label>
              <TextArea disabled={disabled} defaultValue="Some multiline content here." placeholder="Write something..." />
            </div>
          </div>
        </section>

        {/* Selects & Date Pickers */}
        <section className="card">
          <h2 className="heading-3 mb-4">Select & Date Pickers</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className="form-label">Single Select</label>
              <Select disabled={disabled} options={selectOptions} value={selectVal} onChange={(v) => setSelectVal(v as string)} placeholder="Choose..." />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Multi Select</label>
              <Select disabled={disabled} options={selectOptions} value={multiSelectVal} onChange={setMultiSelectVal} multiple placeholder="Choose many..." />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Date Picker</label>
              <InputDatePicker disabled={disabled} value={dateVal} onChange={setDateVal} placeholder="Pick a date..." />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Date Range</label>
              <InputDateRangePicker disabled={disabled} fromDate={rangeFrom} toDate={rangeTo} onFromDateChange={setRangeFrom} onToDateChange={setRangeTo} />
            </div>
          </div>
        </section>

        {/* Toggles & Choices */}
        <section className="card">
          <h2 className="heading-3 mb-4">Toggles & Choices</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Checkbox disabled={disabled} checked={checkboxVal} onChange={() => setCheckboxVal(v => !v)} />
                <span>Bare Checkbox</span>
              </div>
              <LabeledCheckbox disabled={disabled} checked={labeledCheckboxVal} onChange={() => setLabeledCheckboxVal(v => !v)} label="Labeled Checkbox" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Switch disabled={disabled} checked={switchVal} onChange={() => setSwitchVal(v => !v)} />
                <span>Switch (on)</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch disabled={disabled} checked={false} onChange={() => {}} />
                <span>Switch (off)</span>
              </div>
            </div>
            <div className="col-span-2">
              <label className="form-label">RadioGroup</label>
              <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
                <RadioGroup
                  name="disabled-radio"
                  value={radioVal}
                  onChange={setRadioVal}
                  options={radioOptions}
                  className="flex gap-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Numeric */}
        <section className="card">
          <h2 className="heading-3 mb-4">Numeric</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col">
              <label className="form-label">NumberSpinner</label>
              <NumberSpinner disabled={disabled} value={spinnerVal} onChange={setSpinnerVal} min={0} max={99} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Diagonal Spinner</label>
              <NumberSpinner disabled={disabled} value={spinnerVal} onChange={setSpinnerVal} min={0} max={99} variant="diagonal" />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Slider</label>
              <Slider disabled={disabled} value={sliderVal} onChange={setSliderVal} min={0} max={100} showValue showMinMax />
            </div>
          </div>
        </section>

        {/* File Uploads */}
        <section className="card">
          <h2 className="heading-3 mb-4">File Uploads</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className="form-label">FileUploader</label>
              <FileUploader disabled={disabled} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">ImageUploader</label>
              <ImageUploader disabled={disabled} />
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="card">
          <h2 className="heading-3 mb-4">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button disabled={disabled}>Primary</Button>
            <Button disabled={disabled} variant="secondary">Secondary</Button>
            <Button disabled={disabled} variant="outline">Outline</Button>
            <Button disabled={disabled} variant="ghost">Ghost</Button>
            <Button disabled={disabled} variant="destructive">Destructive</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
