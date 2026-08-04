import { useState, useRef, useEffect, useCallback, useMemo, type ComponentProps, type MouseEvent, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { PopOver } from './PopOver';
import { Chevron } from './Chevron';
import { Skeleton } from './Skeleton';
import { Checkmark } from './Checkmark';
import clsx from 'clsx';
import '../styles/form.css';
import '../styles/select.css';

export interface Option {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface OptionGroup {
  type: 'group';
  label: string;
}

export interface OptionSeparator {
  type: 'separator';
}

export type SelectItem = Option | OptionGroup | OptionSeparator;

function isOption(item: SelectItem): item is Option {
  return !('type' in item);
}

function isGroup(item: SelectItem): item is OptionGroup {
  return 'type' in item && item.type === 'group';
}

// The chip row's column-gap, in px — needed to measure how many chips fit, since
// the gap sits between every pair. Read from the computed style so a consumer
// retheming the gap doesn't desync the measurement.
function chipGapPx(row: HTMLElement): number {
  const gap = parseFloat(getComputedStyle(row).columnGap);
  return Number.isFinite(gap) ? gap : 0;
}

// Space kept for the search input when chips share its line — matches the
// `min-width` the input has always had, so typing never gets squeezed out.
const MIN_SEARCH_INPUT_WIDTH = 20;


interface SelectProps {
  id?: string;
  options: SelectItem[];
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  multiple?: boolean;
  placeholder?: string;
  closeOnSelect?: boolean;
  disabled?: boolean;
  className?: string; // Additional classes for the main container (Select wrapper)
  popoverProps?: Partial<ComponentProps<typeof PopOver>>; // New prop for PopOver specific styling
  startIcon?: ReactNode;
  onSearchChange?: (searchTerm: string) => void;
  loading?: boolean;
  loadingContent?: ReactNode;
  unstyled?: boolean;
  searchTerm?: string;
  children?: ReactNode;
  error?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  chipDisplay?: boolean; // Show selected value as chip (default false for single, always true for multi)
  clearable?: boolean; // Show clear button when value is selected
  searchable?: boolean; // Allow typing to filter options (default true)
  filterOptions?: boolean; // Apply built-in substring filter to options (default true). Set false when parent supplies pre-filtered options (e.g. fuzzy/async search).
  showChevron?: boolean; // Show chevron icon (default true)
  maxSelect?: number; // Maximum number of selectable items in multi mode
  showSelectedInList?: boolean; // Show selected items in dropdown with highlight instead of removing them (default false)
  renderOption?: (option: Option, state: { selected: boolean }) => ReactNode; // Custom option renderer
  chipOverflow?: 'collapse' | 'wrap'; // 'collapse' (default): keep chips on one line, surplus becomes a "+N" counter. 'wrap': grow the control to as many lines as needed.
}

export function Select({
  id,
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  closeOnSelect,
  disabled = false,
  className,
  popoverProps, // Destructure new prop
  startIcon,
  onSearchChange,
  loading = false,
  loadingContent,
  unstyled = false,
  searchTerm: controlledSearchTerm,
  children,
  error = false,
  size,
  chipDisplay = false,
  clearable = false,
  searchable = true,
  filterOptions = true,
  showChevron = true,
  maxSelect,
  showSelectedInList = false,
  renderOption,
  chipOverflow = 'collapse',
}: SelectProps) {
  const sizeClass = size === "xs" ? "form-control-xs" : size === "sm" ? "form-control-sm" : size === "lg" ? "form-control-lg" : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = controlledSearchTerm ?? internalSearchTerm;
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null); // Ref for the main select container
  const listRef = useRef<HTMLDivElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const overflowCounterRef = useRef<HTMLSpanElement>(null);
  const isTouchDevice = useRef(false);
  const skipBlurRef = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  // Determine the actual closeOnSelect behavior
  const actualCloseOnSelect = closeOnSelect !== undefined ? closeOnSelect : !multiple;

  // Convert current value to an array for consistent handling
  const selectedValuesArray = useMemo(() => {
    if (value === null || value === undefined) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Extract only selectable Option items
  const optionItems = useMemo(() => options.filter(isOption), [options]);

  const selectedOptions = useMemo(() => {
    return optionItems.filter(option => selectedValuesArray.includes(option.value));
  }, [optionItems, selectedValuesArray]);

  // For single-line chip display (`chipOverflow="collapse"`), how many chips fit
  // before the rest collapse into "+N". Starts optimistic (show all) so the very
  // first paint has real chip widths to measure; the effect below trims it.
  const [visibleChipCount, setVisibleChipCount] = useState(selectedOptions.length);
  const collapseChips = chipOverflow === 'collapse';

  // Measure which chips fit on one line. Every chip stays mounted at its natural
  // width — the overflowing ones are only visually hidden — so the measurement is
  // stable and can grow back when the control widens. Re-runs on selection change
  // and on any resize of the control.
  useEffect(() => {
    if (!collapseChips) return;
    const row = chipRowRef.current;
    if (!row) return;

    const control = selectRef.current;
    if (!control) return;

    const measure = () => {
      const chips = Array.from(row.querySelectorAll<HTMLElement>('.selected-chip'));
      if (chips.length === 0) {
        setVisibleChipCount(0);
        return;
      }
      // Budget comes from the control, not the row: the row's own width is a
      // function of how many chips are currently shown, so measuring it would
      // ratchet downward and never recover when the control grows back.
      const controlStyle = getComputedStyle(control);
      const available =
        control.clientWidth
        - parseFloat(controlStyle.paddingLeft)
        - parseFloat(controlStyle.paddingRight)
        // The search input sits on the same line and must keep its minimum.
        - MIN_SEARCH_INPUT_WIDTH;

      const gap = chipGapPx(row);
      // The "+N" counter competes for the same line, so reserve its width for every
      // case where at least one chip has to hide.
      const counterWidth = overflowCounterRef.current?.offsetWidth ?? 0;

      let fits = 0;
      let cursor = 0; // running width of the chips kept so far
      for (let i = 0; i < chips.length; i++) {
        // offsetWidth, not a bounding rect — overflow chips are positioned out of
        // flow, so their on-screen coordinates lie while their widths stay true.
        const end = cursor + (i === 0 ? 0 : gap) + chips[i].offsetWidth;
        // The last chip needs no counter space — if it fits, nothing collapses.
        const needed = i === chips.length - 1 ? end : end + gap + counterWidth;
        if (needed > available) break;
        cursor = end;
        fits++;
      }
      // Always keep one chip: a lone "+N" with no chip reads as broken. That chip
      // truncates with an ellipsis instead (`max-width` on the chip).
      setVisibleChipCount(Math.max(1, fits));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(control);
    return () => observer.disconnect();
  }, [collapseChips, selectedOptions, size]);

  const hiddenChipCount = collapseChips ? Math.max(0, selectedOptions.length - visibleChipCount) : 0;

  // Build dropdown items: filter options but keep groups/separators contextually
  const availableItems = useMemo(() => {
    const result: SelectItem[] = [];
    let lastWasGroupOrSep = false;

    for (const item of options) {
      if (!isOption(item)) {
        // Buffer group/separator — only add if followed by a visible option
        result.push(item);
        lastWasGroupOrSep = true;
        continue;
      }

      // Filter by search
      if (searchable && filterOptions && !item.label.toLowerCase().includes(searchTerm.toLowerCase())) continue;
      // Filter already selected in multi mode
      if (multiple && !showSelectedInList && selectedValuesArray.includes(item.value)) continue;

      lastWasGroupOrSep = false;
      result.push(item);
    }

    // Remove trailing groups/separators with no options after them
    while (result.length > 0 && !isOption(result[result.length - 1])) {
      result.pop();
    }

    // Remove leading separators and non-options that have no options following them
    const cleaned: SelectItem[] = [];
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (!isOption(item)) {
        // Check if any option exists after this item
        const hasOptionAfter = result.slice(i + 1).some(isOption);
        if (!hasOptionAfter) continue;
        // Skip leading separators (but allow leading groups)
        if (cleaned.length === 0 && !isGroup(item)) continue;
      }
      cleaned.push(item);
    }

    return cleaned;
  }, [options, searchTerm, multiple, selectedValuesArray, searchable, filterOptions]);

  // Flat list of selectable options (matching availableItems filtering)
  const selectableOptions = useMemo(
    () => availableItems.filter(isOption),
    [availableItems]
  );

  // Reset highlight when dropdown opens or search changes
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchTerm]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('.select-popover-item');
    // Map highlightedIndex (index into selectableOptions) to the DOM element
    let domIndex = 0;
    let count = 0;
    for (let i = 0; i < availableItems.length; i++) {
      if (isOption(availableItems[i])) {
        if (count === highlightedIndex) { domIndex = i; break; }
        count++;
      }
    }
    // domIndex is in availableItems space; find the matching child element
    const el = listRef.current.children[domIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, availableItems]);

  const handleSelect = useCallback((option: Option) => {
    if (disabled) return;
    if (option.disabled) return;

    let newValue: string | string[] | null;

    if (multiple) {
      const isAlreadySelected = selectedValuesArray.includes(option.value);
      if (isAlreadySelected) {
        newValue = selectedValuesArray.filter(val => val !== option.value);
      } else {
        if (maxSelect && selectedValuesArray.length >= maxSelect) return;
        newValue = [...selectedValuesArray, option.value];
      }
      if (newValue.length === 0) {
        newValue = null;
      }
    } else {
      newValue = option.value;
      setInternalSearchTerm('');
    }

    onChange(newValue);

    if (actualCloseOnSelect) {
      setIsOpen(false);
      setInternalSearchTerm('');
    } else if (multiple) {
      if (!isTouchDevice.current) {
        inputRef.current?.focus();
      }
      setInternalSearchTerm('');
    }
  }, [multiple, selectedValuesArray, onChange, actualCloseOnSelect, disabled, maxSelect]);

  const handleRemoveSelected = useCallback((optionValue: string) => {
    if (disabled) return;
    if (multiple) {
      const newValue = selectedValuesArray.filter(val => val !== optionValue);
      onChange(newValue.length === 0 ? null : newValue);
    } else {
      onChange(null);
    }
    if (isOpen && !isTouchDevice.current) {
      inputRef.current?.focus();
    }
  }, [multiple, selectedValuesArray, onChange, disabled, isOpen]);

  const handleClear = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(null);
    setInternalSearchTerm('');
  }, [disabled, onChange]);

  // For single select: use chip display if chipDisplay is true, otherwise show as text
  // For multi select: always use chip display
  const useChipDisplay = multiple || chipDisplay;

  const handleWrapperClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    if (!isTouchDevice.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [disabled]);

  const handleChevronClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(prev => !prev);
    if (!isOpen) {
      if (!isTouchDevice.current) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      setInternalSearchTerm('');
      inputRef.current?.blur();
    }
  }, [isOpen, disabled]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInternalSearchTerm(e.target.value);
    setIsOpen(true);
    onSearchChange?.(e.target.value);
  }, [onSearchChange]);

  const handleInputFocus = useCallback(() => {
    if (disabled) return;
    if (isTouchDevice.current && !isOpen) {
      skipBlurRef.current = true;
      inputRef.current?.blur();
      setIsOpen(true);
      return;
    }
    setIsOpen(true);
    setInternalSearchTerm('');
    onSearchChange?.('');
  }, [disabled, onSearchChange, isOpen]);

  const handleInputBlur = useCallback(() => {
    if (skipBlurRef.current) {
      skipBlurRef.current = false;
      return;
    }
    setInternalSearchTerm('');
    setIsOpen(false);
  }, []);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedValuesArray.length > 0) {
      e.preventDefault();
      handleRemoveSelected(selectedValuesArray[selectedValuesArray.length - 1]);
      return;
    }

    const findNextEnabled = (start: number, direction: 1 | -1): number => {
      const len = selectableOptions.length;
      if (len === 0) return -1;
      for (let i = 0; i < len; i++) {
        const idx = ((start + direction * i) % len + len) % len;
        if (!selectableOptions[idx].disabled) return idx;
      }
      return -1;
    };

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(findNextEnabled(0, 1));
        return;
      }
      setHighlightedIndex(prev => {
        const next = prev < selectableOptions.length - 1 ? prev + 1 : 0;
        return findNextEnabled(next, 1);
      });
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(findNextEnabled(selectableOptions.length - 1, -1));
        return;
      }
      setHighlightedIndex(prev => {
        const next = prev > 0 ? prev - 1 : selectableOptions.length - 1;
        return findNextEnabled(next, -1);
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < selectableOptions.length) {
        handleSelect(selectableOptions[highlightedIndex]);
      }
    }
  }, [searchTerm, selectedValuesArray, handleRemoveSelected, isOpen, selectableOptions, highlightedIndex, handleSelect]);

  useEffect(() => {
    if (!isOpen) {
      setInternalSearchTerm('');
      onSearchChange?.('');
    }
  }, [isOpen, onSearchChange]);

  const displayPlaceholder = selectedValuesArray.length === 0 && searchTerm === '';

  // Get the width of the select trigger to set as minWidth for the popover
  const selectTriggerWidth = selectRef.current?.offsetWidth;

  const triggerContent = unstyled ? (
    <div
      className={className}
      onClick={handleWrapperClick}
      ref={selectRef}
    >
      {children}
      <input
        id={id}
        ref={inputRef}
        type="text"
        className="select-unstyled-input"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
        onKeyDown={handleInputKeyDown}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  ) : (
    <div
      className={clsx(
        "form-control select",
        sizeClass,
        startIcon && "input-has-start-icon",
        disabled && "disabled",
        error && "form-field-error",
        isOpen && "select-open",
        useChipDisplay && selectedOptions.length > 0 && "select-has-chips",
        useChipDisplay && collapseChips && "select-nowrap",
        className
      )}
      onClick={handleWrapperClick}
      ref={selectRef}
    >
      {startIcon && <div className="input-icon input-icon-start">{startIcon}</div>}
      {useChipDisplay ? (
        // Chip display (always for multi, optional for single)
        <div
          ref={chipRowRef}
          className={clsx('select-chip-row', collapseChips && 'select-chip-row-collapse')}
        >
          {selectedOptions.map((option, index) => (
            <div
              key={option.value}
              // Chips past the fold stay mounted (measurement needs their real
              // width) but are taken out of view — see `.selected-chip-overflow`.
              className={clsx(
                'selected-chip',
                collapseChips && index >= visibleChipCount && 'selected-chip-overflow',
              )}
              aria-hidden={collapseChips && index >= visibleChipCount ? true : undefined}
            >
              <div className="selected-chip-label">
                {option.icon && <span className="select-option-icon">{option.icon}</span>}
                <span className="selected-chip-text">{option.label}</span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  className="selected-chip-close"
                  tabIndex={collapseChips && index >= visibleChipCount ? -1 : undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSelected(option.value);
                  }}
                  aria-label={`Remove ${option.label}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {/* Always mounted so its width is measurable before the first collapse;
              hidden (not unmounted) while everything fits. */}
          <span
            ref={overflowCounterRef}
            className={clsx('select-chip-overflow-count', hiddenChipCount === 0 && 'selected-chip-overflow')}
            aria-hidden={hiddenChipCount === 0 ? true : undefined}
          >
            +{hiddenChipCount}
          </span>
        </div>
      ) : (
        // Text display (for single select without chip)
        // Show value when there's a selection and not actively searching
        selectedOptions.length > 0 && !isOpen && (
          <span className="select-value">
            {selectedOptions[0].icon && <span className="select-option-icon">{selectedOptions[0].icon}</span>}
            {selectedOptions[0].label}
          </span>
        )
      )}
      <input
        id={id}
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder={displayPlaceholder ? placeholder : (selectedOptions.length > 0 && !useChipDisplay ? selectedOptions[0].label : '')}
        className={clsx(
          "select-input control-placeholder-input",
          selectedOptions.length > 0 && !useChipDisplay && !isOpen ? "select-input-hidden" : "",
          !searchable && "cursor-pointer",
        )}
        value={searchTerm}
        onChange={searchable ? handleInputChange : undefined}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
        onKeyDown={handleInputKeyDown}
        readOnly={!searchable}
      />
      {clearable && selectedValuesArray.length > 0 && !disabled ? (
        <div
          className="select-clear"
          onClick={handleClear}
          aria-label="Clear selection"
        >
          ×
        </div>
      ) : showChevron ? (
        <div
          className="select-chevron"
          onClick={handleChevronClick}
        >
          <Chevron
            size={16}
            direction="down"
            open={isOpen}
            className={clsx(disabled && "select-chevron-disabled")}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <PopOver
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setInternalSearchTerm('');
      }}
      trigger={triggerContent}
      triggerRef={selectRef}
      placement="bottom"
      align="end" // Default popover alignment set to 'end'
      // Spread all popoverProps and merge className and style
      width={selectTriggerWidth + 'px'}
      {...popoverProps}
    >
      <div className="select-popover" ref={listRef} onMouseDown={e => e.preventDefault()}>
        {loading ? (
          loadingContent ?? (
            <div className="select-loading">
              <Skeleton width="60%" />
              <Skeleton width="80%" />
              <Skeleton width="40%" />
            </div>
          )
        ) : availableItems.length > 0 ? (
          availableItems.map((item, index) => {
            if (!isOption(item)) {
              return isGroup(item)
                ? <div key={`group-${index}`} className="select-group-label">{item.label}</div>
                : <div key={`sep-${index}`} className="select-separator" />;
            }
            const isSelected = selectedValuesArray.includes(item.value);
            const optionIndex = selectableOptions.indexOf(item);
            return (
              <div
                key={item.value}
                className={clsx(
                  'select-popover-item',
                  isSelected && 'selected',
                  item.disabled && 'select-popover-item-disabled',
                  !item.disabled && optionIndex === highlightedIndex && 'highlighted',
                )}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => {
                  if (!item.disabled) setHighlightedIndex(optionIndex);
                }}
              >
                {renderOption
                  ? renderOption(item, { selected: isSelected })
                  : (<>{item.icon && <span className="select-option-icon">{item.icon}</span>}{item.label}</>)
                }
                {showSelectedInList && isSelected && <Checkmark width={16} height={16} className="select-check" />}
              </div>
            );
          })
        ) : (
          <div className="select-empty">No options found.</div>
        )}
      </div>
    </PopOver>
  );
}