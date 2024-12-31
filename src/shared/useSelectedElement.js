import { useState, useEffect, useCallback } from 'react';
import { 
  HEADER_AUCTIONS, 
  HEADER_CARS_STORE, 
  HEADER_MAIN_MENU, 
  HEADER_MY_CARS, 
  HEADER_PROFILE, 
  HEADER_STORE 
} from '../shared/elementKeys';
import { useFocus } from "./FocusContext"
import { FOCUS_ZONES } from '../shared/elementKeys';

export const useSelectedElement = () => {
  const [selectedElement, setSelectedElement] = useState(HEADER_MAIN_MENU); // Initialize to a default
  const { focusedZone, setFocusedZone } = useFocus();

  const handleElementSelect = (element) => {
    console.log('Element selected:', element);
    setSelectedElement(element);
    setFocusedZone(FOCUS_ZONES.HEADER); // Ensure focus is on header when an element is selected
  };

  const handleKeyDown = useCallback((event) => {
    const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown']; // Include ArrowDown
    if (!navigationKeys.includes(event.key)) return;

    // Only handle key presses if the focused zone is HEADER
    if (focusedZone !== FOCUS_ZONES.HEADER) return;

    event.preventDefault(); // Prevent default scrolling behavior

    console.log(`Header Key pressed: ${event.key}, Selected Element: ${selectedElement}`);

    switch (event.key) {
      case 'ArrowLeft':
        switch (selectedElement) {
          case HEADER_MAIN_MENU:
            // Optionally wrap around or do nothing
            break;
          case HEADER_CARS_STORE:
            setSelectedElement(HEADER_MAIN_MENU);
            console.log('Moved to HEADER_MAIN_MENU');
            break;
          case HEADER_MY_CARS:
            setSelectedElement(HEADER_CARS_STORE);
            console.log('Moved to HEADER_CARS_STORE');
            break;
          case HEADER_AUCTIONS:
            setSelectedElement(HEADER_MY_CARS);
            console.log('Moved to HEADER_MY_CARS');
            break;
          case HEADER_STORE:
            setSelectedElement(HEADER_AUCTIONS);
            console.log('Moved to HEADER_AUCTIONS');
            break;
          case HEADER_PROFILE:
            setSelectedElement(HEADER_STORE);
            console.log('Moved to HEADER_STORE');
            break;
          default:
            setSelectedElement(HEADER_MAIN_MENU);
            console.log('Default to HEADER_MAIN_MENU');
        }
        break;
      case 'ArrowRight':
        switch (selectedElement) {
          case HEADER_MAIN_MENU:
            setSelectedElement(HEADER_CARS_STORE);
            console.log('Moved to HEADER_CARS_STORE');
            break;
          case HEADER_CARS_STORE:
            setSelectedElement(HEADER_MY_CARS);
            console.log('Moved to HEADER_MY_CARS');
            break;
          case HEADER_MY_CARS:
            setSelectedElement(HEADER_AUCTIONS);
            console.log('Moved to HEADER_AUCTIONS');
            break;
          case HEADER_AUCTIONS:
            setSelectedElement(HEADER_STORE);
            console.log('Moved to HEADER_STORE');
            break;
          case HEADER_STORE:
            setSelectedElement(HEADER_PROFILE);
            console.log('Moved to HEADER_PROFILE');
            break;
          case HEADER_PROFILE:
            // Optionally wrap around or do nothing
            break;
          default:
            setSelectedElement(HEADER_MAIN_MENU);
            console.log('Default to HEADER_MAIN_MENU');
        }
        break;
      case 'ArrowDown':
        // Shift focus to PAGE
        console.log('Shifting focus to PAGE');
        setFocusedZone(FOCUS_ZONES.PAGE);
        // Optionally, set a selectedElement in PAGE or perform other actions
        break;
      default:
        break;
    }
  }, [focusedZone, selectedElement, setFocusedZone]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    console.log('useSelectedElement: Keydown listener added.');

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('useSelectedElement: Keydown listener removed.');
    };
  }, [handleKeyDown]); // Only depends on handleKeyDown

  return { selectedElement, handleElementSelect };
};