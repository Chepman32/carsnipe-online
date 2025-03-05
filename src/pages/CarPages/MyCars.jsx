import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, message, Typography, Spin } from "antd";
import { generateClient } from "aws-amplify/api";
import { listCars as listCarsQuery } from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
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

const client = generateClient();

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

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement } = useSelector((state) => state.focus);

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const scroller = useRef(null);

  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

  const groupCarsByMake = (cars) => {
    const groups = cars.reduce((acc, item) => {
      const make = item?.car?.make?.trim().toUpperCase() || "UNKNOWN";
      if (!acc[make]) acc[make] = [];
      acc[make].push(item.car);
      return acc;
    }, {});
    return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
  };

  useEffect(() => {
    const carsContainer = scroller.current;
    if (carsContainer) {
      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          carsContainer.scrollLeft -= e.deltaY * 1.5;
        }
      };
      carsContainer.addEventListener("wheel", handleWheel, { passive: false });
      return () => carsContainer.removeEventListener("wheel", handleWheel);
    }
  }, []);

  useEffect(() => {
    if (cars.length > 0) {
      const topRowCars = [];
      const bottomRowCars = [];
      Object.entries(groupCarsByMake(cars)).forEach(([make, makeCars]) => {
        makeCars.forEach((car, index) => {
          if (index % 2 === 0) topRowCars.push(car);
          else bottomRowCars.push(car);
        });
      });
      setAllTopRowCars(topRowCars);
      setAllBottomRowCars(bottomRowCars);
    }
  }, [cars]);

  useEffect(() => {
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (focusedZone !== FOCUS_ZONES.HEADER) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [dispatch]);

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.HEADER) {
      setSelectedCarIndex(null);
      setFocusedMake(null);
      setFocusedCar(null);
    }
  }, [focusedZone]);

  useEffect(() => {
    if (focusedCar) {
      const element = document.querySelector(`[data-car-id="${focusedCar.id}"]`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedCar]);

  useEffect(() => {
    if (cars.length > 0 && !focusedCar) {
      setFocusedCar(cars[0].car);
    }
  }, [cars]);

  const fetchUserCars = useCallback(async () => {
    try {
      setLoading(true);
      const userCars = await fetchUserCarsRequest(playerInfo.id);
      setCars(userCars || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  }, [playerInfo.id]);

  useEffect(() => {
    fetchUserCars();
  }, [fetchUserCars, loadingNewAuction]);

  const showCarDetailsModal = useCallback(() => setCarDetailsVisible(true), []);

  const handleKeyDown = (event) => {
    const { key } = event;
    if (carDetailsVisible || newAuctionVisible || focusedZone === FOCUS_ZONES.HEADER) return;

    const carsByMake = groupCarsByMake(cars);
    const makes = Object.keys(carsByMake);

    if (isMobile) {
      const allCarsFlat = cars
        .map((item) => item.car)
        .sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
      const currentIndex = focusedCar ? allCarsFlat.findIndex((c) => c.id === focusedCar.id) : -1;

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

        case "ArrowUp":
          event.preventDefault();
          dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
          dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
          setFocusedCar(null);
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          break;

        case "Enter":
          if (focusedCar) {
            setSelectedCar(focusedCar);
            setSelectedCarIndex(allCarsFlat.findIndex((c) => c.id === focusedCar.id));
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

          const currentArray = allTopRowCars.includes(focusedCar) ? allTopRowCars : allBottomRowCars;
          const currentIndex = currentArray.indexOf(focusedCar);
          if (currentIndex < currentArray.length - 1) {
            setFocusedCar(currentArray[currentIndex + 1]);
            setSelectedCarIndex(cars.findIndex((c) => c.car.id === currentArray[currentIndex + 1].id));
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

          const currentArray = allTopRowCars.includes(focusedCar) ? allTopRowCars : allBottomRowCars;
          const currentIndex = currentArray.indexOf(focusedCar);
          if (currentIndex > 0) {
            setFocusedCar(currentArray[currentIndex - 1]);
            setSelectedCarIndex(cars.findIndex((c) => c.car.id === currentArray[currentIndex - 1].id));
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;
        }

        case "ArrowDown": {
          event.preventDefault();
          if (focusedMake) {
            const makeCars = carsByMake[focusedMake]?.filter((_, i) => i % 2 === 0);
            if (makeCars?.length) {
              setFocusedCar(makeCars[0]);
              setFocusedMake(null);
              setSelectedCarIndex(cars.findIndex((c) => c.car.id === makeCars[0].id));
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentMake = focusedCar?.make?.trim().toUpperCase();
          const makeCars = carsByMake[currentMake] || [];
          const topRowIndex = makeCars
            .filter((_, i) => i % 2 === 0)
            .findIndex((c) => c.id === focusedCar.id);
          if (topRowIndex !== -1) {
            const bottomCar = makeCars.filter((_, i) => i % 2 === 1)[topRowIndex];
            if (bottomCar) {
              setFocusedCar(bottomCar);
              setSelectedCarIndex(cars.findIndex((c) => c.car.id === bottomCar.id));
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
          const bottomRowIndex = makeCars
            .filter((_, i) => i % 2 === 1)
            .findIndex((c) => c.id === focusedCar.id);
          if (bottomRowIndex !== -1) {
            const topCar = makeCars.filter((_, i) => i % 2 === 0)[bottomRowIndex];
            if (topCar) {
              setFocusedCar(topCar);
              setSelectedCarIndex(cars.findIndex((c) => c.car.id === topCar.id));
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
            setSelectedCarIndex(cars.findIndex((c) => c.car.id === focusedCar.id));
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
      player: playerInfo?.nickname,
      buy: selectedCar.price,
      minBid,
    };

    try {
      setLoadingNewAuction(true);
      const result = await client.graphql({
        query: mutations.createAuction,
        variables: { input: newAuction },
      });

      const createdAuctionId = result?.data?.createAuction?.id;
      if (createdAuctionId) {
        await createNewAuctionUser(playerInfo.id, createdAuctionId);
        const carToDelete = await getUserCar(playerInfo.id, selectedCar.id);
        if (carToDelete && carToDelete.id) {
          await deleteUserCar(carToDelete.id);
        } else {
          throw new Error("Car not found or invalid ID for deletion");
        }
        if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
        message.success("Auction created successfully!");
      } else {
        throw new Error("Failed to retrieve the ID of the created auction.");
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
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
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
      const carToDelete = await getUserCar(playerInfo.id, carId);
      if (carToDelete && carToDelete.id) {
        await deleteUserCar(carToDelete.id);
        setCars((prevCars) => prevCars.filter((c) => c.car.id !== carId));
        setSelectedCar(null);
        setCarDetailsVisible(false);
        message.success(permanent ? "Car permanently removed!" : "Car removed from garage!");
      } else {
        throw new Error("Car not found or invalid ID for deletion");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      message.error("Failed to remove car.");
    }
  };

  return (
    <div className={`cars ${isMobile ? "mobile-vertical" : ""}`} ref={scroller}>
      {loading ? (
        <Spin size="large" />
      ) : cars && cars.length ? (
        <div className="cars__container">
          {isMobile ? (
            Object.entries(groupCarsByMake(cars)).map(([make, makeCars]) => (
              <div key={make} className="mobile-maker-section">
                <h2 className="mobile-make-title">{make}</h2>
                <div className="mobile-car-grid">
                  {chunkCars(makeCars, 2).map((row, rowIndex) => (
                    <div key={rowIndex} className="mobile-car-row">
                      {row.map((car) => {
                        const realIndex = cars.findIndex((c) => c.car.id === car.id);
                        return (
                          <div key={car.id} className="mobile-car-wrapper">
                            <CarCard
                              car={car}
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
            Object.entries(groupCarsByMake(cars)).map(([make, makeCars], makeIndex) => {
              const topRowCars = [];
              const bottomRowCars = [];
              makeCars.forEach((car, index) => {
                if (index % 2 === 0) topRowCars.push(car);
                else bottomRowCars.push(car);
              });

              return (
                <div
                  key={make}
                  className="make-section"
                  data-make-index={makeIndex}
                  data-focused={focusedMake === make}
                >
                  <h2 className="make-name" data-make={make}>
                    {make}
                  </h2>
                  <div className="make-grid">
                    <div className="make-row">
                      {topRowCars.map((car) => {
                        const realIndex = cars.findIndex((c) => c.car.id === car.id);
                        return (
                          <CarCard
                            key={car.id}
                            focusedCar={focusedCar}
                            selectedCar={realIndex === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(realIndex);
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            car={car}
                            getImageSource={getImageSource}
                            showPrice={false}
                            setFocusedCar={setFocusedCar}
                            cars={cars.map((c) => c.car)}
                            setFocusPosition={() => {}}
                            column={allTopRowCars.indexOf(car)}
                            row={2}
                          />
                        );
                      })}
                    </div>
                    <div className="make-row">
                      {bottomRowCars.map((car) => {
                        const realIndex = cars.findIndex((c) => c.car.id === car.id);
                        return (
                          <CarCard
                            key={car.id}
                            focusedCar={focusedCar}
                            selectedCar={realIndex === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(realIndex);
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            car={car}
                            getImageSource={getImageSource}
                            showPrice={false}
                            setFocusedCar={setFocusedCar}
                            cars={cars.map((c) => c.car)}
                            setFocusPosition={() => {}}
                            column={allBottomRowCars.indexOf(car)}
                            row={3}
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
          handleCarDetailsCancel();
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          setNewAuctionVisible(true);
        }}
        removeCar={removeCar}
      />
      {newAuctionVisible && selectedCar && (
        <NewAuctionModal
          visible={newAuctionVisible}
          handleCancel={cancelNewAuction}
          handleOk={createNewAuction}
          form={form}
          minBid={minBid}
          setMinBid={setMinBid}
          buy={buy}
          setBuy={setBuy}
          auctionDuration={auctionDuration}
          setAuctionDuration={setAuctionDuration}
          userCars={cars}
          setSelectedCar={setSelectedCar}
          selectedCar={selectedCar}
        />
      )}
    </div>
  );
};

export default MyCars;