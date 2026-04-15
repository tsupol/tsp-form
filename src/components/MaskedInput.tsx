import { forwardRef, useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Input, type InputProps } from './Input';

// ── Utility functions ──────────────────────────────────────────────

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9';
}

function extractDigits(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (isDigit(s[i])) out += s[i];
  }
  return out;
}

function extractNumber(s: string, decSep: string, decScale?: number, allowNegative?: boolean): string {
  let out = '';
  let hasDecimal = false;
  let decimalDigits = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '-' && allowNegative && out.length === 0) {
      out += '-';
    } else if (isDigit(c)) {
      if (hasDecimal) {
        if (decScale !== undefined && decimalDigits >= decScale) continue;
        decimalDigits++;
      }
      out += c;
    } else if (c === decSep && !hasDecimal && decScale !== 0) {
      hasDecimal = true;
      out += '.'; // normalize to '.' internally
    }
  }
  return out;
}

function formatPattern(raw: string, mask: string, maskChar: string): string {
  let out = '';
  let ri = 0;
  for (let i = 0; i < mask.length && ri < raw.length; i++) {
    if (mask[i] === maskChar) {
      out += raw[ri++];
    } else {
      out += mask[i];
    }
  }
  return out;
}

function formatNumber(raw: string, thousandSep: string, decSep: string, prefix: string, suffix: string): string {
  if (raw === '' || raw === '-') return raw;

  const negative = raw.startsWith('-');
  const abs = negative ? raw.slice(1) : raw;
  const dotIdx = abs.indexOf('.');
  const intPart = dotIdx >= 0 ? abs.slice(0, dotIdx) : abs;
  const decPart = dotIdx >= 0 ? abs.slice(dotIdx + 1) : '';

  // Insert thousand separators
  let formatted = '';
  for (let i = 0; i < intPart.length; i++) {
    if (i > 0 && (intPart.length - i) % 3 === 0) {
      formatted += thousandSep;
    }
    formatted += intPart[i];
  }

  let result = (negative ? '-' : '') + prefix + formatted;
  if (dotIdx >= 0) {
    result += decSep + decPart;
  }
  result += suffix;
  return result;
}

/** Count digits in s[from..to) */
function countDigitsIn(s: string, from: number, to: number): number {
  let count = 0;
  for (let i = from; i < to; i++) {
    if (isDigit(s[i])) count++;
  }
  return count;
}

/** Find the position in `formatted` where `digitCount` digits have been seen */
function posOfNthDigit(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (isDigit(formatted[i])) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}

/** Count placeholders in a mask pattern */
function countPlaceholders(mask: string, maskChar: string): number {
  let count = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === maskChar) count++;
  }
  return count;
}

// ── Component ──────────────────────────────────────────────────────

export type MaskedInputProps = Omit<InputProps, 'value' | 'onChange'> & {
  /** Pattern mask like '###-###-####' or 'number' for thousand-separator mode */
  mask: string;
  /** Character representing a digit slot in pattern mode (default '#') */
  maskChar?: string;
  /** Thousand separator for number mode (default ',') */
  thousandSeparator?: string;
  /** Decimal separator for number mode (default '.') */
  decimalSeparator?: string;
  /** Max decimal places for number mode */
  decimalScale?: number;
  /** Allow negative numbers in number mode */
  allowNegative?: boolean;
  /** Prefix for number mode (e.g. '$') */
  prefix?: string;
  /** Suffix for number mode (e.g. ' ฿') */
  suffix?: string;
  /** Raw value (digits for pattern, numeric string for number) */
  value?: string;
  /** Callback with (rawValue, formattedValue) */
  onChange?: (rawValue: string, formattedValue: string) => void;
};

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({
    mask,
    maskChar = '#',
    thousandSeparator = ',',
    decimalSeparator = '.',
    decimalScale,
    allowNegative = false,
    prefix = '',
    suffix = '',
    value,
    onChange,
    placeholder,
    ...inputProps
  }, ref) => {
    const isNumber = mask === 'number';
    const maxDigits = isNumber ? Infinity : countPlaceholders(mask, maskChar);

    const inputElRef = useRef<HTMLInputElement | null>(null);
    const caretBeforeRef = useRef(0);
    const selEndBeforeRef = useRef(0);
    const rawRef = useRef('');
    const composingRef = useRef(false);

    // Merge forwarded ref with internal ref
    const setRef = useCallback((el: HTMLInputElement | null) => {
      inputElRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    }, [ref]);

    const format = useCallback((raw: string): string => {
      if (isNumber) {
        return formatNumber(raw, thousandSeparator, decimalSeparator, prefix, suffix);
      }
      return formatPattern(raw, mask, maskChar);
    }, [isNumber, mask, maskChar, thousandSeparator, decimalSeparator, prefix, suffix]);

    const extract = useCallback((s: string): string => {
      if (isNumber) {
        return extractNumber(s, decimalSeparator, decimalScale, allowNegative);
      }
      return extractDigits(s);
    }, [isNumber, decimalSeparator, decimalScale, allowNegative]);

    // ── State ──
    const isControlled = value !== undefined;
    const [internalRaw, setInternalRaw] = useState('');
    const currentRaw = isControlled ? value : internalRaw;
    const [displayValue, setDisplayValue] = useState(() => format(currentRaw));

    // Sync controlled value
    useEffect(() => {
      if (isControlled) {
        const formatted = format(value);
        rawRef.current = value;
        setDisplayValue(formatted);
      }
    }, [value, isControlled, format]);

    // ── Caret restore helper ──
    const restoreCaret = useCallback((pos: number) => {
      requestAnimationFrame(() => {
        const el = inputElRef.current;
        if (el && document.activeElement === el) {
          el.setSelectionRange(pos, pos);
        }
      });
    }, []);

    // ── Compute caret in formatted string ──
    const computeCaret = useCallback((browserValue: string, browserCaret: number, formatted: string): number => {
      // Count how many digits are to the left of browser's caret
      const digitsBeforeCaret = countDigitsIn(browserValue, 0, browserCaret);
      // For number mode, also count the minus and decimal as landmarks
      if (isNumber) {
        // Check if caret is after the decimal separator
        let decPos = -1;
        let decDigitPos = -1;
        for (let i = 0; i < browserValue.length; i++) {
          if (browserValue[i] === decimalSeparator) { decPos = i; break; }
        }
        // If caret is right at a non-digit position at the end (e.g. just typed decimal)
        if (decPos >= 0 && browserCaret === decPos + 1) {
          // Place caret after decimal in formatted
          for (let i = 0; i < formatted.length; i++) {
            if (formatted[i] === decimalSeparator) return i + 1;
          }
        }
      }
      return posOfNthDigit(formatted, digitsBeforeCaret);
    }, [isNumber, decimalSeparator]);

    // ── onKeyDown: save caret + skip separators ──
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
      const el = inputElRef.current;
      if (!el) return;

      caretBeforeRef.current = el.selectionStart ?? 0;
      selEndBeforeRef.current = el.selectionEnd ?? 0;

      // Pattern mode: skip over literal chars on backspace/delete
      if (!isNumber && el.selectionStart === el.selectionEnd) {
        const pos = el.selectionStart ?? 0;
        const currentDisplay = el.value;

        if (e.key === 'Backspace' && pos > 0) {
          // If char before cursor is a separator, skip back to the digit before it
          if (pos <= mask.length && !isDigit(currentDisplay[pos - 1])) {
            let newPos = pos - 1;
            while (newPos > 0 && !isDigit(currentDisplay[newPos - 1])) newPos--;
            if (newPos < pos - 1) {
              el.setSelectionRange(newPos, newPos);
              caretBeforeRef.current = newPos;
            }
          }
        }

        if (e.key === 'Delete' && pos < currentDisplay.length) {
          if (pos < mask.length && !isDigit(currentDisplay[pos])) {
            let newPos = pos + 1;
            while (newPos < currentDisplay.length && !isDigit(currentDisplay[newPos])) newPos++;
            if (newPos > pos + 1) {
              el.setSelectionRange(newPos, newPos);
              caretBeforeRef.current = newPos;
            }
          }
        }
      }

      // Number mode: skip thousand separator on backspace/delete
      if (isNumber && el.selectionStart === el.selectionEnd) {
        const pos = el.selectionStart ?? 0;
        const val = el.value;

        if (e.key === 'Backspace' && pos > 0 && val[pos - 1] === thousandSeparator) {
          el.setSelectionRange(pos - 1, pos - 1);
          caretBeforeRef.current = pos - 1;
        }
        if (e.key === 'Delete' && pos < val.length && val[pos] === thousandSeparator) {
          el.setSelectionRange(pos + 1, pos + 1);
          caretBeforeRef.current = pos + 1;
        }
      }

      inputProps.onKeyDown?.(e);
    }, [isNumber, mask, thousandSeparator, inputProps.onKeyDown]);

    // ── onInput: main formatting pipeline ──
    const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      const el = inputElRef.current;
      if (!el) return;

      const browserValue = el.value;
      const browserCaret = el.selectionStart ?? 0;

      // Extract raw value
      let newRaw = extract(browserValue);

      // Clamp for pattern mode
      if (!isNumber && newRaw.length > maxDigits) {
        newRaw = newRaw.slice(0, maxDigits);
      }

      // Format
      const formatted = format(newRaw);

      // Compute caret
      const newCaret = computeCaret(browserValue, browserCaret, formatted);

      // Update
      rawRef.current = newRaw;
      if (!isControlled) setInternalRaw(newRaw);
      setDisplayValue(formatted);
      onChange?.(newRaw, formatted);

      // Force the input value immediately (before React re-renders)
      el.value = formatted;
      el.setSelectionRange(newCaret, newCaret);
      // Also schedule for after React commit
      restoreCaret(newCaret);
    }, [extract, format, computeCaret, isNumber, maxDigits, isControlled, onChange, restoreCaret]);

    // ── onPaste ──
    const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const el = inputElRef.current;
      if (!el) return;

      const pasted = e.clipboardData.getData('text');
      const pastedDigits = isNumber
        ? extractNumber(pasted, decimalSeparator, decimalScale, allowNegative)
        : extractDigits(pasted);

      if (!pastedDigits) return;

      const currentDisplay = el.value;
      const selStart = el.selectionStart ?? 0;
      const selEnd = el.selectionEnd ?? selStart;

      // Map selection positions to raw digit positions
      const rawStart = countDigitsIn(currentDisplay, 0, selStart);
      const rawEnd = countDigitsIn(currentDisplay, 0, selEnd);

      const oldRaw = rawRef.current;
      let newRaw = oldRaw.slice(0, rawStart) + pastedDigits + oldRaw.slice(rawEnd);

      // Clamp for pattern mode
      if (!isNumber && newRaw.length > maxDigits) {
        newRaw = newRaw.slice(0, maxDigits);
      }

      const formatted = format(newRaw);

      // Caret goes after the pasted content
      const caretRawPos = Math.min(rawStart + pastedDigits.length, newRaw.length);
      const newCaret = posOfNthDigit(formatted, countDigitsIn(newRaw, 0, caretRawPos));

      rawRef.current = newRaw;
      if (!isControlled) setInternalRaw(newRaw);
      setDisplayValue(formatted);
      onChange?.(newRaw, formatted);

      el.value = formatted;
      el.setSelectionRange(newCaret, newCaret);
      restoreCaret(newCaret);
    }, [isNumber, decimalSeparator, decimalScale, allowNegative, format, maxDigits, isControlled, onChange, restoreCaret]);

    // ── Composition events (for IME) ──
    const handleCompositionStart = useCallback(() => { composingRef.current = true; }, []);
    const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      // Trigger input handling after composition ends
      handleInput(e as unknown as FormEvent<HTMLInputElement>);
    }, [handleInput]);

    // Default placeholder
    const defaultPlaceholder = !isNumber
      ? mask.replace(new RegExp(`\\${maskChar}`, 'g'), '_')
      : undefined;

    return (
      <Input
        ref={setRef}
        type="text"
        inputMode={isNumber ? 'decimal' : 'numeric'}
        value={displayValue}
        placeholder={placeholder ?? defaultPlaceholder}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onChange={() => {}} // noop — handled via onInput
        {...inputProps}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
