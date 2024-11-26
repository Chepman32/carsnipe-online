import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Modal, Form, Input, message, Select, Spin } from "antd";
import { generateClient } from 'aws-amplify/api';
import { listCars as listCarsQuery } from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import "./carsPage.css";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import { createNewUserCar, playSwitchSound, playOpeningSound, playClosingSound, checkAndUpdateAchievements } from "../../functions";
import { CreditWarningModal } from "../../components/CreditWarningModal/CreditWarningModal";

const { Option } = Select;
const client = generateClient();

const CarsStore = ({ playerInfo, setMoney, money }) => {
  const [cars, setCars] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);

  const carsContainerRef = useRef(null);

  const showCarDetailsModal = useCallback(() => {
    setCarDetailsVisible(true);
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      const carData = await client.graphql({ query: listCarsQuery });
      const cars = carData.data.listCars.items;
      const sortedCars = cars.sort((a, b) => {
        const nameA = `${a.make || ""} ${a.model || ""}`.trim();
        const nameB = `${b.make || ""} ${b.model || ""}`.trim();
        return nameA.localeCompare(nameB);
      });
      setCars(sortedCars);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setCarsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchAllCars() {
      await fetchCars();
    }
    fetchAllCars();
  }, [fetchCars]);

  const groupCarsByMake = (cars) => {
    return cars.reduce((groups, car) => {
      const make = car.make ? car.make.trim().toUpperCase() : "UNKNOWN";
      if (!groups[make]) {
        groups[make] = [];
      }
      groups[make].push(car);
      return groups;
    }, {});
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      if (carDetailsVisible) return;

      const getItemsPerRow = () => {
        const windowWidth = window.innerWidth;
        let itemWidth;
        
        if (windowWidth <= 512) {
          itemWidth = windowWidth * 0.95;
        } else if (windowWidth <= 768) {
          itemWidth = windowWidth * 0.48;
        } else if (windowWidth <= 900) {
          itemWidth = windowWidth * 0.48;
        } else if (windowWidth <= 1200) {
          itemWidth = windowWidth * 0.31;
        } else if (windowWidth <= 1600) {
          itemWidth = windowWidth * 0.23;
        } else {
          itemWidth = windowWidth * 0.19;
        }

        const itemsPerRow = Math.floor((windowWidth - 40) / (itemWidth + 10));
        return Math.max(1, itemsPerRow);
      };

      const itemsPerRow = getItemsPerRow();
      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake);
      
      const currentMake = makes.find((make) => {
        const makeStartIndex = cars.indexOf(carsByMake[make][0]);
        const makeEndIndex = makeStartIndex + carsByMake[make].length - 1;
        return selectedCarIndex >= makeStartIndex && selectedCarIndex <= makeEndIndex;
      });
      
      const currentMakeCars = carsByMake[currentMake] || [];
      const currentMakeStartIndex = cars.indexOf(currentMakeCars[0]);
      const positionInMake = selectedCarIndex - currentMakeStartIndex;
      const currentRow = Math.floor(positionInMake / itemsPerRow);
      const positionInRow = positionInMake % itemsPerRow;

      switch (key) {
        case "ArrowRight": {
          if (positionInRow < itemsPerRow - 1 && positionInMake < currentMakeCars.length - 1) {
            setSelectedCarIndex(selectedCarIndex + 1);
            playSwitchSound();
          }
          break;
        }
        
        case "ArrowLeft": {
          if (positionInRow > 0) {
            setSelectedCarIndex(selectedCarIndex - 1);
            playSwitchSound();
          }
          break;
        }
        
        case "ArrowDown": {
          const nextRowStartIndex = currentMakeStartIndex + (currentRow + 1) * itemsPerRow;
          
          if (currentRow < Math.floor((currentMakeCars.length - 1) / itemsPerRow)) {
            const nextIndex = Math.min(nextRowStartIndex + positionInRow, currentMakeStartIndex + currentMakeCars.length - 1);
            setSelectedCarIndex(nextIndex);
            playSwitchSound();
          } else {
            const currentMakeIndex = makes.indexOf(currentMake);
            if (currentMakeIndex < makes.length - 1) {
              const nextMake = makes[currentMakeIndex + 1];
              const nextMakeStartIndex = cars.indexOf(carsByMake[nextMake][0]);
              setSelectedCarIndex(nextMakeStartIndex);
              playSwitchSound();
            }
          }
          break;
        }
        
        case "ArrowUp": {
          const prevRowStartIndex = currentMakeStartIndex + (currentRow - 1) * itemsPerRow;
          
          if (currentRow > 0) {
            const prevIndex = Math.min(prevRowStartIndex + positionInRow, currentMakeStartIndex + currentMakeCars.length - 1);
            setSelectedCarIndex(prevIndex);
            playSwitchSound();
          } else {
            const currentMakeIndex = makes.indexOf(currentMake);
            if (currentMakeIndex > 0) {
              const prevMake = makes[currentMakeIndex - 1];
              const prevMakeCars = carsByMake[prevMake];
              const prevMakeStartIndex = cars.indexOf(prevMakeCars[0]);
              const lastRowIndex = Math.floor((prevMakeCars.length - 1) / itemsPerRow);
              const lastRowStartIndex = prevMakeStartIndex + lastRowIndex * itemsPerRow;
              const targetIndex = Math.min(lastRowStartIndex + positionInRow, prevMakeStartIndex + prevMakeCars.length - 1);
              setSelectedCarIndex(targetIndex);
              playSwitchSound();
            }
          }
          break;
        }
        
        case "Enter": {
          setSelectedCar(cars[selectedCarIndex]);
          playOpeningSound();
          showCarDetailsModal();
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cars, selectedCarIndex, carDetailsVisible, showCarDetailsModal, playSwitchSound, playOpeningSound]);

  const buyCar = async (car) => {
    if (playerInfo && playerInfo.id && money >= car.price) {
      playSwitchSound();
      setMoney(money - car.price);
      try {
        setLoadingBuy(true);
        await client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: playerInfo.id,
              money: money - car.price,
              totalSpent: (playerInfo.totalSpent || 0) + car.price,
            },
          },
        });
        createNewUserCar(playerInfo.id, car.id);
        message.success("Car successfully bought!");
      } catch (err) {
        console.log(err);
        message.error("Error buying car");
      } finally {
        setLoadingBuy(false);
        setSelectedCar(null);
      }
    } else if (playerInfo && money < car.price) {
      setCreditWarningModalvisible(true);
      handleCarDetailsCancel();
      return;
    }
    await checkAndUpdateAchievements(playerInfo);
  };

  const handleCancel = () => {
    playClosingSound();
    setVisible(false);
  };

  const handleCarDetailsCancel = () => {
    playClosingSound();
    setCarDetailsVisible(false);
  };

  const createNewCar = async (values) => {
    const newCar = {
      make: values.make,
      model: values.model,
      year: parseInt(values.year),
      price: parseInt(values.price),
      type: values.type,
    };
    await client.graphql({
      query: mutations.createCar,
      variables: { input: newCar },
    });
    await fetchCars();
    setVisible(false);
    form.resetFields();
    message.success("Car created successfully!");
  };

  const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/${imageName}`);
  };

  return (
    <div className="cars">
      {carsLoading ? (
        <Spin size="large" fullscreen />
      ) : (
        <div ref={carsContainerRef} className="cars__container">
          {Object.entries(groupCarsByMake(cars)).map(([make, makeCars]) => (
            <div key={make} className="make-section">
              <h2 className="make-name">{make}</h2>
              <section className="make-section-container">
              <div className="make-cars">
                {makeCars
                  .sort((a, b) => {
                    const nameA = `${a.make || ""} ${a.model || ""}`.trim();
                    const nameB = `${b.make || ""} ${b.model || ""}`.trim();
                    return nameA.localeCompare(nameB);
                  })
                  .map((car) => {
                    const absoluteIndex = cars.indexOf(car);
                    return (
                      <CarCard
                        key={car.id}
                        selectedCar={absoluteIndex === selectedCarIndex ? car : null}
                        setSelectedCar={(selectedCar) => {
                          setSelectedCar(selectedCar);
                          setSelectedCarIndex(absoluteIndex);
                          showCarDetailsModal();
                        }}
                        showCarDetailsModal={showCarDetailsModal}
                        car={car}
                        getImageSource={getImageSource}
                        showPrice
                      />
                    );
                  })}
              </div>
              </section>
            </div>
          ))}
        </div>
      )}
      <Modal
        visible={visible}
        title="Create a New Car"
        okText="Create"
        cancelText="Cancel"
        onCancel={handleCancel}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              createNewCar(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={(values) => createNewCar(values)}
        >
          <Form.Item name="make" label="Make" rules={[{ required: true, message: "Please enter the make!" }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true, message: "Please enter the model!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="year" label="Year" rules={[{ required: true, message: "Please enter the year!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: "Please enter the price!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true, message: "Please select the type!" }]}>
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
      <CreditWarningModal isModalVisible={creditWarningModalvisible} setIsModalVisible={setCreditWarningModalvisible} />
    </div>
  );
};

export default CarsStore;