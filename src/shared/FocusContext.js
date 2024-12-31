import React, { createContext, useContext, useEffect, useState } from 'react';
import { FOCUS_ZONES } from './elementKeys';

const FocusContext = createContext();

export const FocusProvider = ({ children }) => {
  const [focusedZone, setFocusedZone] = useState(FOCUS_ZONES.PAGE); // Default focus on Page

  const handleKeyDown = (event) => {
    switch (focusedZone) {
      case FOCUS_ZONES.HEADER:
        // Handle HEADER-specific keys
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setFocusedZone(FOCUS_ZONES.PAGE);
          console.log('Focus shifted to PAGE from HEADER via ArrowDown.');
        }
        break;
      case FOCUS_ZONES.PAGE:
        // Handle PAGE-specific keys
        break;
      case FOCUS_ZONES.SETTINGS:
        // Handle SETTINGS-specific keys
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    console.log('FocusProvider: Keydown listener added.');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('FocusProvider: Keydown listener removed.');
    };
  }, [focusedZone]);

  return (
    <FocusContext.Provider value={{ focusedZone, setFocusedZone }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};