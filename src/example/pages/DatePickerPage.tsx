import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '../../components/DatePicker';
import { DoubleDatePicker } from '../../components/DoubleDatePicker';
import { InputDatePicker } from '../../components/InputDatePicker';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { Calendar, Keyboard } from 'lucide-react';

export function DatePickerPage() {
  // Pure DatePicker
  const [pureDate, setPureDate] = useState<Date | null>(null);
  const [pureRangeFrom, setPureRangeFrom] = useState<Date | null>(null);
  const [pureRangeTo, setPureRangeTo] = useState<Date | null>(null);

  // Pure DoubleDatePicker
  const [doubleFrom, setDoubleFrom] = useState<Date | null>(null);
  const [doubleTo, setDoubleTo] = useState<Date | null>(null);

  const { i18n } = useTranslation();

  // InputDatePicker
  const [basicDate, setBasicDate] = useState<Date | null>(null);
  const [withTime, setWithTime] = useState<Date | null>(null);
  const [withMinMax, setWithMinMax] = useState<Date | null>(null);

  // Typing mode
  const [typingDate, setTypingDate] = useState<Date | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Typing mode (range)
  const [typingRangeFrom, setTypingRangeFrom] = useState<Date | null>(null);
  const [typingRangeTo, setTypingRangeTo] = useState<Date | null>(null);
  const [isTypingRange, setIsTypingRange] = useState(false);

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
        <h1 className="heading-1">Date Picker</h1>

        {/* InputDatePicker */}
        <div className="card space-y-3">
          <h2 className="heading-3">InputDatePicker</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Basic</label>
            <InputDatePicker
              value={basicDate}
              onChange={setBasicDate}
              placeholder="Select a date"
              endIcon={<Calendar size={18} />}
              locale={i18n.language}
              calendar="gregorian"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">With time (12h)</label>
            <InputDatePicker
              value={withTime}
              onChange={setWithTime}
              placeholder="Select date & time"
              endIcon={<Calendar size={18} />}
              locale={i18n.language}
              calendar="gregorian"
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
              locale={i18n.language}
              calendar="gregorian"
              datePickerProps={{
                minDate: today,
                maxDate: maxDate,
              }}
            />
          </div>
        </div>

        {/* InputDatePicker with Typing Mode */}
        <div className="card space-y-3">
          <h2 className="heading-3">InputDatePicker — Typing Mode</h2>
          <p className="text-subtle">Type digits to enter a date via keyboard, or click to use the calendar. Press Enter to confirm, Escape to cancel.</p>
          <div className="flex flex-col gap-1">
            <label className="form-label">DD/MM/YYYY</label>
            <InputDatePicker
              value={typingDate}
              onChange={setTypingDate}
              placeholder="Select or type a date"
              endIcon={<Keyboard size={18} />}
              onEndIconClick={() => setIsTyping(t => !t)}
              locale={i18n.language}
              calendar="gregorian"
              typingMode={isTyping}
              onTypingModeChange={setIsTyping}
              typingMask="##/##/####"
              typingPlaceholder="DD/MM/YYYY"
              parseTypedDate={(raw) => {
                if (raw.length !== 8) return null;
                const day = parseInt(raw.slice(0, 2), 10);
                const month = parseInt(raw.slice(2, 4), 10);
                let year = parseInt(raw.slice(4, 8), 10);
                // Support Buddhist Era input — years above 2400 are assumed BE
                if (year > 2400) year -= 543;
                if (month < 1 || month > 12 || day < 1 || day > 31) return null;
                const d = new Date(year, month - 1, day);
                if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
                return d;
              }}
            />
          </div>
        </div>

        {/* InputDateRangePicker */}
        <div className="card space-y-3">
          <h2 className="heading-3">InputDateRangePicker</h2>
          <div className="flex flex-col gap-1">
            <label className="form-label">Basic range</label>
            <InputDateRangePicker
              fromDate={rangeFrom}
              toDate={rangeTo}
              onFromDateChange={setRangeFrom}
              onToDateChange={setRangeTo}
              placeholder="Select date range"
              endIcon={<Calendar size={18} />}
              locale={i18n.language}
              calendar="gregorian"
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
              locale={i18n.language}
              calendar="gregorian"
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
              locale={i18n.language}
              calendar="gregorian"
            />
          </div>
        </div>

        {/* InputDateRangePicker with Typing Mode */}
        <div className="card space-y-3">
          <h2 className="heading-3">InputDateRangePicker — Typing Mode</h2>
          <p className="text-subtle">Type digits for both dates in one pass. Press Enter to confirm, Escape to cancel.</p>
          <div className="flex flex-col gap-1">
            <label className="form-label">DD/MM/YYYY - DD/MM/YYYY</label>
            <InputDateRangePicker
              fromDate={typingRangeFrom}
              toDate={typingRangeTo}
              onFromDateChange={setTypingRangeFrom}
              onToDateChange={setTypingRangeTo}
              placeholder="Select or type a date range"
              endIcon={<Keyboard size={18} />}
              onEndIconClick={() => setIsTypingRange(t => !t)}
              locale={i18n.language}
              calendar="gregorian"
              typingMode={isTypingRange}
              onTypingModeChange={setIsTypingRange}
              typingMask="##/##/#### - ##/##/####"
              typingPlaceholder="DD/MM/YYYY - DD/MM/YYYY"
              parseTypedDates={(raw) => {
                // 16 digits: 8 for from, 8 for to
                if (raw.length < 8) return { from: null, to: null };
                const parseDate = (digits: string) => {
                  if (digits.length !== 8) return null;
                  const day = parseInt(digits.slice(0, 2), 10);
                  const month = parseInt(digits.slice(2, 4), 10);
                  let year = parseInt(digits.slice(4, 8), 10);
                  if (year > 2400) year -= 543;
                  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
                  const d = new Date(year, month - 1, day);
                  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
                  return d;
                };
                return {
                  from: parseDate(raw.slice(0, 8)),
                  to: raw.length >= 16 ? parseDate(raw.slice(8, 16)) : null,
                };
              }}
            />
          </div>
        </div>

        {/* Pure DatePicker */}
        <div className="card space-y-3">
          <h2 className="heading-3">DatePicker (building block)</h2>
          <p className="text-sm text-subtle">Inline calendar — no input, no popover. Used internally by InputDatePicker.</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1">
              <label className="form-label">Single</label>
              <DatePicker
                selectedDate={pureDate}
                onChange={setPureDate}
                locale={i18n.language}
                calendar="gregorian"
              />
              {pureDate && <span className="text-sm text-subtle">{pureDate.toLocaleDateString()}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">Range</label>
              <DatePicker
                mode="range"
                fromDate={pureRangeFrom}
                toDate={pureRangeTo}
                onChange={setPureRangeFrom}
                onToDateChange={setPureRangeTo}
                locale={i18n.language}
                calendar="gregorian"
              />
            </div>
          </div>
        </div>

        {/* Pure DoubleDatePicker */}
        <div className="card space-y-3">
          <h2 className="heading-3">DoubleDatePicker (building block)</h2>
          <p className="text-sm text-subtle">Side-by-side calendars for range selection.</p>
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
