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
  playSwitchSound,
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
  TOP_CAR
} from "../../redux/slices/focusSlice";

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
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [allTopRowCars, setAllTopRowCars] = useState([]);
  const [allBottomRowCars, setAllBottomRowCars] = useState([]);

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement } = useSelector((state) => state.focus);

  useEffect(() => {
    const carsContainer = document.querySelector('.cars');
    if (carsContainer) {
      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          carsContainer.scrollLeft -= e.deltaY * 1.5;
        }
      };
      carsContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => carsContainer.removeEventListener('wheel', handleWheel);
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
    }
  }, [focusedZone]);

  useEffect(() => {
    if (focusedCar) {
      const element = document.querySelector(`[data-car-id="${focusedCar.id}"]`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedCar]);

  const showCarDetailsModal = useCallback(() => setCarDetailsVisible(true), []);

  const fetchCars = useCallback(async () => {
    try {
      const carData = await client.graphql({ query: listCarsQuery });
      const sortedCars = carData.data.listCars.items.sort((a, b) => 
        `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
      setCars(sortedCars);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setCarsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCars() }, [fetchCars]);

  const groupCarsByMake = (cars) => {
    const groups = cars.reduce((acc, car) => {
      const make = car.make?.trim().toUpperCase() || "UNKNOWN";
      if (!acc[make]) acc[make] = [];
      acc[make].push(car);
      return acc;
    }, {});
    return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      if (carDetailsVisible || focusedZone === FOCUS_ZONES.HEADER) return;

      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake);

      switch (key) {
        case "ArrowRight": {
          event.preventDefault();
          if (focusedMake) {
            const currentIndex = makes.indexOf(focusedMake);
            if (currentIndex < makes.length - 1) {
              const nextMake = makes[currentIndex + 1];
              setFocusedMake(nextMake);
              document.querySelector(`[data-make="${nextMake}"]`)?.scrollIntoView({ 
                behavior: 'smooth', block: 'center', inline: 'center' 
              });
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentArray = allTopRowCars.includes(focusedCar) ? allTopRowCars : allBottomRowCars;
          const currentIndex = currentArray.indexOf(focusedCar);
          if (currentIndex < currentArray.length - 1) {
            setFocusedCar(currentArray[currentIndex + 1]);
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
              document.querySelector(`[data-make="${prevMake}"]`)?.scrollIntoView({ 
                behavior: 'smooth', block: 'center', inline: 'center' 
              });
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentArray = allTopRowCars.includes(focusedCar) ? allTopRowCars : allBottomRowCars;
          const currentIndex = currentArray.indexOf(focusedCar);
          if (currentIndex > 0) {
            setFocusedCar(currentArray[currentIndex - 1]);
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
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            return;
          }

          const currentMake = focusedCar.make?.trim().toUpperCase();
          const makeCars = carsByMake[currentMake] || [];
          const topRowIndex = makeCars.filter((_, i) => i % 2 === 0).findIndex(c => c.id === focusedCar.id);
          if (topRowIndex !== -1) {
            const bottomCar = makeCars.filter((_, i) => i % 2 === 1)[topRowIndex];
            if (bottomCar) {
              setFocusedCar(bottomCar);
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

          const currentMake = focusedCar.make?.trim().toUpperCase();
          const makeCars = carsByMake[currentMake] || [];
          const bottomRowIndex = makeCars.filter((_, i) => i % 2 === 1).findIndex(c => c.id === focusedCar.id);
          if (bottomRowIndex !== -1) {
            const topCar = makeCars.filter((_, i) => i % 2 === 0)[bottomRowIndex];
            if (topCar) {
              setFocusedCar(topCar);
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
            showCarDetailsModal();
            if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [carDetailsVisible, cars, focusedZone, focusedCar, focusedMake, allTopRowCars, allBottomRowCars]);

  const buyCar = async (car) => {
    if (money >= car.price) {
      setLoadingBuy(true);
      try {
        setMoney(money - car.price);
        await client.graphql({
          query: mutations.updateUser,
          variables: { input: { id: playerInfo.id, money: money - car.price } }
        });
        createNewUserCar(playerInfo.id, car.id);
        message.success("Car successfully bought!");
      } catch (err) {
        message.error("Error buying car");
      } finally {
        setLoadingBuy(false);
        setCarDetailsVisible(false);
      }
    } else {
      setCreditWarningModalvisible(true);
      setCarDetailsVisible(false);
    }
    await checkAndUpdateAchievements(playerInfo);
  };

  const handleCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setVisible(false);
  };

  const handleCarDetailsCancel = () => {
    if (soundEffectsOn) playClosingSound();
    setCarDetailsVisible(false);
  };

  const createNewCar = async (values) => {
    await client.graphql({
      query: mutations.createCar,
      variables: { input: { ...values, year: parseInt(values.year), price: parseInt(values.price) } }
    });
    await fetchCars();
    setVisible(false);
    form.resetFields();
    message.success("Car created successfully!");
  };

  const getImageSource = (make, model) => require(`../../assets/images/cars/${make} ${model}.png`);

  return (
    <div className="cars">
      {carsLoading ? (
        <Spin size="large" />
      ) : (
        <div className="cars__container">
          {(() => {
            // Lists are now managed by the useEffect
            return Object.entries(groupCarsByMake(cars)).map(([make, makeCars], makeIndex) => {
              const sortedMakeCars = makeCars.sort((a, b) => {
                const nameA = `${a.make || ""} ${a.model || ""}`.trim();
                const nameB = `${b.make || ""} ${b.model || ""}`.trim();
                return nameA.localeCompare(nameB);
              });
              // Split cars into two rows
              const topRowCars = [];
              const bottomRowCars = [];
              sortedMakeCars.forEach((car, index) => {
                if (index % 2 === 0) {
                  topRowCars.push(car);
                } else {
                  bottomRowCars.push(car);
                }
              });

              return (
                <div key={make} className="make-section" data-make-index={makeIndex} data-focused={focusedMake === make}>
                  <h2 className="make-name" data-make={make}>{make}</h2>
                  <div className="make-grid">
                    <div className="make-row">
                      {topRowCars.map((car) => {
                        return (
                          <CarCard
                            key={car.id}
                            focusedCar={focusedCar}
                            selectedCar={cars.indexOf(car) === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(cars.indexOf(car));
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            car={car}
                            getImageSource={getImageSource}
                            showPrice={true}
                            setFocusedCar={setFocusedCar}
                            cars={cars}
                            setFocusPosition={() => { }}
                            column={allTopRowCars.indexOf(car)}
                            row={2}
                          />
                        );
                      })}
                    </div>
                    <div className="make-row">
                      {bottomRowCars.map((car) => {
                        const absoluteIndex = cars.indexOf(car);
                        return (
                          <CarCard
                            key={car.id}
                            focusedCar={focusedCar}
                            selectedCar={absoluteIndex === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(absoluteIndex);
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            car={car}
                            getImageSource={getImageSource}
                            showPrice={true}
                            setFocusedCar={setFocusedCar}
                            cars={cars}
                            setFocusPosition={() => { }}
                            column={allBottomRowCars.indexOf(car)}
                            row={3}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
      <Modal
        visible={visible}
        title="Create a New Car"
        okText="Create"
        cancelText="Cancel"
        onCancel={handleCancel}
        onOk={() => {
          form.validateFields().then((values) => {
            createNewCar(values);
          });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={(values) => createNewCar(values)}
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
            rules={[{ required: true, message: "Please enter the year!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter the price!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select the type!" }]}
          >
            <Select>
              <Option value="regular">Regular</Option>
              <Option value="epic">Epic</Option>
              <Option value="legendary">Legendary</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <CarDetailsModal
        visible={carDetailsVisible && selectedCar !== null}
        handleCancel={handleCarDetailsCancel}
        selectedCar={selectedCar}
        buyCar={buyCar}
        loadingBuy={loadingBuy}
      />
      <CreditWarningModal
        isModalVisible={creditWarningModalvisible}
        setIsModalVisible={setCreditWarningModalvisible}
      />
    </div>
  );
};

export default CarsStore;