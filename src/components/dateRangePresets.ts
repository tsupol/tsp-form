/**
 * Dynamic (relative) range presets for InputDateRangePicker.
 *
 * A preset stores a *rule*, not a frozen pair of dates — `getRange()` is
 * evaluated at click time and again whenever the consumer rehydrates a saved
 * `presetKey`, so "Last 30 days" means 30 days from today, not from the day it
 * was first picked.
 */

export interface DateRangePreset {
  /** Stable identifier persisted by the consumer (e.g. 'last-30-days'). */
  key: string;
  label: string;
  /** Evaluated fresh on every use. Returns [from, to]. */
  getRange: () => [Date, Date];
}

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const endOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const addDays = (d: Date, days: number): Date => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

/** Translatable labels for the built-in presets, keyed by preset key. */
export interface DateRangePresetLabels {
  today?: string;
  yesterday?: string;
  'last-7-days'?: string;
  'last-30-days'?: string;
  'this-month'?: string;
  'last-month'?: string;
  'this-year'?: string;
}

const EN_PRESET_LABELS: Required<DateRangePresetLabels> = {
  today: 'Today',
  yesterday: 'Yesterday',
  'last-7-days': 'Last 7 days',
  'last-30-days': 'Last 30 days',
  'this-month': 'This month',
  'last-month': 'Last month',
  'this-year': 'This year',
};

/**
 * Built-in presets in a given language.
 *
 * The library takes labels as props rather than depending on an i18n runtime,
 * matching `DatePickerLabels`. Pass your translator's output:
 * `createDateRangePresets({ today: t('range.today'), ... })`
 */
export const createDateRangePresets = (
  labels?: DateRangePresetLabels
): DateRangePreset[] => {
  const l = { ...EN_PRESET_LABELS, ...labels };
  return defaultDateRangePresets.map((preset) => ({
    ...preset,
    label: l[preset.key as keyof DateRangePresetLabels] ?? preset.label,
  }));
};

/**
 * Built-in presets with English labels. Pass your own array to `presets` to
 * replace these, spread them to extend
 * (`presets={[...defaultDateRangePresets, mine]}`), or use
 * `createDateRangePresets(labels)` for a translated set.
 */
export const defaultDateRangePresets: DateRangePreset[] = [
  {
    key: 'today',
    label: EN_PRESET_LABELS.today,
    getRange: () => {
      const now = new Date();
      return [startOfDay(now), endOfDay(now)];
    },
  },
  {
    key: 'yesterday',
    label: EN_PRESET_LABELS.yesterday,
    getRange: () => {
      const y = addDays(new Date(), -1);
      return [startOfDay(y), endOfDay(y)];
    },
  },
  {
    key: 'last-7-days',
    label: EN_PRESET_LABELS['last-7-days'],
    getRange: () => {
      const now = new Date();
      // Inclusive of today: today plus the 6 preceding days.
      return [startOfDay(addDays(now, -6)), endOfDay(now)];
    },
  },
  {
    key: 'last-30-days',
    label: EN_PRESET_LABELS['last-30-days'],
    getRange: () => {
      const now = new Date();
      return [startOfDay(addDays(now, -29)), endOfDay(now)];
    },
  },
  {
    key: 'this-month',
    label: EN_PRESET_LABELS['this-month'],
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [startOfDay(from), endOfDay(to)];
    },
  },
  {
    key: 'last-month',
    label: EN_PRESET_LABELS['last-month'],
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      // Day 0 of the current month is the last day of the previous month.
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfDay(from), endOfDay(to)];
    },
  },
  {
    key: 'this-year',
    label: EN_PRESET_LABELS['this-year'],
    getRange: () => {
      const now = new Date();
      return [
        startOfDay(new Date(now.getFullYear(), 0, 1)),
        endOfDay(new Date(now.getFullYear(), 11, 31)),
      ];
    },
  },
];

/** Look up a preset by key — for rehydrating a persisted selection. */
export const findDateRangePreset = (
  key: string,
  presets: DateRangePreset[] = defaultDateRangePresets
): DateRangePreset | undefined => presets.find((p) => p.key === key);

/**
 * Resolve a persisted `presetKey` into fresh dates.
 * Returns null when the key is unknown, so callers can fall back to stored dates.
 */
export const resolveDateRangePreset = (
  key: string,
  presets: DateRangePreset[] = defaultDateRangePresets
): { from: Date; to: Date } | null => {
  const preset = findDateRangePreset(key, presets);
  if (!preset) return null;
  const [from, to] = preset.getRange();
  return { from, to };
};
