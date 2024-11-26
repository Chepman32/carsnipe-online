import React, { useState, useEffect, useRef } from "react";
import { Form, message, Typography, Spin } from "antd";
import { generateClient } from 'aws-amplify/api';
import { listCars as listCarsQuery } from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import "./carsPage.css";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import { fetchUserCarsRequest, getUserCar, deleteUserCar, createNewAuctionUser, playSwitchSound, playOpeningSound, playClosingSound, getCarsPerRow } from "../../functions";
import NewAuctionModal from "./NewAuctionModal";

const client = generateClient();

const MyCars = ({ playerInfo }) => {
 const [cars, setCars] = useState([]);
 const [loading, setLoading] = useState(true);
 const [newAuctionvisible, setNewAuctionVisible] = useState(false);
 const [auctionDuration, setAuctionDuration] = useState(1);
 const [minBid, setMinBid] = useState(0);
 const [buy, setBuy] = useState(0)
 const [loadingBuy, setLoadingBuy] = useState(false);
 const [loadingNewAuction, setLoadingNewAuction] = useState(false);
 const [selectedCar, setSelectedCar] = useState(null);
 const [carDetailsVisible, setCarDetailsVisible] = useState(false);
 const [selectedCarIndex, setSelectedCarIndex] = useState(0);

 const carsContainerRef = useRef(null);
 const [form] = Form.useForm();
 useEffect(() => {
   async function fetchUserCars() {
     try {
       setLoading(true);
       const userCars = await fetchUserCarsRequest(playerInfo.id);
       setCars(userCars);
     } catch (error) {
       console.error('Error fetching cars:', error);
     } finally {
       setLoading(false);
     }
   }
   fetchUserCars();
 }, [playerInfo.id, loadingNewAuction]);

  useEffect(() => {
   
    const scrollList = () => {
      const {innerWidth: pageWidth} = window
      if (pageWidth < 512) window.scrollBy(0, -window.innerHeight * 0.5);
  if (pageWidth < 768) window.scrollBy(0, -window.innerHeight * 0.5);
  if (pageWidth < 900) return 2;
  if (pageWidth < 1200) return 3;
  if (pageWidth < 1600) return 4;

    }
   const handleKeyDown = (event) => {
     const { key } = event;
     const carsPerRow = getCarsPerRow();
     const carsCount = cars.length;
     const rowsCount = Math.ceil(carsCount / carsPerRow);
     if (key === "ArrowRight" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex + 1) % carsCount);
     } else if (key === "ArrowLeft" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex - 1 + carsCount) % carsCount);
     } else if (key === "ArrowDown" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex + 5) % carsCount); // Move down by 5 cars
     } else if (key === "ArrowUp" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex - 5 + carsCount) % carsCount); // Move up by 5 cars
     } else if (key === "Enter" && !carDetailsVisible && !newAuctionvisible) {
      cancelNewAuction()
       setSelectedCar(cars[selectedCarIndex].car);
       cancelNewAuction()
       showCarDetailsModal();
     }
   };

   document.addEventListener("keydown", handleKeyDown);
   return () => {
     document.removeEventListener("keydown", handleKeyDown);
   };
 }, [cars, selectedCarIndex, carDetailsVisible, newAuctionvisible]);

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
    status: 'Active',
    lastBidPlayer: '',
    player: playerInfo?.nickname,
    buy: selectedCar.price,
    minBid,
  };

  try {
    setLoadingNewAuction(true);

    const result = await client.graphql({
      query: mutations.createAuction,
      variables: {
        input: newAuction,
      },
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

      playSwitchSound();
      message.success('Auction created successfully!');
    } else {
      throw new Error('Failed to retrieve the ID of the created auction.');
    }
  } catch (error) {
    console.error('Error creating auction:', error);
  } finally {
    setLoadingNewAuction(false);
    setNewAuctionVisible(false);
    setSelectedCarIndex((prev) => (cars.length > prev ? prev - 1 : 0));
  }
};
  
  const showCarDetailsModal = () => {
   setCarDetailsVisible(true);
 };

  const cancelNewAuction = () => {
   setNewAuctionVisible(false);
 };

  const handleCarDetailsCancel = () => {
    cancelNewAuction()
    setCarDetailsVisible(false);
 };

 const getImageSource = (make, model) => {
   const imageName = `${make} ${model}.png`;
   return require(`../../assets/images/${imageName}`);
 };

 return (
   <div style={{ padding: '20px' }}>
     {loading ? (
       <Spin size="large" fullscreen />
     ) : cars && cars.length ? (
       <div
         style={{ width: "100%", display: 'flex', flexDirection: 'row', flexWrap: "wrap" }}
         ref={carsContainerRef}
       >
         {cars.map((car, index) => (
           <CarCard
             key={car.car.id + Math.random()}
             selectedCar={index === selectedCarIndex ? car.car : null}
             setSelectedCar={(car) => {
               setSelectedCar(car)
               setSelectedCarIndex(index)
               showCarDetailsModal()
             }}
             showCarDetailsModal={showCarDetailsModal}
             car={car.car}
             getImageSource={getImageSource}
           />
         ))}
       </div>
     ) : (
       <Typography.Title>You have no cars</Typography.Title>
     )}
     <CarDetailsModal
       visible={carDetailsVisible && selectedCar !== null}
       handleCancel={() => {
        cancelNewAuction()
        setCarDetailsVisible(false);
        playClosingSound()
     }}
       setSelectedCar={car => setSelectedCar(car)}
       selectedCar={selectedCar}
       loadingNewAuction={loadingNewAuction}
       forAuction
       showNewAuction={() => {
         handleCarDetailsCancel()
         playSwitchSound()
         setNewAuctionVisible(true)
       }}
     />
     {newAuctionvisible && selectedCar && (
       <NewAuctionModal
         visible={newAuctionvisible}
         handleCancel={() => {
          playSwitchSound()
          cancelNewAuction()
         }}
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