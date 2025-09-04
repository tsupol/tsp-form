"use client";

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import "../styles/checkbox.css";
import { Checkmark } from './Checkmark';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, onChange, checked: controlledCheckedProp, ...props }, forwardedRef) => {
    const uniqueId = id || React.useId();

    const internalInputRef = useRef<HTMLInputElement>(null);

    const [isIconVisible, setIsIconVisible] = useState(false);

    const setRefs = (node: HTMLInputElement | null) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
      internalInputRef.current = node;
    };

    useEffect(() => {
      if (controlledCheckedProp !== undefined) {
        setIsIconVisible(controlledCheckedProp);
      } else if (internalInputRef.current) {
        setIsIconVisible(internalInputRef.current.checked);
      }
    }, [controlledCheckedProp]); // Re-run if the controlled `checked` prop changes.

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsIconVisible(event.target.checked);

      onChange?.(event);
    };

    return (
      <>
        {/* Hidden native checkbox */}
        <input
          id={uniqueId}
          type="checkbox"
          className="sr-only checkbox-peer" // sr-only to hide visually, peer to enable sibling selection
          ref={setRefs} // Use our combined ref setter
          checked={controlledCheckedProp}
          onChange={handleChange}
          {...props}
        />
        {/* Custom styled checkbox visual */}
        <div
          className={clsx(
           'checkbox-box',
            className
          )}

          onClick={() => {
            if (internalInputRef.current) {
              internalInputRef.current.click();
              internalInputRef.current.focus();
            }
          }}
        >
          {/* Checkmark icon, visible based on the isIconVisible state */}
          {/*{isIconVisible && (*/}
          {/*  <Check className="w-3 h-3 text-primary-contrast"/>*/}
          {/*)}*/}
          {isIconVisible && (
            <Checkmark className="checkbox-mark"/>
          )}
        </div>
      </>
    );
  }
);

Checkbox.displayName = 'Checkbox';