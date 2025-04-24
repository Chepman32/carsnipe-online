import { generateClient } from "aws-amplify/api";
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import SwitchSound from "./assets/audio/light-switch.mp3";
import OpeningSound from "./assets/audio/opening.MP3";
import ClosingSound from "./assets/audio/closing.MP3";
import avatar1 from "./assets/images/avatars/avatar1.png";

import { message } from "antd";

const client = generateClient();

export const fetchUserCarsRequest = async (id) => {
  try {
    if (!id) {
      console.error("No user ID provided to fetchUserCarsRequest");
      return [];
    }

    const userData = await client.graphql({
      query: `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            cars {
              items {
                car {
                  id
                  make
                  model
                  year
                  type
                  price
                }
              }
            }
          }
        }
      `,
      variables: {
        id,
      },
    });

    // Check if user exists and has cars
    if (!userData?.data?.getUser) {
      console.log("User not found in fetchUserCarsRequest");
      return [];
    }

    return userData.data.getUser.cars?.items || [];
  } catch (error) {
    console.error("Error fetching user's cars:", error);
    return [];
  }
};

export const fetchAuctionCreator = async (auctionId) => {
  try {
    if (!auctionId) {
      console.error("No auction ID provided to fetchAuctionCreator");
      return null;
    }

    const auctionUserData = await fetchAuctionUser(auctionId);

    if (!auctionUserData) {
      console.log("No auction user data found for auction ID:", auctionId);
      return null;
    }

    return auctionUserData;
  } catch (error) {
    console.error("Error fetching auction creator:", error);
    return null; // Return null instead of throwing to prevent app crashes
  }
};

export const fetchUserInfoById = async (userId) => {
  try {
    if (!userId) {
      console.error("No user ID provided to fetchUserInfoById");
      return null;
    }

    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    if (!userData?.data?.getUser) {
      console.log("User not found in fetchUserInfoById");
      return null;
    }

    return userData.data.getUser;
  } catch (error) {
    console.error("Error fetching user information:", error);
    return null;
  }
};

export const getCarTypeColor = (carType) => {
  // Handle undefined/null case
  if (!carType) return "#32a852"; // Default to regular color
  
  // Convert to lowercase for case-insensitive comparison
  const type = carType.toLowerCase();
  
  switch (type) {
    case "regular":
    case "common":
      return "#32a852"; // Green for regular/common
    case "rare":
      return "#397aab"; // Blue for rare
    case "legendary":
      return "#d4ca0f"; // Yellow for legendary
    case "epic":
      return "#4d1ac4"; // Purple for epic
    default:
      return "#32a852"; // Default to regular color
  }
};

export function calculateTimeDifference(targetTime) {
  let targetDateTime;

  // Check if targetTime is a string representing a Unix timestamp in seconds
  if (typeof targetTime === 'string' && /^\d+$/.test(targetTime)) {
    // Convert seconds string to milliseconds number
    const timestampMs = parseInt(targetTime, 10) * 1000;
    targetDateTime = new Date(timestampMs);
  } else {
    // Otherwise, assume it's a format Date constructor can handle (ISO string, milliseconds number)
    targetDateTime = new Date(targetTime);
  }

  // Check if the date is valid after parsing
  if (isNaN(targetDateTime.getTime())) {
    console.error("Invalid date format received in calculateTimeDifference:", targetTime);
    return "Invalid Date"; // Return an error string or handle appropriately
  }

  const currentTime = new Date();
  const timeDifferenceInSeconds = Math.floor(
    (targetDateTime.getTime() - currentTime.getTime()) / 1000
  );

  if (timeDifferenceInSeconds <= 0) {
    return "Finished";
  } else if (timeDifferenceInSeconds < 60) {
    return "finishing";
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    const remainingMinutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${
      remainingMinutes !== 1 ? "s" : ""
    }`;
  }
}

export const createNewUserCar = async (userId, carId) => {
  try {
    await client.graphql({
      query: mutations.createUserCar,
      variables: { input: { userId, carId } },
    });

    const user = await client.graphql({
      query: mutations.updateUser,
      variables: {
        input: {
          id: userId,
          totalCarsOwned: { increment: 1 },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error associating car with user:", error);
  }
};

export async function getUserCar(userId, carId) {
  const userCarData = await client.graphql({
    query: queries.listUserCars,
    variables: {
      filter: {
        userId: { eq: userId },
        carId: { eq: carId },
      },
    },
  });

  const cars = userCarData?.data?.listUserCars?.items;

  if (cars && cars.length > 0) {
    return cars[0]; // Return the first matching car object
  } else {
    throw new Error("Car not found for the specified user and car ID");
  }
}

export const deleteUserCar = async (carId, userId) => {
  try {
    await client.graphql({
      query: mutations.deleteUserCar,
      variables: { input: { id: carId } },
    });

    await client.graphql({
      query: mutations.updateUser,
      variables: {
        input: {
          id: userId,
          totalCarsOwned: { decrement: 1 },
        },
      },
    });
  } catch (error) {
    console.error("Error deleting user car:", error);
  }
};

export const createNewAuctionUser = async (userId, auctionId) => {
  try {
    const result = await client.graphql({
      query: mutations.createAuctionUser,
      variables: {
        input: {
          userId,
          auctionId,
        },
      },
    });
    return result.data.createAuctionUser; // Return the created auction user data
  } catch (error) {
    console.error("Error creating auction user:", error);
    throw error; // Handle or propagate the error as needed
  }
};

export const fetchAuctionUser = async (auctionId) => {
  try {
    if (!auctionId) {
      console.error("No auction ID provided to fetchAuctionUser");
      return null;
    }

    console.log("Fetching auction user for ID:", auctionId);
    
    // First try to get the auction to find the player
    const auctionData = await client.graphql({
      query: queries.getAuction,
      variables: {
        id: auctionId,
      },
    });
    
    const auction = auctionData?.data?.getAuction;
    
    if (!auction) {
      console.log("No auction found for ID:", auctionId);
      return null;
    }
    
    console.log("Found auction:", auction.make, auction.model, "Player:", auction.player);
    
    // Try to find the auction user relationship
    const auctionUserData = await client.graphql({
      query: queries.listAuctionUsers,
      variables: {
        filter: {
          auctionId: { eq: auctionId },
        },
      },
    });

    const auctionUser = auctionUserData?.data?.listAuctionUsers?.items?.[0];

    // If we found an auction user relationship, use that to get the user
    if (auctionUser && auctionUser.userId) {
      console.log("Found auction user relationship with userId:", auctionUser.userId);
      const userData = await client.graphql({
        query: queries.getUser,
        variables: {
          id: auctionUser.userId,
        },
      });

      const user = userData?.data?.getUser;

      if (user) {
        console.log("Found user via relationship:", user.nickname);
        return user;
      } else {
        console.log("User not found for userId:", auctionUser.userId);
      }
    } else {
      console.log("No auction user relationship found");
    }
    
    // If no auction user relationship found or user not found, try to find by player nickname
    if (auction.player) {
      console.log("Finding user by nickname:", auction.player);
      const userData = await client.graphql({
        query: queries.listUsers,
        variables: {
          filter: {
            nickname: { eq: auction.player },
          },
        },
      });

      const user = userData?.data?.listUsers?.items?.[0];
      
      if (user) {
        console.log("Found user by nickname:", user.nickname, "with ID:", user.id);
        // Create the auction user relationship for future use
        try {
          const result = await createNewAuctionUser(user.id, auctionId);
          console.log("Created new auction user relationship:", result);
          return user;
        } catch (err) {
          console.error("Error creating auction user relationship:", err);
          // Still return the user even if creating the relationship fails
          return user;
        }
      } else {
        console.log("No user found with nickname:", auction.player);
      }
    } else {
      console.log("Auction has no player field");
    }
    
    // If we get here, we couldn't find a user by any method
    // Let's try one more approach - check if lastBidPlayer exists and find by that
    if (auction.lastBidPlayer && auction.lastBidPlayer !== auction.player) {
      console.log("Trying to find user by lastBidPlayer:", auction.lastBidPlayer);
      const userData = await client.graphql({
        query: queries.listUsers,
        variables: {
          filter: {
            nickname: { eq: auction.lastBidPlayer },
          },
        },
      });

      const user = userData?.data?.listUsers?.items?.[0];
      
      if (user) {
        console.log("Found user by lastBidPlayer:", user.nickname);
        try {
          await createNewAuctionUser(user.id, auctionId);
          console.log("Created new auction user relationship for lastBidPlayer");
        } catch (err) {
          console.error("Error creating auction user relationship for lastBidPlayer:", err);
        }
        return user;
      }
    }
    
    console.log("No user found for auction ID:", auctionId);
    // Return a default user object with a default avatar to prevent null issues
    return { 
      id: "default", 
      nickname: auction.player || "Unknown", 
      avatar: "avatar1" 
    };
  } catch (error) {
    console.error("Error in fetchAuctionUser:", error);
    // Return a default user object with a default avatar to prevent null issues
    return { 
      id: "default", 
      nickname: "Unknown", 
      avatar: "avatar1" 
    };
  }
};

export const increaseAuctionUserMoney = async (auctionUserId) => {
  try {
    // Get current user money
    const userResult = await client.graphql({
      query: queries.getUser,
      variables: {
        id: auctionUserId,
      },
    });

    const currentMoney = userResult.data.getUser.money;

    // Calculate new money
    const newMoney = currentMoney + 2000;

    // Update user with new money
    await client.graphql({
      query: mutations.updateUser,
      variables: {
        input: {
          id: auctionUserId,
          money: newMoney,
        },
      },
    });

    console.log("Increased auction user money by 2000!");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function getUserCreatedAuction(auctionId) {
  try {
    const auctionUserData = await client.graphql({
      query: queries.getAuctionUser,
      variables: {
        id: auctionId,
      },
    });

    const auctionUser = auctionUserData.data.getAuctionUser;

    if (!auctionUser) {
      // Auction user not found
      return null;
    }

    return auctionUser.userId;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const addUserToAuction = async (userId, auctionId) => {
  try {
    await client.graphql({
      query: mutations.createAuctionUser,
      variables: {
        input: {
          userId: userId,
          auctionId: auctionId,
        },
      },
    });
  } catch (error) {
    console.error("Error adding user to auction:", error);
    // Handle error or notify the user
  }
};

export const fetchUserBiddedList = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    const biddedAuctions = userData.data.getUser.bidded;
    return biddedAuctions;
  } catch (error) {
    console.error("Error fetching user's bidded auctions:", error);
    return [];
  }
};

export const fetchUserData = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    return userData.data.getUser || null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const fetchUserAchievementsList = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    return userData.data.getUser.achievements || [];
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return [];
  }
};

export const getCarPriceByIdFromUserCar = async (userId, carId) => {
  try {
    const userData = await client.graphql({
      query: `
        query GetUserCar($userId: ID!, $carId: ID!) {
          getUser(id: $userId) {
            cars(filter: {carId: {eq: $carId}}) {
              items {
                car {
                  price
                }
              }
            }
          }
        }
      `,
      variables: {
        userId,
        carId,
      },
    });

    const carData = userData.data.getUser.cars.items[0];
    if (carData && carData.car) {
      return carData.car.price;
    } else {
      throw new Error("Car not found in user's cars");
    }
  } catch (error) {
    console.error("Error fetching car price:", error);
    throw error;
  }
};

export const playSwitchSound = () => {
  const audio = new Audio(SwitchSound);
  audio.play();
};

export const playOpeningSound = () => {
  const audio = new Audio(OpeningSound);
  audio.play();
};

export const playClosingSound = () => {
  const audio = new Audio(ClosingSound);
  audio.play();
};

export const getCarsPerRow = () => {
  const width = window.innerWidth;
  if (width < 512) return 1;
  if (width < 768) return 2;
  if (width < 900) return 2;
  if (width < 1200) return 3;
  if (width < 1600) return 4;
  return 5;
};

export const selectAvatar = (avatar) => {
  try {
    // Extract the number from the avatar string (e.g. "avatar22" -> 22)
    const avatarNumber = parseInt(avatar.replace('avatar', ''));
    
    if (!isNaN(avatarNumber)) {
      // Use import() instead of require for dynamic imports
      // This returns a Promise, so we need to handle it differently
      return import(`./assets/images/avatars/avatar${avatarNumber}.png`)
        .then(module => module.default)
        .catch(error => {
          console.warn(`Avatar ${avatar} not found, falling back to avatar1`);
          return avatar1;
        });
    }
  } catch (error) {
    console.warn(`Avatar ${avatar} not found, falling back to avatar1`);
  }
  
  // Default case if the input is invalid or avatar not found
  return avatar1;
};

export function extractNameFromEmail(email) {
  return email.split("@")[0];
}

export const getImageSource = (make, model) => {
  if (!make || !model) {
    console.warn('Missing make or model for getImageSource');
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }
  
  const imageName = `${make} ${model}.png`;
  
  try {
    // First try to use dynamic import
    return import(`./assets/images/cars/${imageName}`)
      .then(module => module.default)
      .catch(error => {
        console.warn(`Car image for ${make} ${model} not found: ${error.message}`);
        // Return a placeholder image
        return 'https://via.placeholder.com/300x200?text=No+Image';
      });
  } catch (error) {
    console.warn(`Error loading car image for ${make} ${model}: ${error.message}`);
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }
};

export const getAchievementImageSource = (title) => {
  const imageName = `${title}.png`;
  // Use dynamic import instead of require
  return import(`./assets/images/achievements/${imageName}`)
    .then(module => module.default)
    .catch(error => {
      console.warn(`Achievement image for ${title} not found`);
      // You might want to return a default image here
      return null;
    });
};

export async function createConversation(userId1, userId2) {
  try {
    // Define the mutations inline
    const createConversationMutation = /* GraphQL */ `
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

    const createUserConversationMutation = /* GraphQL */ `
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
      query: createConversationMutation,
      variables: {
        input: {
          lastMessageAt: new Date().toISOString(),
        },
      },
    });

    const newConversation = newConversationData.data.createConversation;

    // Add both users to the conversation
    await client.graphql({
      query: createUserConversationMutation,
      variables: {
        input: {
          userId: userId1,
          conversationId: newConversation.id,
        },
      },
    });

    await client.graphql({
      query: createUserConversationMutation,
      variables: {
        input: {
          userId: userId2,
          conversationId: newConversation.id,
        },
      },
    });

    return newConversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function sendMessage(conversationId, senderId, content, isEvent = false) {
  try {
    // Define the mutations inline
    const createMessageMutation = /* GraphQL */ `
      mutation CreateMessage(
        $input: CreateMessageInput!
        $condition: ModelMessageConditionInput
      ) {
        createMessage(input: $input, condition: $condition) {
          id
          conversationId
          senderId
          content
          timestamp
          read
          isEvent
          createdAt
          updatedAt
        }
      }
    `;

    const updateConversationMutation = /* GraphQL */ `
      mutation UpdateConversation(
        $input: UpdateConversationInput!
        $condition: ModelConversationConditionInput
      ) {
        updateConversation(input: $input, condition: $condition) {
          id
          lastMessageAt
          lastMessageContent
          lastMessageSenderId
          updatedAt
        }
      }
    `;

    const timestamp = new Date().toISOString();

    // Create new message
    const newMessageData = await client.graphql({
      query: createMessageMutation,
      variables: {
        input: {
          conversationId,
          senderId,
          content,
          timestamp,
          read: false,
          isEvent,
        },
      },
    });

    // Update conversation with last message info
    await client.graphql({
      query: updateConversationMutation,
      variables: {
        input: {
          id: conversationId,
          lastMessageAt: timestamp,
          lastMessageContent: content,
          lastMessageSenderId: senderId,
        },
      },
    });

    return newMessageData.data.createMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function fetchUserConversations(userId) {
  try {
    // Define the queries inline
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

    // Get all conversations where the user is a participant
    const userConversationsData = await client.graphql({
      query: userConversationsByUserId,
      variables: {
        userId,
      },
    });

    const userConversationItems = userConversationsData.data.userConversationsByUserId.items;

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

    // Sort conversations by last message timestamp (newest first)
    return fetchedConversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0);
      const timeB = new Date(b.lastMessageAt || 0);
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

export async function fetchConversationMessages(conversationId) {
  try {
    // Define the query inline
    const messagesByConversationId = /* GraphQL */ `
      query MessagesByConversationId(
        $conversationId: ID!
        $sortDirection: ModelSortDirection
        $filter: ModelMessageFilterInput
        $limit: Int
        $nextToken: String
      ) {
        messagesByConversationId(
          conversationId: $conversationId
          sortDirection: $sortDirection
          filter: $filter
          limit: $limit
          nextToken: $nextToken
        ) {
          items {
            id
            conversationId
            senderId
            content
            timestamp
            read
            createdAt
            updatedAt
          }
          nextToken
        }
      }
    `;

    const messagesData = await client.graphql({
      query: messagesByConversationId,
      variables: {
        conversationId,
        sortDirection: "ASC", // Oldest to newest
      },
    });

    return messagesData.data.messagesByConversationId.items;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export async function markMessageAsRead(messageId) {
  try {
    // Define the mutation inline
    const updateMessage = /* GraphQL */ `
      mutation UpdateMessage(
        $input: UpdateMessageInput!
        $condition: ModelMessageConditionInput
      ) {
        updateMessage(input: $input, condition: $condition) {
          id
          conversationId
          senderId
          content
          timestamp
          read
          updatedAt
        }
      }
    `;

    await client.graphql({
      query: updateMessage,
      variables: {
        input: {
          id: messageId,
          read: true,
        },
      },
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

export async function checkAndUpdateAchievements(user) {
  if (!user || !user.id) {
    console.error(
      "Invalid user object provided to checkAndUpdateAchievements:",
      user
    );
    return;
  }

  try {
    const info = await fetchUserData(user.id);
    if (!info) {
      console.error("Could not fetch user data for ID:", user.id);
      return;
    }

    const userAchievements = await fetchUserAchievementsList(user.id);
    const userCars = await fetchUserCarsRequest(user.id);
    const userBidded = await fetchUserBiddedList(user.id);
    const userSold = info.sold || [];
    const currentAchievements = Array.isArray(userAchievements)
      ? userAchievements.map((a) => a.name)
      : [];
    const newAchievements = [];

    const addAchievement = (name) => {
      if (!currentAchievements.includes(name)) {
        newAchievements.push({ name, date: new Date().toISOString() });
      }
    };

    console.log(
      "userBidded",
      Array.isArray(userBidded) ? userBidded.length : 0
    );

    // Make sure all arrays are valid before checking conditions
    if (Array.isArray(userBidded) && userBidded.length === 0)
      addAchievement("First One");
    if (Array.isArray(userCars) && userCars.length >= 7)
      addAchievement("Starter Pack");
    if (Array.isArray(userCars) && userCars.length >= 10)
      addAchievement("New Collector");
    if (Array.isArray(userSold) && userSold.length >= 1)
      addAchievement("Quick Sale");

    // Safe handling of userBidded
    if (Array.isArray(userBidded) && userBidded.length > 0) {
      const userAuctionsParticipated = userBidded
        .filter((bid) => bid && bid.auctionId) // Filter out invalid bids
        .map((bid) => bid.auctionId);

      const uniqueAuctions = new Set(userAuctionsParticipated);
      if (uniqueAuctions.size >= 20) addAchievement("Auction Veteran");

      // Safe reduce operation
      const totalSpent = userBidded.reduce((sum, bid) => {
        return (
          sum + (bid && typeof bid.bidValue === "number" ? bid.bidValue : 0)
        );
      }, 0);

      if (totalSpent > 500000) addAchievement("Big Spender");

      // Safe filter operation for first bids
      const validBids = userBidded.filter((bid) => bid && bid.auctionId);
      const uniqueAuctionsFirstBid = new Set(
        validBids
          .filter((bid) => {
            // This is a simplification since we don't have auction data here
            // In a real implementation, you'd need to fetch the auction data
            return bid && bid.auctionId;
          })
          .map((bid) => bid.auctionId)
      ).size;

      if (uniqueAuctionsFirstBid >= 5) addAchievement("Early Bird");

      // Safe check for high roller
      if (
        userBidded.some(
          (bid) =>
            bid && typeof bid.bidValue === "number" && bid.bidValue > 100000
        )
      ) {
        addAchievement("High Roller");
      }
    }

    // Safe handling of userSold
    if (
      Array.isArray(userSold) &&
      userSold.length > 0 &&
      Array.isArray(userCars) &&
      userCars.length > 0
    ) {
      const profitSales = userSold.some((carId) => {
        if (!carId) return false;
        const car = userCars.find((car) => car && car.id === carId);
        return (
          car &&
          typeof car.sellPrice === "number" &&
          typeof car.purchasePrice === "number" &&
          car.sellPrice > car.purchasePrice
        );
      });

      if (profitSales) addAchievement("First Profit");
    }

    // Only update if we have new achievements and valid user data
    if (newAchievements.length > 0 && user && user.id) {
      try {
        const updatedAchievements = [
          ...(Array.isArray(userAchievements) ? userAchievements : []),
          ...newAchievements,
        ];
        await client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: user.id,
              achievements: updatedAchievements.map((ach) => ({
                name: ach.name,
                date: ach.date,
              })),
            },
          },
        });

        newAchievements.forEach((ach) =>
          message.success(`Achievement unlocked: ${ach.name}`)
        );
      } catch (updateError) {
        console.error("Error updating user achievements:", updateError);
      }
    }
  } catch (error) {
    console.error("Error updating achievements:", error);
  }
}
