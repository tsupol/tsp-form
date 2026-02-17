import { useState } from 'react';
import { DatePicker } from '../../components/DatePicker';
import { DoubleDatePicker } from '../../components/DoubleDatePicker';
import { InputDatePicker } from '../../components/InputDatePicker';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { Calendar } from 'lucide-react';

export function DatePickerPage() {
  // Pure DatePicker
  const [pureDate, setPureDate] = useState<Date | null>(null);
  const [pureRangeFrom, setPureRangeFrom] = useState<Date | null>(null);
  const [pureRangeTo, setPureRangeTo] = useState<Date | null>(null);

  // Pure DoubleDatePicker
  const [doubleFrom, setDoubleFrom] = useState<Date | null>(null);
  const [doubleTo, setDoubleTo] = useState<Date | null>(null);

  // InputDatePicker
  const [basicDate, setBasicDate] = useState<Date | null>(null);
  const [withTime, setWithTime] = useState<Date | null>(null);
  const [withMinMax, setWithMinMax] = useState<Date | null>(null);

  // InputDateRangePicker
  const [rangeFrom, setRangeFrom] = useState<Date | null>(null);
  const [rangeTo, setRangeTo] = useState<Date | null>(null);
  const [rangeTimeFrom, setRangeTimeFrom] = useState<Date | null>(null);
  const [rangeTimeTo, setRangeTimeTo] = useState<Date | null>(null);
  const [prefilledFrom, setPrefilledFrom] = useState<Date | null>(new Date(2026, 2, 10));
  const [prefilledTo, setPrefilledTo] = useState<Date | null>(new Date(2026, 2, 15));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[700px]">

        {/* InputDatePicker */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">InputDatePicker</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Basic</label>
            <InputDatePicker
              value={basicDate}
              onChange={setBasicDate}
              placeholder="Select a date"
              endIcon={<Calendar size={18} />}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">With time (12h)</label>
            <InputDatePicker
              value={withTime}
              onChange={setWithTime}
              placeholder="Select date & time"
              endIcon={<Calendar size={18} />}
              datePickerProps={{
                showTime: true,
                timeFormat: '12h',
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Min/max date (today to +3 months)</label>
            <InputDatePicker
              value={withMinMax}
              onChange={setWithMinMax}
              placeholder="Select a date"
              endIcon={<Calendar size={18} />}
              datePickerProps={{
                minDate: today,
                maxDate: maxDate,
              }}
            />
          </div>
        </div>

        {/* InputDateRangePicker */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">InputDateRangePicker</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Basic range</label>
            <InputDateRangePicker
              fromDate={rangeFrom}
              toDate={rangeTo}
              onFromDateChange={setRangeFrom}
              onToDateChange={setRangeTo}
              placeholder="Select date range"
              endIcon={<Calendar size={18} />}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Range with time (24h, default 9:00–17:00)</label>
            <InputDateRangePicker
              fromDate={rangeTimeFrom}
              toDate={rangeTimeTo}
              onFromDateChange={setRangeTimeFrom}
              onToDateChange={setRangeTimeTo}
              placeholder="Select date & time range"
              endIcon={<Calendar size={18} />}
              defaultStartTime={{ hours: 9, minutes: 0 }}
              defaultEndTime={{ hours: 17, minutes: 0 }}
              datePickerProps={{
                showTime: true,
                timeFormat: '24h',
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Pre-filled range</label>
            <InputDateRangePicker
              fromDate={prefilledFrom}
              toDate={prefilledTo}
              onFromDateChange={setPrefilledFrom}
              onToDateChange={setPrefilledTo}
              placeholder="Select date range"
              endIcon={<Calendar size={18} />}
            />
          </div>
        </div>

        {/* Pure DatePicker */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">DatePicker (building block)</h2>
          <p className="text-sm opacity-60">Inline calendar — no input, no popover. Used internally by InputDatePicker.</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1">
              <label className="form-label">Single</label>
              <DatePicker
                selectedDate={pureDate}
                onChange={setPureDate}
              />
              {pureDate && <span className="text-sm opacity-60">{pureDate.toLocaleDateString()}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">Range</label>
              <DatePicker
                mode="range"
                fromDate={pureRangeFrom}
                toDate={pureRangeTo}
                onChange={setPureRangeFrom}
                onToDateChange={setPureRangeTo}
              />
            </div>
          </div>
        </div>

        {/* Pure DoubleDatePicker */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">DoubleDatePicker (building block)</h2>
          <p className="text-sm opacity-60">Side-by-side calendars for range selection.</p>
          <DoubleDatePicker
            fromDate={doubleFrom}
            toDate={doubleTo}
            onChange={setDoubleFrom}
            onToDateChange={setDoubleTo}
          />
        </div>

      </div>
    </div>
  );
}
