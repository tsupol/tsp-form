"use client"
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { SnackbarProps, Snackbar, SnackbarPosition, SnackbarType } from '../components/Snackbar';

// Make type, duration, and position optional in AddSnackbarOptions
export type AddSnackbarOptions = Omit<SnackbarProps, 'id' | 'onRemove' | 'type' | 'duration' | 'position'> & Partial<Pick<SnackbarProps, 'type' | 'duration' | 'position'>>;

interface SnackbarDefaults {
  type?: SnackbarType;
  duration?: number;
  position?: SnackbarPosition;
}

interface SnackbarContextType {
  addSnackbar: (options: AddSnackbarOptions) => void;
  removeSnackbar: (id: string, position: SnackbarPosition) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
  defaults?: SnackbarDefaults; // Optional defaults prop
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children, defaults }) => {
  const [snackbars, setSnackbars] = useState<Record<SnackbarPosition, SnackbarProps[]>>({
    'top-right': [],
    'bottom-right': [],
    'top-center': [],
    'bottom-center': [],
  });

  // Define hardcoded defaults
  const hardcodedDefaults: SnackbarDefaults = {
    type: 'info',
    duration: 3000,
    position: 'bottom-right',
  };

  // Merge hardcoded defaults with props.defaults
  const effectiveDefaults = { ...hardcodedDefaults, ...defaults };

  const removeSnackbar = useCallback((id: string, position: SnackbarPosition) => {
    setSnackbars((prevSnackbars) => ({
      ...prevSnackbars,
      [position]: prevSnackbars[position].filter((snackbar) => snackbar.id !== id),
    }));
  }, []);

  const addSnackbar = useCallback((options: AddSnackbarOptions) => {
    const finalType = options.type || effectiveDefaults.type!;
    const finalDuration = options.duration || effectiveDefaults.duration!;
    const finalPosition = options.position || effectiveDefaults.position!;

    const newSnackbar: SnackbarProps = {
      ...options,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      onRemove: (idToRemove) => removeSnackbar(idToRemove, finalPosition),
      type: finalType,
      duration: finalDuration,
      position: finalPosition,
    };
    setSnackbars((prevSnackbars) => ({
      ...prevSnackbars,
      [finalPosition]: [...prevSnackbars[finalPosition], newSnackbar],
    }));
  }, [effectiveDefaults, removeSnackbar]);

  const allPositions: SnackbarPosition[] = ['top-right', 'bottom-right', 'top-center', 'bottom-center'];

  return (
    <SnackbarContext.Provider value={{ addSnackbar, removeSnackbar }}>
      {children}
      {allPositions.map((pos) => (
        <div key={pos} className={`snackbar-container snackbar-container-${pos}`}>
          {snackbars[pos].map((snackbar) => (
            <Snackbar
              key={snackbar.id}
              id={snackbar.id}
              message={snackbar.message}
              type={snackbar.type}
              duration={snackbar.duration}
              onRemove={snackbar.onRemove}
              position={snackbar.position}
            />
          ))}
        </div>
      ))}
    </SnackbarContext.Provider>
  );
};

export const useSnackbarContext = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbarContext must be used within a SnackbarProvider');
  }
  return context;
};