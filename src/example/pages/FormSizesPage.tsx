import { useState } from 'react';
import { Input } from '../../components/Input';
import { TextArea } from '../../components/TextArea';
import { Select } from '../../components/Select';
import { InputDatePicker } from '../../components/InputDatePicker';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { NumberSpinner } from '../../components/NumberSpinner';
import { Search, Calendar } from 'lucide-react';

const selectOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export function FormSizesPage() {
  const [selectSm, setSelectSm] = useState<string | null>(null);
  const [selectMd, setSelectMd] = useState<string | null>(null);
  const [selectLg, setSelectLg] = useState<string | null>(null);
  const [selectNoIconSm, setSelectNoIconSm] = useState<string | null>(null);
  const [selectNoIconMd, setSelectNoIconMd] = useState<string | null>(null);
  const [selectNoIconLg, setSelectNoIconLg] = useState<string | null>(null);
  const [dateSm, setDateSm] = useState<Date | null>(null);
  const [dateMd, setDateMd] = useState<Date | null>(null);
  const [dateLg, setDateLg] = useState<Date | null>(null);
  const [rangeFromSm, setRangeFromSm] = useState<Date | null>(null);
  const [rangeToSm, setRangeToSm] = useState<Date | null>(null);
  const [rangeFromMd, setRangeFromMd] = useState<Date | null>(null);
  const [rangeToMd, setRangeToMd] = useState<Date | null>(null);
  const [rangeFromLg, setRangeFromLg] = useState<Date | null>(null);
  const [rangeToLg, setRangeToLg] = useState<Date | null>(null);
  const [spinnerSm, setSpinnerSm] = useState<number | "">(0);
  const [spinnerMd, setSpinnerMd] = useState<number | "">(0);
  const [spinnerLg, setSpinnerLg] = useState<number | "">(0);
  const [spinnerDiagSm, setSpinnerDiagSm] = useState<number | "">(0);
  const [spinnerDiagMd, setSpinnerDiagMd] = useState<number | "">(0);
  const [spinnerDiagLg, setSpinnerDiagLg] = useState<number | "">(0);

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[800px]">
        <h1 className="text-2xl font-bold">Form Control Sizes</h1>

        {/* Input */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Input</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <Input size="sm" placeholder="Small input" />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <Input placeholder="Medium input" />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>
        </section>

        {/* Input with Icon */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Input with Icon</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <Input size="sm" placeholder="Search..." startIcon={<Search size={14} />} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <Input placeholder="Search..." startIcon={<Search size={16} />} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <Input size="lg" placeholder="Search..." startIcon={<Search size={20} />} />
            </div>
          </div>
        </section>

        {/* TextArea */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">TextArea</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <TextArea size="sm" placeholder="Small textarea" rows={2} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <TextArea placeholder="Medium textarea" rows={2} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <TextArea size="lg" placeholder="Large textarea" rows={2} />
            </div>
          </div>
        </section>

        {/* Select */}
        <section className="border border-line bg-surface p-card rounded-lg w-[400px] overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Select with Icon</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <Select
                size="sm"
                startIcon={<Search size={14} />}
                options={selectOptions}
                value={selectSm}
                onChange={(v) => setSelectSm(v as string | null)}
                placeholder="Small select"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <Select
                startIcon={<Search size={16} />}
                options={selectOptions}
                value={selectMd}
                onChange={(v) => setSelectMd(v as string | null)}
                placeholder="Medium select"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <Select
                size="lg"
                startIcon={<Search size={20} />}
                options={selectOptions}
                value={selectLg}
                onChange={(v) => setSelectLg(v as string | null)}
                placeholder="Large select"
              />
            </div>
          </div>
        </section>

        {/* Select without Icon */}
        <section className="border border-line bg-surface p-card rounded-lg w-[400px] overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Select</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <Select
                size="sm"
                options={selectOptions}
                value={selectNoIconSm}
                onChange={(v) => setSelectNoIconSm(v as string | null)}
                placeholder="Small select"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <Select
                options={selectOptions}
                value={selectNoIconMd}
                onChange={(v) => setSelectNoIconMd(v as string | null)}
                placeholder="Medium select"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <Select
                size="lg"
                options={selectOptions}
                value={selectNoIconLg}
                onChange={(v) => setSelectNoIconLg(v as string | null)}
                placeholder="Large select"
              />
            </div>
          </div>
        </section>

        {/* InputDatePicker */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">InputDatePicker</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <InputDatePicker
                size="sm"
                value={dateSm}
                onChange={setDateSm}
                placeholder="Small date picker"
                endIcon={<Calendar size={14} />}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <InputDatePicker
                value={dateMd}
                onChange={setDateMd}
                placeholder="Medium date picker"
                endIcon={<Calendar size={16} />}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <InputDatePicker
                size="lg"
                value={dateLg}
                onChange={setDateLg}
                placeholder="Large date picker"
                endIcon={<Calendar size={20} />}
              />
            </div>
          </div>
        </section>

        {/* InputDateRangePicker */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">InputDateRangePicker</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <InputDateRangePicker
                size="sm"
                fromDate={rangeFromSm}
                toDate={rangeToSm}
                onFromDateChange={setRangeFromSm}
                onToDateChange={setRangeToSm}
                placeholder="Small date range"
                endIcon={<Calendar size={14} />}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <InputDateRangePicker
                fromDate={rangeFromMd}
                toDate={rangeToMd}
                onFromDateChange={setRangeFromMd}
                onToDateChange={setRangeToMd}
                placeholder="Medium date range"
                endIcon={<Calendar size={16} />}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <InputDateRangePicker
                size="lg"
                fromDate={rangeFromLg}
                toDate={rangeToLg}
                onFromDateChange={setRangeFromLg}
                onToDateChange={setRangeToLg}
                placeholder="Large date range"
                endIcon={<Calendar size={20} />}
              />
            </div>
          </div>
        </section>

        {/* NumberSpinner */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">NumberSpinner</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <NumberSpinner
                scale="sm"
                value={spinnerSm}
                onChange={setSpinnerSm}
                min={0}
                max={100}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <NumberSpinner
                scale="md"
                value={spinnerMd}
                onChange={setSpinnerMd}
                min={0}
                max={100}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <NumberSpinner
                scale="lg"
                value={spinnerLg}
                onChange={setSpinnerLg}
                min={0}
                max={100}
              />
            </div>
          </div>
        </section>

        {/* NumberSpinner Diagonal */}
        <section className="border border-line bg-surface p-card rounded-lg">
          <h2 className="text-lg font-semibold mb-4">NumberSpinner (Diagonal)</h2>
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="form-label">Small</label>
              <NumberSpinner
                variant="diagonal"
                scale="sm"
                value={spinnerDiagSm}
                onChange={setSpinnerDiagSm}
                min={0}
                max={100}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Medium (default)</label>
              <NumberSpinner
                variant="diagonal"
                scale="md"
                value={spinnerDiagMd}
                onChange={setSpinnerDiagMd}
                min={0}
                max={100}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Large</label>
              <NumberSpinner
                variant="diagonal"
                scale="lg"
                value={spinnerDiagLg}
                onChange={setSpinnerDiagLg}
                min={0}
                max={100}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
