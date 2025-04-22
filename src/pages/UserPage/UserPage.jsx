import React, { useState, useEffect, useRef } from "react";
import { Form, message, Typography, Spin, Card, Row, Col, Divider, Avatar, Button, Image } from "antd";
import { generateClient } from 'aws-amplify/api';
import { useParams, useNavigate } from "react-router-dom";
import { MessageOutlined } from "@ant-design/icons";
import * as mutations from '../../graphql/mutations';
import * as queries from '../../graphql/queries';
import { fetchUserCarsRequest, getUserCar, deleteUserCar, createNewAuctionUser, playSwitchSound, playOpeningSound, playClosingSound, fetchAuctionCreator, fetchUserInfoById, selectAvatar, getImageSource as getImageSourceFunc } from "../../functions";
import CarCard from "../CarPages/CarCard";
import UserCarDetailsModal from "./UserCarDetailsModal";
import "./UserPage.css";

// Import custom queries and mutations
const customMutations = {
  createConversation: /* GraphQL */ `
    mutation CreateConversation(
      $input: CreateConversationInput!
      $condition: ModelConversationConditionInput
    ) {
      createConversation(input: $input, condition: $condition) {
        id
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        createdAt
        updatedAt
      }
    }
  `,
  createUserConversation: /* GraphQL */ `
    mutation CreateUserConversation(
      $input: CreateUserConversationInput!
      $condition: ModelUserConversationConditionInput
    ) {
      createUserConversation(input: $input, condition: $condition) {
        id
        userId
        conversationId
        createdAt
        updatedAt
      }
    }
  `
};

const customQueries = {
  getConversation: /* GraphQL */ `
    query GetConversation($id: ID!) {
      getConversation(id: $id) {
        id
        participants {
          items {
            user {
              id
              nickname
              avatar
            }
            userId
            conversationId
          }
        }
        messages {
          items {
            id
            conversationId
            senderId
            content
            timestamp
            read
          }
        }
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        createdAt
        updatedAt
      }
    }
  `,
  userConversationsByUserId: /* GraphQL */ `
    query UserConversationsByUserId(
      $userId: ID!
      $sortDirection: ModelSortDirection
      $filter: ModelUserConversationFilterInput
      $limit: Int
      $nextToken: String
    ) {
      userConversationsByUserId(
        userId: $userId
        sortDirection: $sortDirection
        filter: $filter
        limit: $limit
        nextToken: $nextToken
      ) {
        items {
          id
          userId
          conversationId
          user {
            id
            nickname
            avatar
          }
          conversation {
            id
            lastMessageAt
            lastMessageContent
            lastMessageSenderId
          }
        }
        nextToken
      }
    }
  `
};

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
  const [currentUser, setCurrentUser] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

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

    // Fetch current user info
    async function fetchCurrentUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          const userData = await fetchUserInfoById(userInfo.id);
          console.log('Current user data:', userData);
          setCurrentUser(userData);
        } else {
          // Try to get user info from the App component's state
          const appUserInfo = JSON.parse(localStorage.getItem('playerInfo'));
          if (appUserInfo && appUserInfo.id) {
            const userData = await fetchUserInfoById(appUserInfo.id);
            console.log('Current user data from playerInfo:', userData);
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    }
    fetchCurrentUser();
  }, [id]);

  const handleSendMessage = async () => {
    // Play a sound when the button is clicked
    playSwitchSound();

    console.log('handleSendMessage called');
    console.log('currentUser:', currentUser);
    console.log('userInfo:', userInfo);

    if (!currentUser) {
      message.info("Please log in to send messages");
      return;
    }

    if (!userInfo || currentUser.id === userInfo.id) {
      if (currentUser?.id === userInfo?.id) {
        message.info("You cannot send messages to yourself");
      }
      return;
    }

    try {
      setSendingMessage(true);

      // Define the query inline
      const userConversationsByUserId = /* GraphQL */ `
        query UserConversationsByUserId(
          $userId: ID!
          $sortDirection: ModelSortDirection
          $filter: ModelUserConversationFilterInput
          $limit: Int
          $nextToken: String
        ) {
          userConversationsByUserId(
            userId: $userId
            sortDirection: $sortDirection
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              id
              userId
              conversationId
              user {
                id
                nickname
                avatar
              }
              conversation {
                id
                lastMessageAt
                lastMessageContent
                lastMessageSenderId
              }
            }
            nextToken
          }
        }
      `;

      // Check if a conversation already exists between these users
      const userConversationsData = await client.graphql({
        query: userConversationsByUserId,
        variables: {
          userId: currentUser.id,
        },
      });

      const userConversationItems = userConversationsData.data.userConversationsByUserId.items;

      // Define the query inline
      const getConversation = /* GraphQL */ `
        query GetConversation($id: ID!) {
          getConversation(id: $id) {
            id
            participants {
              items {
                user {
                  id
                  nickname
                  avatar
                }
                userId
                conversationId
              }
            }
            messages {
              items {
                id
                conversationId
                senderId
                content
                timestamp
                read
              }
            }
            lastMessageAt
            lastMessageContent
            lastMessageSenderId
            createdAt
            updatedAt
          }
        }
      `;

      // Fetch full conversation details for each conversation
      const conversationPromises = userConversationItems.map(async (item) => {
        const conversationData = await client.graphql({
          query: getConversation,
          variables: {
            id: item.conversationId,
          },
        });

        return conversationData.data.getConversation;
      });

      const fetchedConversations = await Promise.all(conversationPromises);

      // Find if there's an existing conversation with the profile user
      let existingConversation = null;

      for (const conversation of fetchedConversations) {
        const participants = conversation.participants?.items || [];
        const hasProfileUser = participants.some(p => p.user.id === userInfo.id);

        if (hasProfileUser) {
          existingConversation = conversation;
          break;
        }
      }

      if (existingConversation) {
        // Navigate to existing conversation
        message.success(`Opening conversation with ${userInfo.nickname || "user"}...`);
        navigate(`/messenger/${existingConversation.id}`);
      } else {
        message.success(`Creating new conversation with ${userInfo.nickname || "user"}...`);
        // Define the mutations inline
        const createConversation = /* GraphQL */ `
          mutation CreateConversation(
            $input: CreateConversationInput!
            $condition: ModelConversationConditionInput
          ) {
            createConversation(input: $input, condition: $condition) {
              id
              lastMessageAt
              lastMessageContent
              lastMessageSenderId
              createdAt
              updatedAt
            }
          }
        `;

        const createUserConversation = /* GraphQL */ `
          mutation CreateUserConversation(
            $input: CreateUserConversationInput!
            $condition: ModelUserConversationConditionInput
          ) {
            createUserConversation(input: $input, condition: $condition) {
              id
              userId
              conversationId
              createdAt
              updatedAt
            }
          }
        `;

        // Create a new conversation
        const newConversationData = await client.graphql({
          query: createConversation,
          variables: {
            input: {
              lastMessageAt: new Date().toISOString(),
            },
          },
        });

        const newConversation = newConversationData.data.createConversation;

        // Add both users to the conversation
        await client.graphql({
          query: createUserConversation,
          variables: {
            input: {
              userId: currentUser.id,
              conversationId: newConversation.id,
            },
          },
        });

        await client.graphql({
          query: createUserConversation,
          variables: {
            input: {
              userId: userInfo.id,
              conversationId: newConversation.id,
            },
          },
        });

        // Navigate to the new conversation
        message.success(`Starting new conversation with ${userInfo.nickname || "user"}...`);
        navigate(`/messenger/${newConversation.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      message.error("Failed to start conversation");
    } finally {
      setSendingMessage(false);
    }
  };



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

  const handleCarDetailsCancel = () => {
    playClosingSound();
    setCarDetailsVisible(false);
  };

  const cancelNewAuction = () => {
    setNewAuctionVisible(false);
  };
  
  // Function to handle "Buy the same one" action
  const buySameCar = async (car) => {
    try {
      setLoadingBuy(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`You would buy the same car: ${car.make} ${car.model}`);
      // Implement actual functionality later
      handleCarDetailsCancel(); // Close the modal after successful purchase
    } catch (error) {
      console.error('Error buying car:', error);
      message.error('Failed to buy car');
    } finally {
      setLoadingBuy(false);
    }
  };
  
  // Function to show car history
  const showCarHistory = (car) => {
    message.info(`This would show history for: ${car.make} ${car.model}`);
    // Implement actual functionality later
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
      <Row gutter={[24, 24]} style={{ width: '100%' }}>
        <Col xs={24} md={8}>
          <Card className="user-profile-card">
            <div className="user-profile-header">
              <Avatar
                size={120}
                src={userInfo?.avatar ? selectAvatar(userInfo?.avatar) : null}
                className="user-avatar"
              />

<Button
                  type="primary"
                  icon={
                    <img
                      src="https://cdn2.iconfinder.com/data/icons/outline-ui-3-part-3-of-3/100/pack08-21-512.png"
                      alt="Message"
                      style={{ width: '20px', height: '20px', marginRight: '8px', filter: 'brightness(0) invert(1)' }}
                    />
                  }
                  onClick={handleSendMessage}
                  loading={sendingMessage}
                  className="message-button-under-avatar"
                  size="large"
                  style={{
                    width: '80%',
                    height: '45px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginTop: '15px',
                    marginBottom: '15px',
                    boxShadow: '0 4px 12px rgba(0, 114, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Send a Message
                </Button>

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
                    setFocusedCar={() => {}} // Add empty function to prevent errors
                    setFocusPosition={() => {}} // Add empty function to prevent errors
                  />
                ))}
              </div>
            ) : (
              <Typography.Title level={4} className="no-cars-message">This user has no cars</Typography.Title>
            )}
          </Card>
        </Col>
      </Row>
      
      {/* Car Details Modal */}
      <UserCarDetailsModal
        visible={selectedCar && carDetailsVisible}
        handleCancel={handleCarDetailsCancel}
        selectedCar={selectedCar || {}}
        buyCar={buySameCar} // Use the buySameCar function for the "Buy the same one" action
        loadingBuy={loadingBuy}
        getImageSource={getImageSource}
        fromMyCars={false} // Explicitly set to false since this is UserPage, not MyCars
      />
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