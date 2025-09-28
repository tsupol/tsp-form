import { useState, useRef, useEffect, useCallback, useMemo, type ComponentProps, type MouseEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import { PopOver } from './PopOver';
import { Chevron } from './Chevron';
import clsx from 'clsx';
import '../styles/form.css';
import '../styles/select.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  multiple?: boolean;
  placeholder?: string;
  closeOnSelect?: boolean;
  disabled?: boolean;
  className?: string; // Additional classes for the main container (Select wrapper)
  popoverProps?: Partial<ComponentProps<typeof PopOver>>; // New prop for PopOver specific styling
}

export function Select({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  closeOnSelect,
  disabled = false,
  className,
  popoverProps, // Destructure new prop
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null); // Ref for the main select container

  // Determine the actual closeOnSelect behavior
  const actualCloseOnSelect = closeOnSelect !== undefined ? closeOnSelect : !multiple;

  // Convert current value to an array for consistent handling
  const selectedValuesArray = useMemo(() => {
    if (value === null || value === undefined) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedOptions = useMemo(() => {
    return options.filter(option => selectedValuesArray.includes(option.value));
  }, [options, selectedValuesArray]);

  const availableOptions = useMemo(() => {
    const filteredBySearch = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (multiple) {
      return filteredBySearch.filter(option => !selectedValuesArray.includes(option.value));
    }
    return filteredBySearch;
  }, [options, searchTerm, multiple, selectedValuesArray]);

  const handleSelect = useCallback((option: Option) => {
    if (disabled) return;

    let newValue: string | string[] | null;

    if (multiple) {
      const isAlreadySelected = selectedValuesArray.includes(option.value);
      if (isAlreadySelected) {
        newValue = selectedValuesArray.filter(val => val !== option.value);
      } else {
        newValue = [...selectedValuesArray, option.value];
      }
      if (newValue.length === 0) {
        newValue = null;
      }
    } else {
      newValue = option.value;
      setSearchTerm('');
    }

    onChange(newValue);

    if (actualCloseOnSelect) {
      setIsOpen(false);
      setSearchTerm('');
    } else if (multiple) {
      inputRef.current?.focus();
      setSearchTerm('');
    }
  }, [multiple, selectedValuesArray, onChange, actualCloseOnSelect, disabled]);

  const handleRemoveSelected = useCallback((optionValue: string) => {
    if (disabled) return;
    if (multiple) {
      const newValue = selectedValuesArray.filter(val => val !== optionValue);
      onChange(newValue.length === 0 ? null : newValue);
    } else {
      onChange(null);
    }
    inputRef.current?.focus();
  }, [multiple, selectedValuesArray, onChange, disabled]);

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
      setSearchTerm('');
      inputRef.current?.blur();
    }
  }, [isOpen, disabled]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setSearchTerm('');
  }, [disabled]);

  const handleInputBlur = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedValuesArray.length > 0) {
      e.preventDefault();
      handleRemoveSelected(selectedValuesArray[selectedValuesArray.length - 1]);
    }
  }, [searchTerm, selectedValuesArray, handleRemoveSelected]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const displayPlaceholder = selectedValuesArray.length === 0 && searchTerm === '';

  // Get the width of the select trigger to set as minWidth for the popover
  const selectTriggerWidth = selectRef.current?.offsetWidth;

  const triggerContent = (
    <div
      className={clsx(
        "form-control select",
        disabled && "disabled",
        className
      )}
      onClick={handleWrapperClick}
      ref={selectRef}
    >
      {selectedOptions.map(option => (
        <div
          key={option.value}
          className="selected-chip"
        >
          <div className="selected-chip-label">
            {option.label}
          </div>
          {!disabled && (multiple || selectedOptions.length === 1) && (
            <button
              type="button"
              className="selected-chip-close"
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
      <input
        ref={inputRef}
        type="text"
        placeholder={displayPlaceholder ? placeholder : ''}
        className={clsx(
          "select-input control-placeholder-input",
          selectedOptions.length > 0 ? "min-w-[50px]" : "w-full",
        )}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
        onKeyDown={handleInputKeyDown}
      />
      <div
        className="select-chevron"
        onClick={handleChevronClick}
      >
        <Chevron
          size={16}
          className={clsx("transition-transform duration-200", isOpen && "rotate-180", disabled && "text-gray-400")}
        />
      </div>
    </div>
  );

  return (
    <PopOver
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setSearchTerm('');
      }}
      trigger={triggerContent}
      placement="bottom"
      align="end" // Default popover alignment set to 'end'
      // Spread all popoverProps and merge className and style
      width={selectTriggerWidth + 'px'}
      {...popoverProps}
    >
      <div className="select-popover">
        {availableOptions.length > 0 ? (
          availableOptions.map(option => (
            <div
              key={option.value}
              className={clsx(
                'select-popover-item',
                selectedValuesArray.includes(option.value) && 'selected',
              )}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">No options found.</div>
        )}
      </div>
    </PopOver>
  );
}