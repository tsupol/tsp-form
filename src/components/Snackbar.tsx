import { useEffect, useRef, useCallback } from 'react';
import '../styles/snackbar.css';

// Define the possible positions for the snackbar
export type SnackbarPosition = 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
export type SnackbarType = 'success' | 'error' | 'info' | 'warning'; // New type alias

export interface SnackbarProps {
  id: string;
  message: string;
  type: SnackbarType; // Use the new type alias
  duration: number;
  onRemove: (id: string) => void;
  position: SnackbarPosition;
}

export const Snackbar = ({
  id,
  message,
  type,
  duration,
  onRemove,
  position,
}:SnackbarProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onRemove(id);
    }, remainingTimeRef.current);
  }, [id, onRemove, remainingTimeRef]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      // Calculate remaining time
      remainingTimeRef.current -= (Date.now() - startTimeRef.current);
      if (remainingTimeRef.current < 0) {
        remainingTimeRef.current = 0;
      }
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (!timerRef.current && remainingTimeRef.current > 0) {
      startTimer();
    }
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  const snackbarClasses = `snackbar-item snackbar-item-${type}`;

  return (
    <div
      className={snackbarClasses}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      role="alert"
    >
      <div className="snackbar-item-content">
        <span>{message}</span>
        <button onClick={() => onRemove(id)} className="snackbar-item-close-button" aria-label="Close snackbar">
          &times;
        </button>
      </div>
    </div>
  );
};