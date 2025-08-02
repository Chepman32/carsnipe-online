import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, message, Typography, Spin } from "antd";
import { supabase } from "../../supabase";
import "./carsPage.css";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import {
  fetchUserCarsRequest,
  getUserCar,
  deleteUserCar,
  createNewAuctionUser,
  playSwitchSound,
  playOpeningSound,
  playClosingSound,
} from "../../functions";
import NewAuctionModal from "./NewAuctionModal";
import { useSelector, useDispatch } from "react-redux";
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  setCurrentFocusedElement,
  setFocusedZone,
  setIsTopCar,
  TOP_CAR,
} from "../../redux/slices/focusSlice";
import { useDemoMode } from "../../contexts/DemoModeContext";
import { getMockCars, updateMockCars } from "../../mockData";
import { getCarImageUrl } from "../../config/assets";

// Supabase client configured in ../../supabase.js

const MyCars = ({ playerInfo }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAuctionVisible, setNewAuctionVisible] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState(1);
  const [minBid, setMinBid] = useState(0);
  const [buy, setBuy] = useState(0);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingNewAuction, setLoadingNewAuction] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [focusedCar, setFocusedCar] = useState(null);
  const [focusedMake, setFocusedMake] = useState(null);
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [allTopRowCars, setAllTopRowCars] = useState([]);
  const [allBottomRowCars, setAllBottomRowCars] = useState([]);

  const { isDemoMode, demoUser, updateDemoUser } = useDemoMode();
  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement } = useSelector((state) => state.focus);

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const scroller = useRef(null);

  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

  const groupCarsByMake = useCallback((cars) => {
    const groups = cars
      .filter(item => item && (item.car || item)) // Filter out null/undefined items
      .reduce((acc, item) => {
        // Handle both structures: item.car or direct car object
        const car = item.car || item;
        if (!car || !car.id) return acc; // Skip cars without valid id
        
        const make = car?.make?.trim().toUpperCase() || "UNKNOWN";
        
        if (!acc[make]) acc[make] = [];
        acc[make].push(car);
        return acc;
      }, {});
    return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
  }, []);

  useEffect(() => {
    const carsContainer = scroller.current;
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
      carsContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => carsContainer.removeEventListener('wheel', handleWheel);
    }
  }, []);

  useEffect(() => {
    if (!loading && cars && cars.length > 0) {
      const topRowCars = [];
      const bottomRowCars = [];
      Object.entries(groupCarsByMake(cars)).forEach(([make, makeCars]) => {
        // Ensure consistent sorting within each make before assigning to rows
        const sortedMakeCars = [...makeCars].sort((a, b) =>
          (a.model || "").localeCompare(b.model || "")
        );
        sortedMakeCars.forEach((car, index) => {
          if (car && car.id) { // Additional null check
            if (index % 2 === 0) topRowCars.push(car);
            else bottomRowCars.push(car);
          }
        });
      });
      setAllTopRowCars(topRowCars);
      setAllBottomRowCars(bottomRowCars);
    } else if (loading) {
      // Reset rows when loading
      setAllTopRowCars([]);
      setAllBottomRowCars([]);
    }
  }, [cars, groupCarsByMake, loading]);

  useEffect(() => {
    if (!loading) {
      dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
      if (focusedZone !== FOCUS_ZONES.HEADER) {
        dispatch(setCurrentFocusedElement(TOP_CAR));
      }
    }
  }, [dispatch, focusedZone, loading]);

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.HEADER) {
      setSelectedCarIndex(null);
      setFocusedMake(null);
      setFocusedCar(null);
    }
  }, [focusedZone, setSelectedCarIndex, setFocusedMake, setFocusedCar]);

  // Reset focus states when loading starts
  useEffect(() => {
    if (loading) {
      setFocusedCar(null);
      setFocusedMake(null);
      setSelectedCarIndex(null);
    }
  }, [loading]);

  useEffect(() => {
    if (focusedCar && focusedCar.id) {
      const element = document.querySelector(`[data-car-id="${focusedCar.id}"]`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedCar]);

  useEffect(() => {
    if (!loading && cars && cars.length > 0 && !focusedCar && cars[0] && cars[0].car && cars[0].car.id) {
      setFocusedCar(cars[0].car);
    }
  }, [cars, focusedCar, loading]);

  const fetchUserCars = useCallback(async () => {
    try {
      setLoading(true);
      
      // Early return if playerInfo is not available yet
      if (!isDemoMode && !playerInfo) {
        console.log("No playerInfo available yet, skipping fetch");
        setLoading(false);
        return;
      }
      
      if (isDemoMode) {
        console.log("Demo mode: Fetching user cars from localStorage");
        
        // Get user cars from localStorage
        const demoUserCars = JSON.parse(localStorage.getItem('demoUserCars') || '[]');
        
        if (demoUserCars && demoUserCars.length > 0) {
          console.log("Found user cars in localStorage:", demoUserCars.length);
          
          // Format the cars to match the expected structure
          const formattedCars = demoUserCars.map(userCar => {
            // Handle the structure from CarsStore.jsx buyCar function
            if (userCar.car) {
              return {
                id: userCar.id,
                userId: userCar.userId,
                carId: userCar.carId,
                car: userCar.car
              };
            }
            
            // Handle legacy structure or fallback
            return {
              id: userCar.id || `user-car-${Date.now()}`,
              userId: userCar.userId,
              carId: userCar.carId,
              car: userCar.car || {
                id: userCar.carId,
                make: userCar.make,
                model: userCar.model,
                year: userCar.year,
                type: userCar.type || 'COMMON',
                price: userCar.price
              }
            };
          });
          
          console.log("Formatted cars for demo mode:", formattedCars);
          setCars(formattedCars);
        } else {
          console.log("No user cars found in localStorage");
          
          // Try to fetch from backend as fallback
          try {
            if (demoUser && demoUser.id) {
              const userCars = await fetchUserCarsRequest(demoUser.id);
              if (userCars && userCars.length > 0) {
                console.log("Found user cars in backend:", userCars.length);
                
                // Save to localStorage for future use
                localStorage.setItem('demoUserCars', JSON.stringify(userCars));
                setCars(userCars);
              } else {
                console.log("No user cars found in backend either");
                setCars([]);
              }
            } else {
              console.log("No demo user ID available");
              setCars([]);
            }
          } catch (backendError) {
            console.warn("Error fetching user cars from backend:", backendError);
            setCars([]);
          }
        }
      } else {
        // Normal mode - fetch from API
        const userCars = await fetchUserCarsRequest(playerInfo?.id);
        setCars(userCars || []);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [playerInfo, isDemoMode, demoUser, loadingNewAuction]);

  useEffect(() => {
    console.log("Fetching user cars...");
    fetchUserCars();
  }, [fetchUserCars, loadingNewAuction]);
  
  // Debug: Log cars state when it changes
  useEffect(() => {
    console.log("Cars state updated:", cars.length, "cars");
    if (cars.length > 0) {
      console.log("First car:", cars[0]);
    }
  }, [cars]);

  const showCarDetailsModal = useCallback(() => setCarDetailsVisible(true), []);
  
  // Create a dummy setFocusPosition function to prevent errors
  const setFocusPosition = (position) => {
    console.log("setFocusPosition called with:", position);
    // This is a no-op function to prevent errors
  };

  const handleKeyDown = (event) => {
    const { key } = event;
    if (loading || carDetailsVisible || newAuctionVisible || focusedZone === FOCUS_ZONES.HEADER) return;
    if (!cars || cars.length === 0) return; // Don't handle keys if no cars loaded

    const carsByMake = groupCarsByMake(cars);
    const makes = Object.keys(carsByMake);

    if (isMobile) {
      const allCarsFlat = cars
        .map((item) => item.car)
        .filter(car => car && car.id) // Filter out null/undefined cars
        .sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
      const currentIndex = focusedCar && focusedCar.id ? allCarsFlat.findIndex((c) => c.id === focusedCar.id) : -1;

      switch (key) {
        case "ArrowRight":
          event.preventDefault();
          if (currentIndex < allCarsFlat.length - 1) {
            setFocusedCar(allCarsFlat[currentIndex + 1]);
            setSelectedCarIndex(currentIndex + 1);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "ArrowLeft":
          event.preventDefault();
          if (currentIndex > 0) {
            setFocusedCar(allCarsFlat[currentIndex - 1]);
            setSelectedCarIndex(currentIndex - 1);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          // Move 2 positions forward (to the item below in the grid)
          if (currentIndex + 2 < allCarsFlat.length) {
            setFocusedCar(allCarsFlat[currentIndex + 2]);
            setSelectedCarIndex(currentIndex + 2);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "ArrowUp":
          // If we're in the first row, go to header
          if (currentIndex < 2) {
            event.preventDefault();
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
            setFocusedCar(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          // Otherwise move 2 positions backward (to the item above in the grid)
          else if (currentIndex >= 2) {
            event.preventDefault();
            setFocusedCar(allCarsFlat[currentIndex - 2]);
            setSelectedCarIndex(currentIndex - 2);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;

        case "Enter":
          if (focusedCar) {
            setSelectedCar(focusedCar);
            setSelectedCarIndex(focusedCar ? allCarsFlat.findIndex((c) => c.id === focusedCar.id) : -1);
            showCarDetailsModal();
            if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
          }
          break;
      }
    } else {
      switch (key) {
        case "ArrowRight": {
          event.preventDefault();
          if (focusedMake) {
            const currentIndex = makes.indexOf(focusedMake);
            if (currentIndex < makes.length - 1) {
              const nextMake = makes[currentIndex + 1];
              setFocusedMake(nextMake);
              document
                .querySelector(`[data-make="${nextMake}"]`)
                ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentArray = (focusedCar && allTopRowCars.includes(focusedCar)) ? allTopRowCars : allBottomRowCars;
          const currentIndex = focusedCar ? currentArray.indexOf(focusedCar) : -1;
          if (currentIndex !== -1 && currentIndex < currentArray.length - 1 && currentArray[currentIndex + 1]) {
            const nextCar = currentArray[currentIndex + 1];
            setFocusedCar(nextCar);
            setSelectedCarIndex(nextCar ? cars.findIndex((c) => c.car && c.car.id === nextCar.id) : -1);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;
        }

        case "ArrowLeft": {
          event.preventDefault();
          if (focusedMake) {
            const currentIndex = makes.indexOf(focusedMake);
            if (currentIndex > 0) {
              const prevMake = makes[currentIndex - 1];
              setFocusedMake(prevMake);
              document
                .querySelector(`[data-make="${prevMake}"]`)
                ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentArray = (focusedCar && allTopRowCars.includes(focusedCar)) ? allTopRowCars : allBottomRowCars;
          const currentIndex = focusedCar ? currentArray.indexOf(focusedCar) : -1;
          if (currentIndex > 0 && currentArray[currentIndex - 1]) {
            const prevCar = currentArray[currentIndex - 1];
            setFocusedCar(prevCar);
            setSelectedCarIndex(prevCar ? cars.findIndex((c) => c.car && c.car.id === prevCar.id) : -1);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;
        }

        case "ArrowDown": {
          event.preventDefault();
          if (focusedMake) {
            const makeCars = carsByMake[focusedMake]?.filter((_, i) => i % 2 === 0);
            if (makeCars?.length && makeCars[0]) {
              const firstCar = makeCars[0];
              setFocusedCar(firstCar);
              setFocusedMake(null);
              setSelectedCarIndex(firstCar ? cars.findIndex((c) => c.car && c.car.id === firstCar.id) : -1);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentMake = focusedCar?.make?.trim().toUpperCase();
          const makeCars = carsByMake[currentMake] || [];
          const topRowIndex = focusedCar ? makeCars
            .filter((_, i) => i % 2 === 0)
            .findIndex((c) => c.id === focusedCar.id) : -1;
          if (topRowIndex !== -1) {
            const bottomCar = makeCars.filter((_, i) => i % 2 === 1)[topRowIndex];
            if (bottomCar) {
              setFocusedCar(bottomCar);
              setSelectedCarIndex(bottomCar ? cars.findIndex((c) => c.car.id === bottomCar.id) : -1);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
          }
          break;
        }

        case "ArrowUp": {
          event.preventDefault();
          if (focusedMake) {
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
            setFocusedMake(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            return;
          }

          const currentMake = focusedCar?.make?.trim().toUpperCase();
          const makeCars = carsByMake[currentMake] || [];
          const bottomRowIndex = focusedCar ? makeCars
            .filter((_, i) => i % 2 === 1)
            .findIndex((c) => c.id === focusedCar.id) : -1;
          if (bottomRowIndex !== -1) {
            const topCar = makeCars.filter((_, i) => i % 2 === 0)[bottomRowIndex];
            if (topCar) {
              setFocusedCar(topCar);
              setSelectedCarIndex(topCar ? cars.findIndex((c) => c.car.id === topCar.id) : -1);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
          } else {
            setFocusedMake(currentMake);
            setFocusedCar(null);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;
        }

        case "Enter": {
          if (focusedCar) {
            setSelectedCar(focusedCar);
            setSelectedCarIndex(focusedCar ? cars.findIndex((c) => c.car.id === focusedCar.id) : -1);
            showCarDetailsModal();
            if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
          }
          break;
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    loading,
    cars,
    focusedCar,
    focusedMake,
    carDetailsVisible,
    newAuctionVisible,
    focusedZone,
    soundEffectsOn,
    soundEffectsOnQuickSettings,
    dispatch,
    isMobile,
    allTopRowCars,
    allBottomRowCars,
  ]);

  const createNewAuction = async () => {
    const auctionDurationSeconds = auctionDuration * 60 * 60;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const endTime = currentTimeInSeconds + auctionDurationSeconds;
    const newAuction = {
      make: selectedCar.make,
      model: selectedCar.model,
      year: selectedCar.year,
      type: selectedCar.type,
      carId: selectedCar.id,
      endTime,
      status: "Active",
      lastBidPlayer: "",
      player: isDemoMode ? demoUser?.nickname || "Demo User" : playerInfo?.nickname,
      buy: selectedCar.price,
      minBid,
    };

    try {
      setLoadingNewAuction(true);
      
      if (isDemoMode) {
        console.log("Demo mode: Auction creation not allowed");
        message.warning("Please sign in to create auctions. Demo mode is for viewing only.");
        return;
      } else {
        // Normal mode - use Supabase API
        const { data: createdAuction, error } = await supabase
          .from('auctions')
          .insert([{
            make: newAuction.make,
            model: newAuction.model,
            year: newAuction.year,
            car_id: newAuction.carId,
            current_bid: newAuction.currentBid,
            end_time: newAuction.endTime,
            status: newAuction.status,
            player: newAuction.player,
            buy: newAuction.buy,
            min_bid: newAuction.minBid,
            type: newAuction.type,
            bids_count: 0
          }])
          .select()
          .single();

        if (error) throw error;

        const createdAuctionId = createdAuction?.id;
        if (createdAuctionId) {
          await createNewAuctionUser(playerInfo?.id, createdAuctionId);
          const carToDelete = await getUserCar(playerInfo?.id, selectedCar.id);
          if (carToDelete && carToDelete.id) {
            await deleteUserCar(carToDelete.id, playerInfo?.id);
          } else {
            throw new Error("Car not found or invalid ID for deletion");
          }
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          message.success("Auction created successfully!");
        } else {
          throw new Error("Failed to retrieve the ID of the created auction.");
        }
      }
    } catch (error) {
      console.error("Error creating auction:", error);
      message.error("Failed to create auction.");
    } finally {
      setLoadingNewAuction(false);
      setNewAuctionVisible(false);
      setSelectedCarIndex((prev) => (cars.length > prev ? prev - 1 : 0));
    }
  };

  const cancelNewAuction = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setNewAuctionVisible(false);
  };

  const handleCarDetailsCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setCarDetailsVisible(false);
  };

  const getImageSource = (make, model) => {
    try {
      // Basic sanitization
      const safeMake = make?.replace(/[^a-z0-9\s-]/gi, '') || 'default';
      const safeModel = model?.replace(/[^a-z0-9\s-]/gi, '') || 'model';
      return getCarImageUrl(`${safeMake} ${safeModel}`);
    } catch (error) {
      console.warn(`Image not found for: ${make} ${model}. Using default.`);
      // Use a placeholder image URL instead of requiring a local file
      return 'https://via.placeholder.com/300x200?text=Car+Image+Not+Found';
    }
  };

  const chunkCars = (cars, size) => {
    const chunks = [];
    for (let i = 0; i < cars.length; i += size) {
      chunks.push(cars.slice(i, i + size));
    }
    return chunks;
  };

  const removeCar = async (carId, permanent = false) => {
    try {
      if (isDemoMode) {
        console.log("Demo mode: Removing car", carId);
        
        // In demo mode, remove the car from demoUserCars in localStorage
        const demoUserCars = JSON.parse(localStorage.getItem('demoUserCars') || '[]');
        
        // Filter out the car to be removed
        const updatedDemoUserCars = demoUserCars.filter(userCar => {
          // Handle both possible structures
          const carIdToCheck = userCar.carId || (userCar.car && userCar.car.id);
          return carIdToCheck !== carId;
        });
        
        // Save the updated cars back to localStorage
        localStorage.setItem('demoUserCars', JSON.stringify(updatedDemoUserCars));
        console.log("Demo mode: Car removed from localStorage, remaining cars:", updatedDemoUserCars.length);
        
        // Try to remove from backend as well if possible
        try {
          if (demoUser && demoUser.id) {
            const carToDelete = await getUserCar(demoUser.id, carId);
            if (carToDelete && carToDelete.id) {
              await deleteUserCar(carToDelete.id, demoUser.id);
              console.log("Demo mode: Car also removed from backend");
            }
          }
        } catch (backendError) {
          console.warn("Could not remove car from backend in demo mode:", backendError);
          // Continue with local removal even if backend fails
        }
        
        // Update the UI
        setCars((prevCars) => {
          console.log("Filtering cars, before:", prevCars.length);
          const filteredCars = prevCars.filter((c) => {
            // Handle both possible structures
            const carIdToCheck = c.carId || (c.car && c.car.id);
            const result = carIdToCheck !== carId;
            if (!result) {
              console.log("Removing car from UI:", c);
            }
            return result;
          });
          console.log("After filtering:", filteredCars.length);
          return filteredCars;
        });
        
        setSelectedCar(null);
        setCarDetailsVisible(false);
        message.success(permanent ? "Car permanently removed!" : "Car removed from garage!");
      } else {
        // Normal mode - use API
        const carToDelete = await getUserCar(playerInfo?.id, carId);
        if (carToDelete && carToDelete.id) {
          await deleteUserCar(carToDelete.id, playerInfo?.id);
          setCars((prevCars) => prevCars.filter((c) => c.car.id !== carId));
          setSelectedCar(null);
          setCarDetailsVisible(false);
          message.success(permanent ? "Car permanently removed!" : "Car removed from garage!");
        } else {
          throw new Error("Car not found or invalid ID for deletion");
        }
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      message.error("Failed to remove car.");
    }
  };

  return (
    <div className="cars" tabIndex="-1" ref={scroller}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spin size="large" />
        </div>
      ) : cars && cars.length ? (
        <div className={`cars__container ${isMobile ? "mobile-vertical" : ""}`}>
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
                        const realIndex = cars.findIndex((c) => c.car && c.car.id === car.id);
                        return (
                          <div key={car.id} className="mobile-car-wrapper">
                            <CarCard
                              car={car}
                              isMobile={isMobile}
                              focusedCar={focusedCar}
                              selectedCar={realIndex === selectedCarIndex ? car : null}
                              setSelectedCar={(selectedCar) => {
                                setSelectedCar(selectedCar);
                                setSelectedCarIndex(realIndex);
                                showCarDetailsModal();
                              }}
                              showCarDetailsModal={showCarDetailsModal}
                              getImageSource={getImageSource}
                              showPrice={false}
                              setFocusedCar={setFocusedCar}
                              cars={cars.map((c) => c.car)}
                              setFocusPosition={() => {}}
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
                  data-make-index={makeIndex}
                  aria-label={`Manufacturer: ${make}`}
                >
                  {/* Make Title - Acts as a focus target */}
                  <h2
                    className={`make-name ${focusedMake === make ? 'focused' : ''}`}
                    data-make={make}
                    tabIndex={-1}
                    aria-selected={focusedMake === make}
                    onClick={() => {
                      if (focusedMake !== make) {
                        setFocusedMake(make);
                        setFocusedCar(null);
                        if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
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
                        const realIndex = cars.findIndex((c) => c.car && c.car.id === car.id);
                        const isFocused = focusedCar?.id === car.id;
                        return (
                          <CarCard
                            key={car.id}
                            car={car}
                            isMobile={isMobile}
                            focusedCar={focusedCar}
                            isFocused={isFocused}
                            selectedCar={realIndex === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(realIndex);
                              setFocusedCar(selectedCar);
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            getImageSource={getImageSource}
                            showPrice={false}
                            setFocusedCar={setFocusedCar}
                            setFocusPosition={setFocusPosition}
                            row={0}
                            column={allTopRowCars.findIndex(c => c && c.id === car.id)}
                            index={realIndex}
                            playerInfo={playerInfo}
                          />
                        );
                      })}
                    </div>
                    {/* Bottom Row */}
                    <div className="make-row bottom-row">
                      {bottomRowCars.map((car) => {
                        const realIndex = cars.findIndex((c) => c.car && c.car.id === car.id);
                        const isFocused = focusedCar?.id === car.id;
                        return (
                          <CarCard
                            key={car.id}
                            car={car}
                            isMobile={isMobile}
                            focusedCar={focusedCar}
                            isFocused={isFocused}
                            selectedCar={realIndex === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(realIndex);
                              setFocusedCar(selectedCar);
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            getImageSource={getImageSource}
                            showPrice={false}
                            setFocusedCar={setFocusedCar}
                            setFocusPosition={setFocusPosition}
                            row={1}
                            column={allBottomRowCars.findIndex(c => c && c.id === car.id)}
                            index={realIndex}
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
      ) : (
        <Typography.Title>You have no cars</Typography.Title>
      )}
      <CarDetailsModal
        visible={carDetailsVisible && selectedCar !== null}
        handleCancel={handleCarDetailsCancel}
        setSelectedCar={(car) => setSelectedCar(car)}
        selectedCar={selectedCar}
        loadingNewAuction={loadingNewAuction}
        forAuction
        showNewAuction={() => {
          if (isDemoMode) {
            message.warning("Please sign in to create auctions. Demo mode is for viewing only.");
            return;
          }
          handleCarDetailsCancel();
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          console.log("Setting newAuctionVisible to true");
          setNewAuctionVisible(true);
          console.log("newAuctionVisible set to true, selectedCar:", selectedCar);
        }}
        removeCar={removeCar}
      />
      {/* Render NewAuctionModal unconditionally, control visibility with open prop */}
      <div style={{ display: 'none' }}>Logging state: {JSON.stringify({ newAuctionVisible, selectedCar: selectedCar ? true : false })}</div>
      {console.log("Rendering NewAuctionModal condition:", { newAuctionVisible, selectedCar: selectedCar ? true : false })}
      {selectedCar && (
        <NewAuctionModal
          open={newAuctionVisible}
          handleCancel={cancelNewAuction}
          handleOk={createNewAuction}
          form={form}
          minBid={minBid}
          setMinBid={setMinBid}
          buy={buy}
          setBuy={setBuy}
          auctionDuration={auctionDuration}
          setAuctionDuration={setAuctionDuration}
          userCars={cars} // Pass userCars if needed, or adjust based on modal's requirements
          setSelectedCar={setSelectedCar} // Pass if needed
          selectedCar={selectedCar} // Pass selectedCar
        />
      )}
    </div>
  );
};

export default MyCars;
