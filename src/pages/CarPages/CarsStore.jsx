import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Form, Input, message, Select, Spin } from "antd";
import "antd/dist/reset.css"; // Import Ant Design CSS
import { supabase } from "../../supabase";
import "./carsPage.css";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import {
  createNewUserCar,
  checkAndUpdateAchievements,
  playOpeningSound,
  playClosingSound
} from "../../functions";
import { CreditWarningModal } from "../../components/CreditWarningModal/CreditWarningModal";
import { useDispatch, useSelector } from "react-redux";
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  setCurrentFocusedElement,
  setFocusedZone,
  setIsTopCar,
  TOP_CAR,
  MAKER_ROW,
  resetShouldFocusFirstCar
} from "../../redux/slices/focusSlice";
import useSoundEffects from "../../hooks/useSoundEffects";
import { useDemoMode } from "../../contexts/DemoModeContext";
import { getMockCars, updateMockCars } from "../../mockData";
import { getCarImageUrl } from "../../config/assets";

const { Option } = Select;
// Supabase client configured in ../../supabase.js

const CarsStore = ({ playerInfo, setMoney, money }) => {
  const dispatch = useDispatch();
  const { isDemoMode, demoUser, updateDemoUser } = useDemoMode();
  const [cars, setCars] = useState([]);
  const [visible, setVisible] = useState(false);
  
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [focusedMake, setFocusedMake] = useState(null);
  const [focusedCar, setFocusedCar] = useState(null);
  const [form] = Form.useForm();
  const [carDetailsVisible, setCarDetailsVisible] = useState(false); // Initialize as false so modal is hidden by default
  const [selectedCarIndex, setSelectedCarIndex] = useState(null); // Initialize as null
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [allTopRowCars, setAllTopRowCars] = useState([]);
  const [allBottomRowCars, setAllBottomRowCars] = useState([]);
  const [recreatingCars, setRecreatingCars] = useState(false);

  const { playSwitchSound } = useSoundEffects();

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement, shouldFocusFirstCar } = useSelector((state) => state.focus);

  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

  const groupCarsByMake = useCallback((carsToGroup) => {
    const groups = carsToGroup.reduce((acc, car) => {
      const make = car?.make?.trim().toUpperCase() || "UNKNOWN";
      if (!acc[make]) acc[make] = [];
      acc[make].push(car);
      return acc;
    }, {});
    return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
  }, []);


  useEffect(() => {
    const carsContainer = document.querySelector('.cars');
    if (carsContainer) {
      const handleWheel = (e) => {
        // Always prevent default to avoid any vertical scrolling
        e.preventDefault();

        // Handle both vertical and horizontal wheel events
        if (e.deltaY !== 0) {
          // Convert vertical wheel movement to horizontal scrolling
          carsContainer.scrollLeft += e.deltaY * -1.5;
        }
        if (e.deltaX !== 0) {
          // Direct horizontal wheel movement
          carsContainer.scrollLeft += e.deltaX * -1.5;
        }
      };

      // Add event listener with passive: false to allow preventDefault
      carsContainer.addEventListener('wheel', handleWheel, { passive: false });

      // Clean up on unmount
      return () => carsContainer.removeEventListener('wheel', handleWheel);
    }
  }, []);

  useEffect(() => {
    if (cars.length > 0) {
      const topRowCars = [];
      const bottomRowCars = [];
      Object.entries(groupCarsByMake(cars)).forEach(([make, makeCars]) => {
        // Ensure consistent sorting within each make before assigning to rows
        const sortedMakeCars = [...makeCars].sort((a, b) =>
          (a.model || "").localeCompare(b.model || "")
        );
        sortedMakeCars.forEach((car, index) => {
          if (index % 2 === 0) topRowCars.push(car);
          else bottomRowCars.push(car);
        });
      });
      setAllTopRowCars(topRowCars);
      setAllBottomRowCars(bottomRowCars);
    }
  }, [cars, groupCarsByMake]);

  // Set focus zone and element when component mounts
  useEffect(() => {
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (focusedZone !== FOCUS_ZONES.HEADER && !focusedCar && !focusedMake) {
        // Only set to TOP_CAR if we are not already focused somewhere specific
        // And not coming back from the header with intent to focus a maker
       if (currentFocusedElement !== MAKER_ROW) {
            dispatch(setCurrentFocusedElement(TOP_CAR));
       }
    }
    const carsContainer = document.querySelector('.cars');
    if (carsContainer) {
      carsContainer.focus();
    }
  }, [dispatch, focusedZone, currentFocusedElement, focusedCar, focusedMake]); // Add dependencies

  // Handle focus on maker row when currentFocusedElement changes or when returning from header
  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE && currentFocusedElement === MAKER_ROW && cars.length > 0) {
      console.log("MAKER_ROW is focused, current focusedMake:", focusedMake);
      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake).sort();

      if (makes.length > 0) {
        let makeToFocus = focusedMake;
        // If no maker is currently focused (e.g., coming down from header), focus the first one
        if (!makeToFocus) {
            console.log("No specific maker focused, defaulting to first maker:", makes[0]);
            makeToFocus = makes[0];
            setFocusedMake(makeToFocus); // Update state
        }
        setFocusedCar(null); // Ensure no car is focused

        setTimeout(() => {
          console.log("Attempting to focus maker element:", makeToFocus);
          const element = document.querySelector(`[data-make="${makeToFocus}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            // element.focus(); // Focusing the h2 might not be ideal, let the class handle visual state
            console.log("Maker element scrolled into view:", makeToFocus);
          } else {
            console.log("Could not find element with data-make:", makeToFocus);
          }
        }, 100); // Timeout helps ensure DOM is ready
      }
    }
  }, [currentFocusedElement, focusedZone, cars, focusedMake, groupCarsByMake]); // Added groupCarsByMake dependency


  // Focus the specific maker element when focusedMake changes *and* we are in MAKER_ROW
   useEffect(() => {
     if (focusedMake && currentFocusedElement === MAKER_ROW) {
       setFocusedCar(null); // Ensure no car is focused
       setTimeout(() => {
         const element = document.querySelector(`[data-make="${focusedMake}"]`);
         if (element) {
           element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
           // element.focus(); // Let visual cue be the class
         }
       }, 100);
     }
   }, [focusedMake, currentFocusedElement]); // Run only when focusedMake or currentFocusedElement changes

   // Clear focus state when navigating away from the page zone
   useEffect(() => {
       if (focusedZone === FOCUS_ZONES.HEADER) {
           // Clear page-specific focus when moving to header
           setSelectedCarIndex(null);
           setFocusedMake(null);
           setFocusedCar(null);
       }
   }, [focusedZone]);

  // TEMP: Ensure a car is selected for the test
  useEffect(() => {
    if (cars.length > 0 && !selectedCar) {
      setSelectedCar(cars[0]);
    }
  }, [cars, selectedCar]);

    // Scroll focused car into view
   useEffect(() => {
     if (focusedCar && currentFocusedElement !== MAKER_ROW) { // Only scroll car if not focusing maker
      const element = document.querySelector(`[data-car-id="${focusedCar.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
        // Ensure maker focus is cleared when a car becomes focused
        if(focusedMake){
            setFocusedMake(null);
        }
    }
  }, [focusedCar, currentFocusedElement, focusedMake]); // Add focusedMake dependency


  // Focus on the first car when cars are loaded or when shouldFocusFirstCar is true
  useEffect(() => {
    // Only run if cars are loaded, we are in PAGE zone, and either shouldFocusFirstCar is true or no element is focused yet
    if (cars.length > 0 && focusedZone === FOCUS_ZONES.PAGE && (shouldFocusFirstCar || (!focusedCar && !focusedMake))) {
      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake).sort();

      if (makes.length > 0) {
        const firstMakeCars = carsByMake[makes[0]]?.sort((a,b) => (a.model || "").localeCompare(b.model || ""));
        if (firstMakeCars && firstMakeCars.length > 0) {
          const firstCar = firstMakeCars[0];
          console.log("Focusing first car:", firstCar.make, firstCar.model);
          setFocusedCar(firstCar);
          setSelectedCarIndex(cars.findIndex(c => c.id === firstCar.id));
          setFocusedMake(null); // Ensure no maker is focused

          // Set initial focus state in Redux
          dispatch(setCurrentFocusedElement(TOP_CAR)); // Assuming first car is always top row initially
          dispatch(setIsTopCar(true)); // Set based on actual position later if needed


          // Reset the shouldFocusFirstCar flag after focusing
          if (shouldFocusFirstCar) {
            dispatch(resetShouldFocusFirstCar());
          }
        }
      }
    }
  }, [cars, shouldFocusFirstCar, focusedCar, focusedMake, focusedZone, dispatch, groupCarsByMake]); // Added dependencies

  // Update isTopCar state in Redux when focusedCar changes
  useEffect(() => {
    if (focusedCar) {
      const isTop = allTopRowCars.some(car => car.id === focusedCar.id);
      dispatch(setIsTopCar(isTop));
      // If a car is focused, ensure maker is not focused state-wise
      if (focusedMake) {
        setFocusedMake(null);
      }
      // Ensure the Redux state reflects car focus
      if(currentFocusedElement === MAKER_ROW){
         dispatch(setCurrentFocusedElement(isTop ? TOP_CAR : 'BOTTOM_CAR')); // Or a more specific state if needed
      }

    }
  }, [focusedCar, allTopRowCars, dispatch, focusedMake, currentFocusedElement]); // Added focusedMake, currentFocusedElement

  // Enhanced version with forced update
  const showCarDetailsModal = useCallback(() => {
    console.log("showCarDetailsModal called, setting carDetailsVisible to true");
    // First set to false to ensure a re-render if it was already true
    setCarDetailsVisible(false);
    // Use setTimeout to ensure the state update has time to process
    setTimeout(() => {
      setCarDetailsVisible(true);
      console.log("carDetailsVisible should now be true");
    }, 10);
  }, []);


  const fetchCars = useCallback(async () => {
    try {
      console.log("Fetching cars...");
      setCarsLoading(true); // Start loading indicator
      
      let carsData = [];
      
      // Always fetch cars from backend, even in demo mode
      console.log("Fetching cars from backend");
      const { data: carData, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching cars:", error);
        throw error;
      }
      
      console.log("Car data received:", carData);
      carsData = carData;
      
      // If in demo mode and no cars were returned, use default mock cars
      if (isDemoMode && (!carsData || carsData.length === 0)) {
        console.log("Demo mode: No cars found in backend, using mock cars");
        carsData = getMockCars();
        
        // If there are no mock cars in localStorage, initialize with some default cars
        if (!carsData || carsData.length === 0) {
          console.log("No mock cars found in localStorage, initializing with defaults");
          carsData = [
            {
              id: '1',
              make: 'Ferrari',
              model: '488 GTB',
              year: 2020,
              price: 300000,
              type: 'LEGENDARY',
              description: 'Like new condition, low mileage',
              seller: 'demo-user'
            },
            {
              id: '2',
              make: 'Lamborghini',
              model: 'Huracan',
              year: 2021,
              price: 350000,
              type: 'EPIC',
              description: 'Perfect condition, fully loaded',
              seller: 'demo-user'
            },
            {
              id: '3',
              make: 'Porsche',
              model: '911 Turbo S',
              year: 2022,
              price: 280000,
              type: 'RARE',
              description: 'Brand new, never driven',
              seller: 'demo-user'
            },
            {
              id: '4',
              make: 'Aston Martin',
              model: 'DB11',
              year: 2021,
              price: 240000,
              type: 'EPIC',
              description: 'Elegant and powerful',
              seller: 'demo-user'
            },
            {
              id: '5',
              make: 'McLaren',
              model: '720S',
              year: 2020,
              price: 320000,
              type: 'LEGENDARY',
              description: 'Supercar performance',
              seller: 'demo-user'
            },
            {
              id: '6',
              make: 'Bugatti',
              model: 'Chiron',
              year: 2022,
              price: 3000000,
              type: 'LEGENDARY',
              description: 'The ultimate hypercar',
              seller: 'demo-user'
            },
            {
              id: '7',
              make: 'Mercedes',
              model: 'AMG GT',
              year: 2021,
              price: 150000,
              type: 'RARE',
              description: 'German engineering at its finest',
              seller: 'demo-user'
            },
            {
              id: '8',
              make: 'BMW',
              model: 'M8 Competition',
              year: 2022,
              price: 130000,
              type: 'RARE',
              description: 'Luxury sports coupe',
              seller: 'demo-user'
            },
            {
              id: '9',
              make: 'Audi',
              model: 'R8',
              year: 2021,
              price: 170000,
              type: 'EPIC',
              description: 'Everyday supercar',
              seller: 'demo-user'
            },
            {
              id: '10',
              make: 'Chevrolet',
              model: 'Corvette C8',
              year: 2022,
              price: 80000,
              type: 'COMMON',
              description: 'American muscle',
              seller: 'demo-user'
            }
          ];
          
          // Save the default cars to localStorage
          updateMockCars(carsData);
        }
      }

      // Ensure sorting happens *before* setting state
      const sortedCars = [...carsData].sort((a, b) => {
          const makeCompare = (a.make || "").localeCompare(b.make || "");
          if (makeCompare !== 0) return makeCompare;
          return (a.model || "").localeCompare(b.model || ""); // Sort by model within make
      });

      setCars(sortedCars);

      // Important: Reset focus state *after* fetch completes but *before* initial focus useEffect runs
      setFocusedCar(null);
      setFocusedMake(null);
      setSelectedCarIndex(null); // Reset index too
      // Do not dispatch focus changes here, let the initial focus useEffect handle it based on `shouldFocusFirstCar`

    } catch (error) {
      console.error("Error fetching cars:", error);
      message.error("Failed to load cars."); // User feedback
    } finally {
      setCarsLoading(false); // Stop loading indicator
    }
  }, [isDemoMode]); // Add isDemoMode as dependency

  useEffect(() => { fetchCars() }, [fetchCars]);



  const chunkCars = (carsToChunk, size) => {
    const chunks = [];
    for (let i = 0; i < carsToChunk.length; i += size) {
      chunks.push(carsToChunk.slice(i, i + size));
    }
    return chunks;
  };

  const handleKeyDown = useCallback((event) => {
    const { key } = event;
    // Ignore keydown if a modal is visible or focus is not on the page content
    if (carDetailsVisible || visible || creditWarningModalvisible || focusedZone === FOCUS_ZONES.HEADER) {
        console.log("Keydown ignored: Modal visible or focus in header. Focused zone:", focusedZone);
        return;
    }

    // Ensure cars are loaded and rows are populated
    if (carsLoading || cars.length === 0 || allTopRowCars.length === 0) {
        console.log("Keydown ignored: Cars not ready.");
        return;
    }

    const carsByMake = groupCarsByMake(cars);
    const makes = Object.keys(carsByMake); // Already sorted due to groupCarsByMake implementation

    // --- Mobile Navigation ---
    if (isMobile) {
      // Simplified mobile navigation: treat all cars as one list
      const allCarsFlat = [...cars]; // Use the already sorted cars array
      const currentMobileIndex = focusedCar ? allCarsFlat.findIndex(c => c.id === focusedCar.id) : -1;

      switch (key) {
        case "ArrowRight":
          event.preventDefault();
          if (currentMobileIndex < allCarsFlat.length - 1) {
            const nextCar = allCarsFlat[currentMobileIndex + 1];
            setFocusedCar(nextCar);
            setSelectedCarIndex(currentMobileIndex + 1); // Update index based on flat list
            setFocusedMake(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "ArrowLeft":
          event.preventDefault();
          if (currentMobileIndex > 0) {
            const prevCar = allCarsFlat[currentMobileIndex - 1];
            setFocusedCar(prevCar);
            setSelectedCarIndex(currentMobileIndex - 1); // Update index based on flat list
            setFocusedMake(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          // Move 2 positions forward (to the item below in the grid)
          if (currentMobileIndex + 2 < allCarsFlat.length) {
            const nextCar = allCarsFlat[currentMobileIndex + 2];
            setFocusedCar(nextCar);
            setSelectedCarIndex(currentMobileIndex + 2); // Update index based on flat list
            setFocusedMake(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "ArrowUp":
          // If we're in the first row, go to header
          if (currentMobileIndex < 2) {
            event.preventDefault();
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
            setFocusedCar(null); // Clear car focus
            setFocusedMake(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          // Otherwise move 2 positions backward (to the item above in the grid)
          else if (currentMobileIndex >= 2) {
            event.preventDefault();
            const prevCar = allCarsFlat[currentMobileIndex - 2];
            setFocusedCar(prevCar);
            setSelectedCarIndex(currentMobileIndex - 2); // Update index based on flat list
            setFocusedMake(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

         case "Enter":
              event.preventDefault(); // Prevent potential double actions
              if (focusedCar) {
                  setSelectedCar(focusedCar); // Use original state setter
                  showCarDetailsModal(); // Use original function
                  if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
              }
             break;
        default:
             break; // Ignore other keys
      }
      return; // End mobile handling
    }

    // --- Desktop Navigation ---
    switch (key) {
      case "ArrowRight": {
        event.preventDefault();
        // 1. Maker focused? Move to next maker.
        if (currentFocusedElement === MAKER_ROW && focusedMake) {
          const currentMakeIndex = makes.indexOf(focusedMake);
          if (currentMakeIndex < makes.length - 1) {
            const nextMake = makes[currentMakeIndex + 1];
            setFocusedMake(nextMake);
            setFocusedCar(null); // Ensure no car is focused
            // dispatch(setCurrentFocusedElement(MAKER_ROW)); // Already in MAKER_ROW
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          return; // Handled maker navigation
        }

        // 2. Car focused? Move to next car in the same row (top or bottom).
        if (focusedCar) {
            const isInTopRow = allTopRowCars.some(c => c.id === focusedCar.id);
            const currentArray = isInTopRow ? allTopRowCars : allBottomRowCars;
            const currentIndexInRow = currentArray.findIndex(c => c.id === focusedCar.id);

            if (currentIndexInRow !== -1 && currentIndexInRow < currentArray.length - 1) {
                // Move to the next car in the *same* global row array
                const nextCar = currentArray[currentIndexInRow + 1];
                setFocusedCar(nextCar);
                setSelectedCarIndex(cars.findIndex(c => c.id === nextCar.id)); // Update global index
                setFocusedMake(null);
                if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
             // Note: No wrap-around or jumping between makes on simple right arrow. User needs to go Down/Up.
        }
        break;
      }

      case "ArrowLeft": {
        event.preventDefault();
        // 1. Maker focused? Move to previous maker.
        if (currentFocusedElement === MAKER_ROW && focusedMake) {
          const currentMakeIndex = makes.indexOf(focusedMake);
          if (currentMakeIndex > 0) {
            const prevMake = makes[currentMakeIndex - 1];
            setFocusedMake(prevMake);
            setFocusedCar(null);
            // dispatch(setCurrentFocusedElement(MAKER_ROW)); // Still in MAKER_ROW
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          return; // Handled maker navigation
        }

        // 2. Car focused? Move to previous car in the same row.
        if (focusedCar) {
            const isInTopRow = allTopRowCars.some(c => c.id === focusedCar.id);
            const currentArray = isInTopRow ? allTopRowCars : allBottomRowCars;
            const currentIndexInRow = currentArray.findIndex(c => c.id === focusedCar.id);

            if (currentIndexInRow > 0) {
                 // Move to the previous car in the *same* global row array
                const prevCar = currentArray[currentIndexInRow - 1];
                setFocusedCar(prevCar);
                setSelectedCarIndex(cars.findIndex(c => c.id === prevCar.id)); // Update global index
                setFocusedMake(null);
                if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
             // Note: No wrap-around.
        }
        break;
      }

      case "ArrowDown": {
        event.preventDefault();
        // 1. Maker focused? Move to the first car (top row) of that maker.
        if (currentFocusedElement === MAKER_ROW && focusedMake) {
            const makeCars = carsByMake[focusedMake];
            const topRowCarsOfMake = makeCars?.filter((car, index) => index % 2 === 0).sort((a,b)=>(a.model||"").localeCompare(b.model||"")); // Ensure sort

            if (topRowCarsOfMake?.length > 0) {
                const firstTopCar = topRowCarsOfMake[0];
                console.log("Going down from maker", focusedMake, "to car", firstTopCar.model);
                setFocusedCar(firstTopCar);
                setFocusedMake(null); // Unfocus maker
                setSelectedCarIndex(cars.findIndex(c => c.id === firstTopCar.id));
                dispatch(setCurrentFocusedElement(TOP_CAR)); // Explicitly set focus type
                dispatch(setIsTopCar(true)); // It's a top row car
                if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            } else {
                console.log("Maker", focusedMake, "has no top row cars to focus.");
                // Optionally, could try focusing bottom row, but spec implies top first.
            }
            return; // Handled maker navigation down
        }

        // 2. Top row car focused? Move down to the corresponding bottom row car (if exists).
        if (focusedCar && allTopRowCars.some(c => c.id === focusedCar.id)) {
            const currentMake = focusedCar.make?.trim().toUpperCase();
            const makeCars = carsByMake[currentMake];
            if (!makeCars) break; // Should not happen if focusedCar exists

            const sortedMakeCars = [...makeCars].sort((a,b)=>(a.model||"").localeCompare(b.model||""));
            const topRowCarsOfMake = sortedMakeCars.filter((_, i) => i % 2 === 0);
            const bottomRowCarsOfMake = sortedMakeCars.filter((_, i) => i % 2 === 1);

            const topRowIndex = topRowCarsOfMake.findIndex(c => c.id === focusedCar.id);

            if (topRowIndex !== -1) {
                // Try to find car directly below
                if (bottomRowCarsOfMake.length > topRowIndex) {
                    const bottomCar = bottomRowCarsOfMake[topRowIndex];
                    console.log("Going down from top", focusedCar.model, "to bottom", bottomCar.model);
                    setFocusedCar(bottomCar);
                    setSelectedCarIndex(cars.findIndex(c => c.id === bottomCar.id));
                    setFocusedMake(null);
                    dispatch(setCurrentFocusedElement('BOTTOM_CAR')); // Update focus type
                    dispatch(setIsTopCar(false));
                    if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
                } else if (bottomRowCarsOfMake.length > 0) {
                    // If no direct match, go to the *last* car in the bottom row of this make
                    const lastBottomCar = bottomRowCarsOfMake[bottomRowCarsOfMake.length - 1];
                    console.log("Going down from top", focusedCar.model, "to last bottom", lastBottomCar.model);
                    setFocusedCar(lastBottomCar);
                    setSelectedCarIndex(cars.findIndex(c => c.id === lastBottomCar.id));
                    setFocusedMake(null);
                    dispatch(setCurrentFocusedElement('BOTTOM_CAR'));
                    dispatch(setIsTopCar(false));
                    if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
                } else {
                    console.log("No bottom row cars in make", currentMake, "to move down to.");
                    // Stay on the current car if no car below
                }
            }
        }
        // 3. Bottom row car focused? Stay there (ArrowDown does nothing).
        break;
      }

       case "ArrowUp": {
           event.preventDefault();

           // 1. Maker focused? Move to Header.
           if (currentFocusedElement === MAKER_ROW && focusedMake) {
               console.log("Going up from maker", focusedMake, "to header");
               dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
               dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
               setFocusedMake(null); // Clear maker focus
               setFocusedCar(null); // Clear car focus
               if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
               return;
           }

           // 2. Car focused?
           if (focusedCar) {
               const currentMake = focusedCar.make?.trim().toUpperCase();
               const isTopRow = allTopRowCars.some(c => c.id === focusedCar.id);

               // 2a. If in Top Row: Move focus to the Maker Title.
               if (isTopRow) {
                   if (currentMake && makes.includes(currentMake)) {
                       console.log("Going up from top row car", focusedCar.model, "to maker", currentMake);
                       setFocusedMake(currentMake); // Set the maker to be focused
                       setFocusedCar(null);         // Unfocus the car
                       dispatch(setCurrentFocusedElement(MAKER_ROW)); // Update Redux state
                       dispatch(setIsTopCar(false)); // Not a car focus anymore
                       if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
                   } else {
                        console.warn("Cannot move up to maker: Maker not found for car", focusedCar);
                   }
                   return; // Handled top row up
               }

               // 2b. If in Bottom Row: Move focus to the corresponding car in the top row of the same make.
               const isBottomRow = allBottomRowCars.some(c => c.id === focusedCar.id);
               if (isBottomRow) {
                   const makeCars = carsByMake[currentMake];
                   if (makeCars) {
                       const sortedMakeCars = [...makeCars].sort((a,b)=>(a.model||"").localeCompare(b.model||""));
                       const topRowCarsOfMake = sortedMakeCars.filter((_, i) => i % 2 === 0);
                       const bottomRowCarsOfMake = sortedMakeCars.filter((_, i) => i % 2 === 1);
                       
                       // Find the index of the current car within this make's bottom row
                       const bottomRowIndex = bottomRowCarsOfMake.findIndex(c => c.id === focusedCar.id);
                       
                       if (bottomRowIndex !== -1 && topRowCarsOfMake.length > bottomRowIndex) {
                           // Move to the corresponding position in the top row of this make
                           const topCar = topRowCarsOfMake[bottomRowIndex];
                           console.log("Going up from bottom row car", focusedCar.model, "to top row car", topCar.model);
                           setFocusedCar(topCar);
                           setSelectedCarIndex(cars.findIndex(c => c.id === topCar.id));
                           setFocusedMake(null);
                           dispatch(setCurrentFocusedElement(TOP_CAR));
                           dispatch(setIsTopCar(true));
                           if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
                       } else if (topRowCarsOfMake.length > 0) {
                           // If no direct match, go to the first car in the top row of this make
                           const firstTopCar = topRowCarsOfMake[0];
                           console.log("Going up from bottom row car", focusedCar.model, "to first top row car", firstTopCar.model);
                           setFocusedCar(firstTopCar);
                           setSelectedCarIndex(cars.findIndex(c => c.id === firstTopCar.id));
                           setFocusedMake(null);
                           dispatch(setCurrentFocusedElement(TOP_CAR));
                           dispatch(setIsTopCar(true));
                           if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
                       }
                   }
                   return; // Handled bottom row up
               }
           }
           break;
       }

        case "Enter": {
            event.preventDefault(); // Prevent potential default actions
             // If a car is focused, open details
             if (focusedCar && !focusedMake) {
                 setSelectedCar(focusedCar); // Use original state setter
                 showCarDetailsModal(); // Use original function
                 if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
             }
            // If a maker is focused, maybe select the first car? (Current behavior: does nothing on Enter for maker)
            // else if (focusedMake && currentFocusedElement === MAKER_ROW) {
            //     // Optional: Implement action for Enter on Maker title if needed
            // }
            break;
        }
        default:
             break; // Ignore other keys
    }
  }, [
    // Dependencies
     carDetailsVisible, visible, creditWarningModalvisible, focusedZone, carsLoading, cars, isMobile,
     focusedCar, focusedMake, currentFocusedElement,
     allTopRowCars, allBottomRowCars,
     soundEffectsOn, soundEffectsOnQuickSettings,
     dispatch, playSwitchSound, showCarDetailsModal, playOpeningSound, groupCarsByMake // Use original functions
   ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const buyCar = async (car) => {
    if (money >= car.price) {
      setLoadingBuy(true);
      try {
        const newMoney = money - car.price;
        setMoney(newMoney); // Optimistic UI update for money
        
        if (isDemoMode) {
          // For demo mode, update both backend and localStorage
          console.log("Demo mode: Buying car with backend and localStorage");
          
          // Update demo user's money in localStorage
          if (demoUser) {
            const updatedUser = { ...demoUser, money: newMoney };
            updateDemoUser(updatedUser);
            console.log("Demo user money updated in localStorage:", newMoney);
            
            // Try to update in backend first
            try {
              await supabase
                .from('users')
                .update({ money: newMoney })
                .eq('id', demoUser.id);
              console.log("Demo user money updated in backend");
              
              // Create user car in backend
              await createNewUserCar(demoUser.id, car.id);
              console.log("Demo mode: Car bought and added to user's cars in backend");
            } catch (backendError) {
              console.warn("Could not update backend in demo mode:", backendError);
              // Fall back to localStorage only if backend fails
              
              // Create a user car entry in localStorage as backup
              const userCars = JSON.parse(localStorage.getItem('demoUserCars') || '[]');
              
              // Check if the car is already in the user's collection
              const alreadyOwned = userCars.some(userCar => userCar.carId === car.id);
              
              if (!alreadyOwned) {
                userCars.push({
                  id: `user-car-${Date.now()}`,
                  userId: demoUser.id,
                  carId: car.id,
                  car: car, // Store the full car object for easy access
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
                localStorage.setItem('demoUserCars', JSON.stringify(userCars));
                console.log("Demo mode: Car bought and added to user's cars in localStorage");
              } else {
                console.log("Demo mode: Car already owned in localStorage");
              }
            }
            
            message.success("Car successfully bought!");
          }
        } else {
          // For authenticated users, use the backend
          await supabase
            .from('users')
            .update({ money: newMoney })
            .eq('id', playerInfo.id);
          
          await createNewUserCar(playerInfo.id, car.id);
          message.success("Car successfully bought!");
          await checkAndUpdateAchievements(playerInfo.id); // Check achievements after successful purchase
        }
      } catch (err) {
        console.error("Error buying car:", err);
        console.error("Error details:", {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint
        });
        message.error("Error buying car. Please try again.");
        setMoney(money); // Revert optimistic update on error
      } finally {
        setLoadingBuy(false);
        setCarDetailsVisible(false); // Close modal regardless of success/error
        // Refocus might be needed here depending on desired behavior after purchase
      }
    } else {
      setCarDetailsVisible(false); // Close details modal first
      setCreditWarningModalvisible(true); // Then show warning
    }
  };

  const handleCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setVisible(false);
  };

  const handleCarDetailsCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setCarDetailsVisible(false);
    // Optional: Refocus the car card that was being viewed
     setTimeout(() => {
         if (focusedCar) {
            const element = document.querySelector(`[data-car-id="${focusedCar.id}"] .car-card`);
             if(element) element.focus(); // Or the container if card itself isn't focusable
         } else if (focusedMake) {
            const element = document.querySelector(`[data-make="${focusedMake}"]`);
             if(element) element.focus();
         }
     }, 0); // Timeout ensures modal is closed
  };

  const createNewCar = async (values) => {
    setLoadingBuy(true); // Reuse loading state for creation? Maybe add a dedicated one.
    try {
        // Always use the backend to create cars, even in demo mode
        console.log("Creating car in backend");
        const { data: newCar, error } = await supabase
          .from('cars')
          .insert([{
            ...values,
            year: parseInt(values.year),
            price: parseInt(values.price)
          }])
          .select()
          .single();

        if (error) throw error;
        
        // If in demo mode, also update localStorage for backup
        if (isDemoMode) {
            console.log("Demo mode: Also updating localStorage");
            
            // Get current mock cars
            const mockCars = getMockCars();
            
            // Create a new car with a unique ID
            const newCar = {
                id: `car-${Date.now()}`,
                ...values,
                year: parseInt(values.year),
                price: parseInt(values.price),
                seller: demoUser?.id || 'demo-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add the new car to the mock cars
            mockCars.push(newCar);
            
            // Update localStorage
            updateMockCars(mockCars);
            
            console.log("Demo mode: Car created in localStorage:", newCar);
        }
        
        message.success("Car created successfully!");
        
        await fetchCars(); // Refetch to include the new car
        setVisible(false);
        form.resetFields();
        
        // Consider focusing the newly created car? Might be complex. Focus first car for now.
        dispatch(resetShouldFocusFirstCar()); // Trigger refocus on first car after fetch
    } catch (err) {
        console.error("Error creating car:", err);
        message.error("Error creating car. Please try again.");
    } finally {
        setLoadingBuy(false);
    }
  };

  // Get image source from external storage
  const getImageSource = (make, model) => {
      try {
        // Basic sanitization
        const safeMake = make?.replace(/[^a-z0-9\s-]/gi, '') || 'default';
        const safeModel = model?.replace(/[^a-z0-9\s-]/gi, '') || 'model';
        return getCarImageUrl(`${safeMake} ${safeModel}`);
      } catch (error) {
         // console.warn(`Image not found for: ${make} ${model}. Using default.`);
          // Use a placeholder image URL instead of requiring a local file
          return 'https://via.placeholder.com/300x200?text=Car+Image+Not+Found';
      }
  };

  // Function to recreate all cars from images
  const recreateCarsFromImages = async () => {
    try {
      setRecreatingCars(true);
      message.loading('Deleting existing cars and recreating from images...', 0);

      // First, delete all existing cars
      const { error: deleteError } = await supabase
        .from('cars')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep some cars if needed

      if (deleteError) {
        console.error('Error deleting cars:', deleteError);
        message.error('Failed to delete existing cars');
        return;
      }

      console.log('All existing cars deleted');

      // Define car data based on images
      const carData = [
        { make: 'Porsche', model: '911 Turbo S', year: 2023, price: 250000, type: 'LEGENDARY' },
        { make: 'Ferrari', model: '488 GTB', year: 2022, price: 320000, type: 'LEGENDARY' },
        { make: 'Audi', model: 'Q8 quattro', year: 2023, price: 85000, type: 'EPIC' },
        { make: 'Hummer', model: 'H1', year: 2021, price: 150000, type: 'RARE' },
        { make: 'Volkswagen', model: 'ID4', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Volkswagen', model: 'Golf GTI', year: 2022, price: 35000, type: 'RARE' },
        { make: 'Toyota', model: 'Tundra', year: 2023, price: 55000, type: 'REGULAR' },
        { make: 'Toyota', model: 'Supra', year: 2023, price: 65000, type: 'EPIC' },
        { make: 'Toyota', model: 'Land Cruiser 300', year: 2023, price: 95000, type: 'EPIC' },
        { make: 'Toyota', model: 'Highlander', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Toyota', model: 'GR Corolla', year: 2023, price: 40000, type: 'RARE' },
        { make: 'Toyota', model: 'Camry', year: 2023, price: 35000, type: 'REGULAR' },
        { make: 'Tesla', model: 'Model X', year: 2023, price: 95000, type: 'EPIC' },
        { make: 'Tesla', model: 'Model 3', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Subaru', model: 'BRZ', year: 2023, price: 35000, type: 'RARE' },
        { make: 'Rivian', model: 'R1T', year: 2023, price: 85000, type: 'EPIC' },
        { make: 'Rivian', model: 'R1S', year: 2023, price: 90000, type: 'EPIC' },
        { make: 'Porsche', model: 'Cayenne', year: 2023, price: 95000, type: 'EPIC' },
        { make: 'Porsche', model: 'Taycan', year: 2023, price: 110000, type: 'LEGENDARY' },
        { make: 'Porsche', model: '911 GT3 RS', year: 2023, price: 280000, type: 'LEGENDARY' },
        { make: 'Porsche', model: '718 Cayman GT4', year: 2023, price: 120000, type: 'EPIC' },
        { make: 'Pagani', model: 'Zonda S', year: 2022, price: 2500000, type: 'LEGENDARY' },
        { make: 'Pagani', model: 'Huayra', year: 2023, price: 3000000, type: 'LEGENDARY' },
        { make: 'Nissan', model: 'GT-R', year: 2023, price: 120000, type: 'EPIC' },
        { make: 'Mitsubishi', model: 'Eclipse Spyder GT', year: 2022, price: 35000, type: 'RARE' },
        { make: 'Mercedes-Benz', model: 'GLC', year: 2023, price: 55000, type: 'REGULAR' },
        { make: 'Mercedes-Benz', model: 'G-class', year: 2023, price: 150000, type: 'EPIC' },
        { make: 'Mercedes-Benz', model: 'EQS', year: 2023, price: 120000, type: 'LEGENDARY' },
        { make: 'Mercedes-Benz', model: 'E-Class', year: 2023, price: 65000, type: 'REGULAR' },
        { make: 'Mercedes-Benz', model: 'AMG SL 63', year: 2023, price: 180000, type: 'LEGENDARY' },
        { make: 'Mercedes-Benz', model: 'AMG GT', year: 2023, price: 160000, type: 'EPIC' },
        { make: 'Mercedes-Benz', model: 'A-Class', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'McLaren', model: 'P1', year: 2022, price: 2000000, type: 'LEGENDARY' },
        { make: 'McLaren', model: 'Artura', year: 2023, price: 250000, type: 'LEGENDARY' },
        { make: 'McLaren', model: '650S', year: 2022, price: 300000, type: 'LEGENDARY' },
        { make: 'Mazda', model: 'MX-5', year: 2023, price: 35000, type: 'RARE' },
        { make: 'Mazda', model: 'CX-90', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Mazda', model: 'CX-5', year: 2023, price: 35000, type: 'REGULAR' },
        { make: 'Lucid', model: 'Air Sapphire', year: 2023, price: 250000, type: 'LEGENDARY' },
        { make: 'Lexus', model: 'NX', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Lexus', model: 'LFA', year: 2022, price: 500000, type: 'LEGENDARY' },
        { make: 'Lexus', model: 'GX', year: 2023, price: 65000, type: 'EPIC' },
        { make: 'Lamborghini', model: 'Urus', year: 2023, price: 250000, type: 'LEGENDARY' },
        { make: 'Lamborghini', model: 'Revuelto', year: 2023, price: 600000, type: 'LEGENDARY' },
        { make: 'Lamborghini', model: 'Huracan', year: 2023, price: 280000, type: 'LEGENDARY' },
        { make: 'Lamborghini', model: 'Centenario', year: 2022, price: 2000000, type: 'LEGENDARY' },
        { make: 'Kia', model: 'Stinger', year: 2023, price: 45000, type: 'RARE' },
        { make: 'Kia', model: 'K5', year: 2023, price: 30000, type: 'REGULAR' },
        { make: 'Kia', model: 'EV9', year: 2023, price: 65000, type: 'EPIC' },
        { make: 'Hummer', model: 'H3', year: 2022, price: 80000, type: 'RARE' },
        { make: 'Hummer', model: 'EV', year: 2023, price: 120000, type: 'EPIC' },
        { make: 'Ford', model: 'Mustang', year: 2023, price: 45000, type: 'RARE' },
        { make: 'Ford', model: 'Focus', year: 2023, price: 25000, type: 'REGULAR' },
        { make: 'Ford', model: 'Focus RS', year: 2022, price: 40000, type: 'RARE' },
        { make: 'Ford', model: 'Explorer', year: 2023, price: 40000, type: 'REGULAR' },
        { make: 'Ford', model: 'Bronco', year: 2023, price: 55000, type: 'EPIC' },
        { make: 'Ferrari', model: 'SF90 Stradale', year: 2023, price: 500000, type: 'LEGENDARY' },
        { make: 'Dodge', model: 'Viper SRT', year: 2022, price: 120000, type: 'EPIC' },
        { make: 'Dodge', model: 'Charger', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Dodge', model: 'Challenger Hellcat', year: 2023, price: 65000, type: 'RARE' },
        { make: 'Chevrolet', model: 'Tahoe', year: 2023, price: 65000, type: 'REGULAR' },
        { make: 'Chevrolet', model: 'Silverado', year: 2023, price: 55000, type: 'REGULAR' },
        { make: 'Chevrolet', model: 'Corvette Z06 C7', year: 2022, price: 120000, type: 'EPIC' },
        { make: 'Chevrolet', model: 'Blazer', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Bentley', model: 'Continental GTC', year: 2023, price: 220000, type: 'LEGENDARY' },
        { make: 'Bentley', model: 'Bentayga', year: 2023, price: 200000, type: 'LEGENDARY' },
        { make: 'BMW', model: 'i4', year: 2023, price: 65000, type: 'EPIC' },
        { make: 'BMW', model: 'X5', year: 2023, price: 75000, type: 'EPIC' },
        { make: 'BMW', model: 'M4 CS', year: 2023, price: 120000, type: 'EPIC' },
        { make: 'BMW', model: '335i', year: 2023, price: 55000, type: 'REGULAR' },
        { make: 'BMW', model: '218i', year: 2023, price: 35000, type: 'REGULAR' },
        { make: 'Audi', model: 'TT RS', year: 2023, price: 75000, type: 'EPIC' },
        { make: 'Audi', model: 'RS E-Tron GT', year: 2023, price: 150000, type: 'LEGENDARY' },
        { make: 'Audi', model: 'A4', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Audi', model: 'A1', year: 2023, price: 30000, type: 'REGULAR' },
        { make: 'Aston Martin', model: 'Vantage', year: 2023, price: 250000, type: 'LEGENDARY' },
        { make: 'Aston Martin', model: 'DBX', year: 2023, price: 200000, type: 'LEGENDARY' },
        { make: 'Aston Martin', model: 'DBS', year: 2023, price: 350000, type: 'LEGENDARY' },
        { make: 'Aston Martin', model: 'DB12', year: 2023, price: 250000, type: 'LEGENDARY' },
        { make: 'Alfa Romeo', model: 'Stelvio', year: 2023, price: 45000, type: 'REGULAR' },
        { make: 'Alfa Romeo', model: 'Giulia', year: 2023, price: 35000, type: 'REGULAR' },
        { make: 'Alfa Romeo', model: '4C', year: 2022, price: 75000, type: 'RARE' }
      ];

      // Insert all cars
      const { data: insertedCars, error: insertError } = await supabase
        .from('cars')
        .insert(carData)
        .select();

      if (insertError) {
        console.error('Error inserting cars:', insertError);
        message.error('Failed to insert new cars');
        return;
      }

      console.log('Successfully inserted cars:', insertedCars.length);
      message.destroy();
      message.success(`Successfully recreated ${insertedCars.length} cars from images!`);
      
      // Refresh the cars list
      await fetchCars();
      
    } catch (error) {
      console.error('Error recreating cars:', error);
      message.error('Failed to recreate cars');
    } finally {
      setRecreatingCars(false);
    }
  };
  
  // Create a dummy setFocusPosition function to prevent errors
  const setFocusPosition = (position) => {
    console.log("setFocusPosition called with:", position);
    // This is a no-op function to prevent errors
  };

  return (
    <>
    <div className="cars" tabIndex="-1"> {/* Make div focusable but not via sequential keyboard nav */}
      {carsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Spin size="large" />
        </div>
      ) : (
        <div className={`cars__container ${isMobile ? 'mobile-vertical' : ''}`}>
          {isMobile ? (
            // --- Mobile Layout ---
            Object.entries(groupCarsByMake(cars)).map(([make, makeCars]) => (
              <div key={make} className="mobile-maker-section">
                <h2 className="mobile-make-title">{make}</h2>
                <div className="mobile-car-grid">
                  {/* 2-column grid for mobile */}
                  {chunkCars(makeCars, 2).map((row, rowIndex) => (
                    <div key={rowIndex} className="mobile-car-row">
                      {row.map((car) => {
                        const globalIndex = cars.findIndex(c => c.id === car.id); // Find index in original sorted list
                        return (
                          <div key={car.id} className="mobile-car-wrapper">
                            <CarCard
                              car={car}
                              isMobile={isMobile}
                              focusedCar={focusedCar}
                              // selectedCar prop might not be needed if details modal handles selection
                              setSelectedCar={setSelectedCar} // Pass original state setter
                              showCarDetailsModal={showCarDetailsModal} // Pass original function
                              getImageSource={getImageSource}
                              showPrice={true}
                              // For mobile, setFocusedCar is enough, no complex row/col needed
                              setFocusedCar={setFocusedCar}
                              // Pass the dummy setFocusPosition function to prevent errors
                              setFocusPosition={setFocusPosition}
                              // Pass index for potential use within CarCard if needed
                              index={globalIndex}
                              // Make card focusable for accessibility/interaction
                              isFocused={focusedCar?.id === car.id}
                              playerInfo={playerInfo}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // --- Desktop Layout ---
            Object.entries(groupCarsByMake(cars)).map(([make, makeCars], makeIndex) => {
              // Ensure makeCars are sorted by model for consistent row assignment
              const sortedMakeCars = [...makeCars].sort((a,b)=>(a.model||"").localeCompare(b.model||""));
              const topRowCars = sortedMakeCars.filter((_, index) => index % 2 === 0);
              const bottomRowCars = sortedMakeCars.filter((_, index) => index % 2 === 1);

              return (
                <div
                    key={make}
                    className={`make-section ${focusedMake === make ? 'make-focused' : ''}`}
                    data-make-index={makeIndex} // Keep for potential future use
                    aria-label={`Manufacturer: ${make}`} // Accessibility
                >
                  {/* Make Title - Acts as a focus target */}
                  <h2
                    className={`make-name ${focusedMake === make ? 'focused' : ''}`}
                    data-make={make} // For querying in useEffect/handleKeyDown
                    tabIndex={-1} // Not sequentially focusable, only via script/Arrow Keys
                    aria-selected={focusedMake === make} // Accessibility state
                    // Click focuses the maker
                    onClick={() => {
                      if (focusedMake !== make) { // Prevent unnecessary state updates
                         setFocusedMake(make);
                         setFocusedCar(null);
                         dispatch(setCurrentFocusedElement(MAKER_ROW));
                         if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound(); // Sound on click focus
                      }
                    }}
                  >
                    {make}
                  </h2>

                  {/* Grid for Cars */}
                  <div className="make-grid">
                    {/* Top Row */}
                    <div className="make-row top-row">
                      {topRowCars.map((car) => {
                          const globalIndex = cars.findIndex(c => c.id === car.id);
                          const isFocused = focusedCar?.id === car.id;
                          return (
                              <CarCard
                                  key={car.id}
                                  car={car}
                                  isMobile={isMobile}
                                  focusedCar={focusedCar} // Pass the currently globally focused car
                                  isFocused={isFocused} // Explicitly pass if this card is the focused one
                                  setSelectedCar={setSelectedCar} // Pass original state setter
                                  showCarDetailsModal={showCarDetailsModal} // Pass original function
                                  getImageSource={getImageSource}
                                  showPrice={true}
                                  setFocusedCar={setFocusedCar} // Allow card to set global focus state
                                  // Pass the dummy setFocusPosition function to prevent errors
                                  setFocusPosition={setFocusPosition}
                                  row={0} // Conceptual row number, maybe useful for styling/debugging
                                  column={allTopRowCars.findIndex(c => c.id === car.id)} // Global column index
                                  index={globalIndex} // Pass global index
                                  playerInfo={playerInfo}
                              />
                         );
                       })}
                    </div>
                    {/* Bottom Row */}
                    <div className="make-row bottom-row">
                      {bottomRowCars.map((car) => {
                        const globalIndex = cars.findIndex(c => c.id === car.id);
                        const isFocused = focusedCar?.id === car.id;
                        return (
                          <CarCard
                            key={car.id}
                            car={car}
                            isMobile={isMobile}
                            focusedCar={focusedCar}
                            isFocused={isFocused}
                            setSelectedCar={setSelectedCar} // Pass original state setter
                            showCarDetailsModal={showCarDetailsModal} // Pass original function
                            getImageSource={getImageSource}
                            showPrice={true}
                            setFocusedCar={setFocusedCar}
                            // Pass the dummy setFocusPosition function to prevent errors
                            setFocusPosition={setFocusPosition}
                            row={1} // Conceptual row number
                            column={allBottomRowCars.findIndex(c => c.id === car.id)}
                            index={globalIndex}
                            playerInfo={playerInfo}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

{/* <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 9999,
        backgroundColor: '#1890ff',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <Button
          type="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVisible(true);
          }}
          style={{ 
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          ➕ Create New Car
        </Button>
      </div> */}


    </div>

      {/* Modals rendered outside the cars container */}
      {/* Create Car Modal */}
      
      {/* Custom Create Car Modal */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setVisible(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
                Create a New Car
              </h2>
              <button
                onClick={() => setVisible(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '24px',
                  height: '24px'
                }}
              >
                ×
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const values = {
                  make: formData.get('make'),
                  model: formData.get('model'),
                  year: formData.get('year'),
                  price: formData.get('price'),
                  type: formData.get('type')
                };
                
                // Simple validation
                if (!values.make || !values.model || !values.year || !values.price || !values.type) {
                  alert('Please fill in all fields');
                  return;
                }
                
                if (!/^(19|20)\d{2}$/.test(values.year)) {
                  alert('Please enter a valid 4-digit year');
                  return;
                }
                
                if (isNaN(values.price) || values.price < 0) {
                  alert('Please enter a valid price');
                  return;
                }
                
                createNewCar(values);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'black', fontWeight: '500' }}>
                  Make *
                </label>
                <input
                  name="make"
                  type="text"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'black', fontWeight: '500' }}>
                  Model *
                </label>
                <input
                  name="model"
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'black', fontWeight: '500' }}>
                  Year *
                </label>
                <input
                  name="year"
                  type="number"
                  required
                  min="1900"
                  max="2030"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'black', fontWeight: '500' }}>
                  Price *
                </label>
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="100"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'black', fontWeight: '500' }}>
                  Type *
                </label>
                <select
                  name="type"
                  required
                  defaultValue="regular"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="regular">Regular</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: 'black',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingBuy}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: loadingBuy ? '#ccc' : '#1890ff',
                    color: 'white',
                    cursor: loadingBuy ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {loadingBuy ? 'Creating...' : 'Create Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Car Details Modal */}
       <CarDetailsModal
         visible={selectedCar && carDetailsVisible}
         handleCancel={handleCarDetailsCancel}
         selectedCar={selectedCar || {}}
         buyCar={buyCar}
         loadingBuy={loadingBuy}
         getImageSource={getImageSource}
         forAuction={false}
       />

      {/* Credit Warning Modal */}
      <CreditWarningModal
        isModalVisible={creditWarningModalvisible}
        setIsModalVisible={setCreditWarningModalvisible}
      />
    </>
  );
};

export default CarsStore;
