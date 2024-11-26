import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Modal, Form, Input, message, Select, Typography, Spin } from "antd";
import { generateClient } from 'aws-amplify/api';
import { listCars as listCarsQuery } from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import "./carsPage.css";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import { createNewUserCar, playSwitchSound, playOpeningSound, playClosingSound } from "../../functions";
import { CreditWarningModal } from "../../components/CreditWarningModal/CreditWarningModal";

const { Option } = Select;
const client = generateClient();

const cars = [
  {
    make: "Chevrolet",
    model: "Tahoe",
    year: 2024,
    price: 90000,
    type: "epic"
  },
  {
    make: "Ford",
    model: "Focus",
    year: 2017,
    price: 20000,
    type: "regular"
  },
  {
    make: "Aston Martin",
    model: "DBX",
    year: 2024,
    price: 90000,
    type: "regular"
  },
  {
    make: "Chevrolet",
    model: "Silverado",
    year: 2020,
    price: 70000,
    type: "epic"
  },
  {
    make: "Mercedes-Benz",
    model: "A-Class",
    year: 2020,
    price: 30000,
    type: "epic"
  },
  {
    make: "BMW",
    model: "X5",
    year: 2024,
    price: 60000,
    type: "regular"
  },
  {
    make: "BMW",
    model: "335i",
    year: 2016,
    price: 40000,
    type: "epic"
  },
  {
    make: "Mercedes-Benz AMG",
    model: "SL 63",
    year: 2024,
    price: 100000,
    type: "epic"
  },
  {
    make: "Alfa Romeo",
    model: "4C",
    year: 2017,
    price: 60000,
    type: "epic"
  },
  {
    make: "Aston Martin",
    model: "Vantage",
    year: 2022,
    price: 80000,
    type: "epic"
  },
  {
    make: "Bentley",
    model: "Continental GTC",
    year: 2024,
    price: 140000,
    type: "epic"
  },
  {
    make: "Mazda",
    model: "CX-5",
    year: 2021,
    price: 25000,
    type: "regular"
  },
  {
    make: "Porsche",
    model: "911 GT3 RS",
    year: 2024,
    price: 200000,
    type: "legendary"
  },
  {
    make: "Toyota",
    model: "Camry",
    year: 2021,
    price: 40000,
    type: "regular"
  },
  {
    make: "Volkswagen",
    model: "Golf GTI",
    year: 2021,
    price: 39980,
    type: "epic"
  },
  {
    make: "Mazda",
    model: "MX-5",
    year: 2020,
    price: 25000,
    type: "regular"
  },
  {
    make: "Aston Martin",
    model: "DB12",
    year: 2024,
    price: 200000,
    type: "legendary"
  },
  {
    make: "Mercedes-Benz",
    model: "EQS",
    year: 2024,
    price: 108000,
    type: "epic"
  },
  {
    make: "Audi",
    model: "RS E-Tron GT",
    year: 2024,
    price: 90000,
    type: "epic"
  },
  {
    make: "Ford",
    model: "Focus RS",
    year: 2024,
    price: 50000,
    type: "legendary"
  },
  {
    make: "Mercedes-Benz",
    model: "AMG GT",
    year: 2023,
    price: 190000,
    type: "legendary"
  },
  {
    make: "Volkswagen",
    model: "ID4",
    year: 2024,
    price: 70000,
    type: "epic"
  },
  {
    make: "Nissan",
    model: "GT-R",
    year: 2024,
    price: 110000,
    type: "legendary"
  },
  {
    make: "Mercedes-Benz",
    model: "GLC",
    year: 2022,
    price: 90000,
    type: "legendary"
  },
  {
    make: "Dodge",
    model: "Viper SRT",
    year: 2017,
    price: 80000,
    type: "legendary"
  },
  {
    make: "Lamborghini",
    model: "Centenario",
    year: 2024,
    price: 300000,
    type: "epic"
  },
  {
    make: "Lucid",
    model: "Air Sapphire",
    year: 2023,
    price: 80000,
    type: "legendary"
  },
  {
    make: "Ford",
    model: "Mustang",
    year: 2021,
    price: 50000,
    type: "regular"
  },
  {
    make: "Mitsubishi",
    model: "Eclipse Spyder GT",
    year: 2008,
    price: 15000,
    type: "regular"
  },
  {
    make: "Lamborghini",
    model: "Urus",
    year: 2024,
    price: 240000,
    type: "epic"
  },
  {
    make: "Hummer",
    model: "EV",
    year: 2022,
    price: 100000,
    type: "legendary"
  },
  {
    make: "Toyota",
    model: "Tundra",
    year: 2024,
    price: 80000,
    type: "epic"
  },
  {
    make: "Aston Martin",
    model: "DBS",
    year: 2011,
    price: 50000,
    type: "epic"
  },
  {
    make: "Hummer",
    model: "H3",
    year: 2009,
    price: 40000,
    type: "epic"
  },
  {
    make: "Rivian",
    model: "R1S",
    year: 2024,
    price: 60000,
    type: "legendary"
  },
  {
    make: "Mercedes-Benz",
    model: "E-Class",
    year: 2024,
    price: 70000,
    type: "regular"
  },
  {
    make: "Bentley",
    model: "Bentayga",
    year: 2018,
    price: 40000,
    type: "regular"
  },
  {
    make: "Porsche",
    model: "Cayenne",
    year: 2023,
    price: 90000,
    type: "regular"
  },
  {
    make: "Lamborghini",
    model: "Huracan",
    year: 2024,
    price: 250000,
    type: "legendary"
  },
  {
    make: "Audi",
    model: "A4",
    year: 2018,
    price: 10000,
    type: "regular"
  },
  {
    make: "BMW",
    model: "218i",
    year: 2019,
    price: 15000,
    type: "epic"
  },
  {
    make: "Rivian",
    model: "R1T",
    year: 2023,
    price: 80000,
    type: "regular"
  },
  {
    make: "Toyota",
    model: "Supra",
    year: 2021,
    price: 35000,
    type: "epic"
  },
  {
    make: "Toyota",
    model: "Land Cruiser 300",
    year: 2023,
    price: 60000,
    type: "regular"
  },
  {
    make: "Dodge",
    model: "Charger",
    year: 2023,
    price: 50000,
    type: "regular"
  }
];

const bulkUploadCars = async (carsData) => {
  const results = {
    successful: [],
    failed: []
  };
  
  const uploadPromises = carsData.map(async (car) => {
    try {
      const carInput = {
        make: car.make,
        model: car.model,
        year: parseInt(car.year),
        price: parseInt(car.price),
        type: car.type.toLowerCase()
      };

      const response = await client.graphql({
        query: mutations.createCar,
        variables: { input: carInput }
      });

      results.successful.push({
        ...car,
        id: response.data.createCar.id
      });
      
      return response;
    } catch (error) {
      results.failed.push({
        car,
        error: error.message
      });
      console.error(`Failed to upload car: ${car.make} ${car.model}`, error);
    }
  });

  await Promise.all(uploadPromises);

  return {
    totalProcessed: carsData.length,
    successful: results.successful.length,
    failed: results.failed.length,
    successfulCars: results.successful,
    failedCars: results.failed
  };
};

const CarsStore = ({ playerInfo, setMoney, money }) => {
  const [carsState, setCars] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const carsContainerRef = useRef(null);

  const fetchCars = useCallback(async () => {
    try {
      const carData = await client.graphql({ query: listCarsQuery });
      setCars(carData.data.listCars.items);
    } catch (error) {
      console.error("Error fetching cars:", error);
      message.error("Failed to fetch cars");
    } finally {
      setCarsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleBulkUpload = async () => {
    try {
      setUploadInProgress(true);
      const results = await bulkUploadCars(cars);
      message.success(`Successfully uploaded ${results.successful} cars`);
      if (results.failed > 0) {
        message.warning(`Failed to upload ${results.failed} cars`);
      }
      await fetchCars();
    } catch (error) {
      message.error('Error during bulk upload');
      console.error(error);
    } finally {
      setUploadInProgress(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      const carsCount = carsState.length;
      if (key === "ArrowRight" && !carDetailsVisible) {
        playSwitchSound();
        setSelectedCarIndex((prevIndex) => (prevIndex + 1) % carsCount);
      } else if (key === "ArrowLeft" && !carDetailsVisible) {
        playSwitchSound();
        setSelectedCarIndex((prevIndex) => (prevIndex - 1 + carsCount) % carsCount);
      } else if (key === "ArrowDown" && !carDetailsVisible) {
        playSwitchSound();
        setSelectedCarIndex((prevIndex) => (prevIndex + 5) % carsCount);
      } else if (key === "ArrowUp" && !carDetailsVisible) {
        playSwitchSound();
        setSelectedCarIndex((prevIndex) => (prevIndex - 5 + carsCount) % carsCount);
      } else if (key === "Enter" && !carDetailsVisible) {
        setSelectedCar(carsState[selectedCarIndex]);
        playOpeningSound();
        showCarDetailsModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [carsState, selectedCarIndex, carDetailsVisible]);

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
            },
          },
        });

        createNewUserCar(playerInfo.id, car.id);
        message.success('Car successfully bought!');
      } catch (err) {
        console.log(err);
        message.error('Error buying car');
      } finally {
        setLoadingBuy(false);
        setSelectedCar(null);
      }
    } else if (playerInfo && money < car.price) {
      setCreditWarningModalvisible(true);
      handleCarDetailsCancel();
    }
  };

  const showCarDetailsModal = () => {
    setCarDetailsVisible(true);
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
    message.success('Car created successfully!');
  };

  const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/${imageName}`);
  };

  return (
    <div className="cars">
    <Button
        type="primary"
        onClick={handleBulkUpload}
        loading={uploadInProgress}
        style={{ marginBottom: '20px' }}
      >
        Upload All Cars
      </Button>

      {carsLoading ? (
        <Spin size="large" fullscreen />
      ) : (
        <div ref={carsContainerRef} className="cars__container">
          {carsState.length && carsState.map((car, index) => (
            <CarCard
              key={car.id + Math.random()}
              selectedCar={index === selectedCarIndex ? car : null}
              setSelectedCar={(car) => {
                setSelectedCar(car)
                setSelectedCarIndex(index)
                showCarDetailsModal()
              }}
              showCarDetailsModal={showCarDetailsModal}
              car={car}
              getImageSource={getImageSource}
              showPrice
            />
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
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={(values) => createNewCar(values)}
        >
          <Form.Item name="make" label="Make" rules={[{ required: true, message: 'Please enter the make!' }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Please enter the model!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Please enter the year!' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter the price!' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select the type!' }]}>
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