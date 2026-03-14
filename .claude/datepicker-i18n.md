# DatePicker i18n (Localization)

The `DatePicker`, `InputDatePicker`, and `InputDateRangePicker` components support localization via the `locale` prop. No i18n library is required — it uses the browser's built-in `Intl.DateTimeFormat`.

## Usage

Pass a BCP 47 locale string (e.g. `'th'`, `'ja'`, `'de'`, `'en-GB'`):

```tsx
<InputDatePicker locale="th" />
<InputDateRangePicker locale="ja" />
```

This automatically localizes:
- **Month names** in the calendar header and month picker
- **Weekday names** in the calendar grid
- **Input display value** (e.g. `15 มี.ค. 2569` for Thai)

Default is `'en-US'`.

## Calendar System

Some locales use a non-Gregorian calendar by default (e.g. Thai uses Buddhist era where 2026 CE = 2569 BE). Control this with the `calendar` prop:

| Value | Behavior | Example (Thai) |
|-------|----------|-----------------|
| `'locale'` (default) | Use the locale's native calendar | 2569 |
| `'gregorian'` | Always use Gregorian year | 2026 |

```tsx
// Thai locale with Buddhist year (default)
<InputDatePicker locale="th" />
// Input shows: 15 มี.ค. 2569

// Thai locale forced to Gregorian year
<InputDatePicker locale="th" calendar="gregorian" />
// Input shows: 15 มี.ค. 2026
```

The `calendar` prop affects both the calendar popup (header, year picker) and the input display value.

## Custom Labels

UI button/label strings (`Clear`, `Today`, `Time`, etc.) are **not** covered by `Intl` and default to English. Override them with the `labels` prop on `DatePicker`:

```tsx
<InputDatePicker
  locale="th"
  datePickerProps={{
    labels: {
      clear: 'ล้าง',
      today: 'วันนี้',
      time: 'เวลา',
      startTime: 'เวลาเริ่ม',
      endTime: 'เวลาสิ้นสุด',
    }
  }}
/>
```

All fields in `DatePickerLabels` are optional — only override what you need.

## Custom Date Format

If you need full control over the input display format, use the `dateFormat` prop. When provided, it takes priority over `locale` and `calendar` for the input display (the calendar still uses `locale` and `calendar`):

```tsx
<InputDatePicker
  locale="th"
  dateFormat={(date) => date ? dayjs(date).format('DD/MM/YYYY') : ''}
/>
```
