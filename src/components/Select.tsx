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
  size?: "sm" | "md" | "lg";
  chipDisplay?: boolean; // Show selected value as chip (default false for single, always true for multi)
  clearable?: boolean; // Show clear button when value is selected
  searchable?: boolean; // Allow typing to filter options (default true)
  showChevron?: boolean; // Show chevron icon (default true)
  maxSelect?: number; // Maximum number of selectable items in multi mode
  showSelectedInList?: boolean; // Show selected items in dropdown with highlight instead of removing them (default false)
  renderOption?: (option: Option, state: { selected: boolean }) => ReactNode; // Custom option renderer
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
  showChevron = true,
  maxSelect,
  showSelectedInList = false,
  renderOption,
}: SelectProps) {
  const sizeClass = size === "sm" ? "form-control-sm" : size === "lg" ? "form-control-lg" : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = controlledSearchTerm ?? internalSearchTerm;
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null); // Ref for the main select container
  const listRef = useRef<HTMLDivElement>(null);

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
      if (searchable && !item.label.toLowerCase().includes(searchTerm.toLowerCase())) continue;
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
  }, [options, searchTerm, multiple, selectedValuesArray, searchable]);

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
      inputRef.current?.focus();
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
    if (isOpen) {
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
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [disabled]);

  const handleChevronClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
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
    setIsOpen(true);
    setInternalSearchTerm('');
    onSearchChange?.('');
  }, [disabled, onSearchChange]);

  const handleInputBlur = useCallback(() => {
    setInternalSearchTerm('');
    setIsOpen(false);
  }, []);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedValuesArray.length > 0) {
      e.preventDefault();
      handleRemoveSelected(selectedValuesArray[selectedValuesArray.length - 1]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
      setHighlightedIndex(prev =>
        prev < selectableOptions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(selectableOptions.length - 1);
        return;
      }
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : selectableOptions.length - 1
      );
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
        className
      )}
      onClick={handleWrapperClick}
      ref={selectRef}
    >
      {startIcon && <div className="input-icon input-icon-start">{startIcon}</div>}
      {useChipDisplay ? (
        // Chip display (always for multi, optional for single)
        selectedOptions.map(option => (
          <div
            key={option.value}
            className="selected-chip"
          >
            <div className="selected-chip-label">
              {option.icon && <span className="select-option-icon">{option.icon}</span>}
              <span className="selected-chip-text">{option.label}</span>
            </div>
            {!disabled && (
              <button
                type="button"
                className="selected-chip-close"
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
        ))
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
          selectedOptions.length > 0 && useChipDisplay ? "min-w-[50px]" : "w-full",
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
            className={clsx("transition-transform duration-200", isOpen && "rotate-180", disabled && "text-gray-400")}
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
                  optionIndex === highlightedIndex && 'highlighted',
                )}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(optionIndex)}
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
          <div className="px-4 py-2 text-sm text-gray-500">No options found.</div>
        )}
      </div>
    </PopOver>
  );
}