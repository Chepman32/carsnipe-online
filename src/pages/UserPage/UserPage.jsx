import React, { useState, useEffect, useRef } from "react";
import { Form, message, Typography, Spin, Card, Row, Col, Divider, Avatar } from "antd";
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { fetchUserCarsRequest, getUserCar, deleteUserCar, createNewAuctionUser, playSwitchSound, playOpeningSound, playClosingSound, fetchAuctionCreator, fetchUserInfoById, selectAvatar } from "../../functions";
import CarCard from "../CarPages/CarCard";
import { useParams } from "react-router-dom";
import "./UserPage.css";

const client = generateClient();
const { Title, Text, Paragraph } = Typography;

const UserPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [cars, setCars] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newAuctionvisible, setNewAuctionVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);

  const { id } = useParams();

  const carsContainerRef = useRef(null);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setUserLoading(true);
        const user = await fetchUserInfoById(id);
        setUserInfo(user);
      } catch (error) {
        console.log('Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUserInfo();

    async function fetchUserCars() {
      try {
        setLoading(true);
        const userCars = await fetchUserCarsRequest(id);
        setCars(userCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserCars();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      const carsCount = cars.length;
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
      } else if (key === "Enter" && !carDetailsVisible && !newAuctionvisible && cars.length > 0) {
        cancelNewAuction();
        setSelectedCar(cars[selectedCarIndex].car);
        cancelNewAuction();
        showCarDetailsModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cars, selectedCarIndex, carDetailsVisible, newAuctionvisible]);

  const showCarDetailsModal = () => {
    playOpeningSound();
    setCarDetailsVisible(true);
  };

  const cancelNewAuction = () => {
    setNewAuctionVisible(false);
  };

  const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
  };

  if (userLoading) {
    return <Spin size="large" fullscreen />;
  }

  // Handle case when user is not found
  if (!userInfo) {
    return (
      <div className="user-profile-container">
        <Card className="user-not-found-card">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>User Not Found</Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
            The user you're looking for doesn't exist or has been removed.
          </Paragraph>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="user-profile-card">
            <div className="user-profile-header">
              <Avatar
                size={120}
                src={userInfo.avatar ? selectAvatar(userInfo.avatar) : null}
                className="user-avatar"
              />
              <Title level={2} className="user-name">{userInfo.nickname || "User"}</Title>
            </div>
            <Divider />
            <div className="user-bio">
              <Title level={4}>Bio</Title>
              <Paragraph className="bio-text">
                {userInfo.bio || "This user hasn't added a bio yet."}
              </Paragraph>
            </div>
            <Divider />
            <div className="user-stats">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="Cars Owned" value={cars?.length || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Auctions Won" value={userInfo.totalAuctionsWon || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Auctions Participated" value={userInfo.totalAuctionsParticipated || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Total Profit" value={userInfo.totalProfitEarned || 0} prefix="$" />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="user-cars-card">
            <Title level={3}>Car Collection</Title>
            {loading ? (
              <Spin size="large" />
            ) : cars && cars.length ? (
              <div
                className="cars-container"
                ref={carsContainerRef}
              >
                {cars.map((car, index) => (
                  <CarCard
                    key={car.car.id + Math.random()}
                    selectedCar={index === selectedCarIndex ? car.car : null}
                    setSelectedCar={(car) => {
                      setSelectedCar(car);
                      setSelectedCarIndex(index);
                      showCarDetailsModal();
                    }}
                    showCarDetailsModal={showCarDetailsModal}
                    car={car.car}
                    getImageSource={getImageSource}
                  />
                ))}
              </div>
            ) : (
              <Typography.Title level={4} className="no-cars-message">This user has no cars</Typography.Title>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Statistic component for user stats
const Statistic = ({ title, value, prefix = "" }) => (
  <div className="statistic-container">
    <Text className="statistic-title">{title}</Text>
    <Text className="statistic-value">{prefix}{value}</Text>
  </div>
);

export default UserPage;