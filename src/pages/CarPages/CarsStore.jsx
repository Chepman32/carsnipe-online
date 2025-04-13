import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Form, Input, message, Select, Spin } from "antd";
import { generateClient } from "aws-amplify/api";
import { listCars as listCarsQuery } from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
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

const { Option } = Select;
const client = generateClient();

const CarsStore = ({ playerInfo, setMoney, money }) => {
  const dispatch = useDispatch();
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
          carsContainer.scrollLeft += e.deltaX * 1.5;
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
      const carData = await client.graphql({ query: listCarsQuery });
      console.log("Car data received:", carData);

      // Ensure sorting happens *before* setting state
      const sortedCars = [...carData.data.listCars.items].sort((a, b) => {
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
  }, []); // No dependencies needed if client is stable

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

               // 2b. If in Bottom Row: Move focus to the Header.
               const isBottomRow = allBottomRowCars.some(c => c.id === focusedCar.id);
               if (isBottomRow) {
                  console.log("Going up from bottom row car", focusedCar.model, "to header");
                  dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
                  dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
                  setFocusedCar(null); // Clear car focus
                  setFocusedMake(null); // Clear maker focus
                  if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
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
        await client.graphql({
          query: mutations.updateUser,
          variables: { input: { id: playerInfo.id, money: newMoney } }
        });
        await createNewUserCar(playerInfo.id, car.id); // Ensure this awaits if necessary
        message.success("Car successfully bought!");
        await checkAndUpdateAchievements(playerInfo); // Check achievements after successful purchase
      } catch (err) {
        console.error("Error buying car:", err);
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
        await client.graphql({
          query: mutations.createCar,
          variables: { input: { ...values, year: parseInt(values.year), price: parseInt(values.price) } }
        });
        await fetchCars(); // Refetch to include the new car
        setVisible(false);
        form.resetFields();
        message.success("Car created successfully!");
        // Consider focusing the newly created car? Might be complex. Focus first car for now.
        dispatch(resetShouldFocusFirstCar()); // Trigger refocus on first car after fetch
    } catch (err) {
        console.error("Error creating car:", err);
        message.error("Error creating car. Please try again.");
    } finally {
        setLoadingBuy(false);
    }
  };

  // Memoize image source function generation if performance is critical, though unlikely needed here.
  const getImageSource = (make, model) => {
      try {
        // Basic sanitization
        const safeMake = make?.replace(/[^a-z0-9\s-]/gi, '') || 'default';
        const safeModel = model?.replace(/[^a-z0-9\s-]/gi, '') || 'model';
        return require(`../../assets/images/cars/${safeMake} ${safeModel}.png`);
      } catch (error) {
         // console.warn(`Image not found for: ${make} ${model}. Using default.`);
          // Use a placeholder image URL instead of requiring a local file
          return 'https://via.placeholder.com/300x200?text=Car+Image+Not+Found';
      }
  };

  return (
    // Add focus outline management if needed, e.g., remove outline when mouse-navigating
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
                              // No setFocusPosition needed for simplified mobile layout
                              // Pass index for potential use within CarCard if needed
                              index={globalIndex}
                              // Make card focusable for accessibility/interaction
                              isFocused={focusedCar?.id === car.id}
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
                                  // No need for setFocusPosition, handled by Redux/useEffect
                                  // row={2} // Conceptual row number, maybe useful for styling/debugging
                                  // column={allTopRowCars.findIndex(c => c.id === car.id)} // Global column index
                                  index={globalIndex} // Pass global index
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
                            // row={3} // Conceptual row number
                            // column={allBottomRowCars.findIndex(c => c.id === car.id)}
                            index={globalIndex}
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

        {/* --- Modals --- */}
      {/* Create Car Modal (Admin/Debug tool?) */}
      <Modal
        visible={visible}
        title="Create a New Car"
        okText="Create"
        cancelText="Cancel"
        onCancel={handleCancel}
        confirmLoading={loadingBuy} // Reuse loading state or add specific one
        onOk={() => {
          form.validateFields()
            .then((values) => createNewCar(values))
            .catch((info) => console.log('Validate Failed:', info));
        }}
        destroyOnClose // Reset form state when closed
      >
        <Form
          form={form}
          layout="vertical"
          name="create_car_form"
        >
          <Form.Item
            name="make"
            label="Make"
            rules={[{ required: true, message: "Please enter the make!" }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: "Please enter the model!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
            rules={[
                { required: true, message: "Please enter the year!" },
                { pattern: /^(19|20)\d{2}$/, message: "Please enter a valid 4-digit year" }
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[
                { required: true, message: "Please enter the price!" },
                { type: 'number', min: 0, transform: value => Number(value), message: "Price must be a positive number" }
            ]}
          >
            <Input type="number" min="0" step="100" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select the type!" }]}
            initialValue="regular" // Default value
          >
            <Select>
              <Option value="regular">Regular</Option>
              <Option value="epic">Epic</Option>
              <Option value="legendary">Legendary</Option>
            </Select>
          </Form.Item>
          {/* Add other car attributes here if needed (e.g., stats) */}
        </Form>
      </Modal>

       {/* Car Details Modal */}
       {/* Always render the modal but control visibility with the visible prop */}
       {console.log("Rendering CarDetailsModal section, selectedCar:", selectedCar, "carDetailsVisible:", carDetailsVisible)}
       <CarDetailsModal
         visible={selectedCar && carDetailsVisible} // Only show if we have a selected car and visibility is true
         handleCancel={handleCarDetailsCancel}
         selectedCar={selectedCar || {}} // Provide empty object as fallback
         buyCar={buyCar} // Pass buyCar function
         loadingBuy={loadingBuy}
         getImageSource={getImageSource} // Pass image source function
         forAuction={false} // Explicitly set forAuction to false for the store context
       />

      {/* Credit Warning Modal */}
      <CreditWarningModal
        isModalVisible={creditWarningModalvisible}
        setIsModalVisible={setCreditWarningModalvisible}
        // Pass other props if needed by CreditWarningModal
      />
    </div>
  );
};

export default CarsStore;
