import { supabase } from "./supabase";
import SwitchSound from "./assets/audio/light-switch.mp3";
import OpeningSound from "./assets/audio/opening.MP3";
import ClosingSound from "./assets/audio/closing.MP3";
import avatar1 from "./assets/images/avatars/avatar1.png";

import { message } from "antd";

// Import Supabase API functions
import * as api from "./api/supabaseApi";

export const fetchUserCarsRequest = async (id) => {
  try {
    if (!id) {
      console.error("No user ID provided to fetchUserCarsRequest");
      return [];
    }

    const { data: userCars, error } = await supabase
      .from("user_cars")
      .select(
        `
        car_id,
        cars (
          id,
          make,
          model,
          year,
          type,
          price
        )
      `
      )
      .eq("user_id", id);

    if (error) {
      console.error("Error fetching user's cars:", error);
      return [];
    }

    // Transform to match expected format
    return (
      userCars?.map((userCar) => ({
        car: userCar.cars,
      })) || []
    );
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

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user information:", error);
      return null;
    }

    return user;
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
  if (typeof targetTime === "string" && /^\d+$/.test(targetTime)) {
    // Convert seconds string to milliseconds number
    const timestampMs = parseInt(targetTime, 10) * 1000;
    targetDateTime = new Date(timestampMs);
  } else {
    // Otherwise, assume it's a format Date constructor can handle (ISO string, milliseconds number)
    targetDateTime = new Date(targetTime);
  }

  // Check if the date is valid after parsing
  if (isNaN(targetDateTime.getTime())) {
    console.error(
      "Invalid date format received in calculateTimeDifference:",
      targetTime
    );
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
    console.log(
      "createNewUserCar: Starting with userId:",
      userId,
      "carId:",
      carId
    );

    // Check if user already owns this car
    const { data: existingCar, error: checkError } = await supabase
      .from("user_cars")
      .select("*")
      .eq("user_id", userId)
      .eq("car_id", carId)
      .single();

    console.log(
      "createNewUserCar: Check result - existingCar:",
      existingCar,
      "checkError:",
      checkError
    );

    if (existingCar) {
      console.log("User already owns this car, skipping insertion");
      return { data: { updateUser: null } };
    }

    // Insert user-car relationship
    console.log("createNewUserCar: Inserting new user-car relationship");
    const { error: insertError } = await supabase
      .from("user_cars")
      .insert([{ user_id: userId, car_id: carId }]);

    console.log("createNewUserCar: Insert result - insertError:", insertError);

    if (insertError) {
      // If it's a unique constraint violation, the user already owns the car
      if (insertError.code === "23505") {
        console.log("User already owns this car (unique constraint violation)");
        return { data: { updateUser: null } };
      }
      throw insertError;
    }

    // Update user's total cars owned count
    console.log("createNewUserCar: Updating user's total cars owned count");
    const { data: user, error: updateError } = await supabase
      .from("users")
      .update({
        total_cars_owned: supabase.raw("total_cars_owned + 1"),
      })
      .eq("id", userId)
      .select()
      .single();

    console.log(
      "createNewUserCar: Update result - user:",
      user,
      "updateError:",
      updateError
    );

    if (updateError) throw updateError;

    console.log("createNewUserCar: Successfully completed");
    return { data: { updateUser: user } };
  } catch (error) {
    console.error("Error associating car with user:", error);
    throw error; // Re-throw the error so the calling function knows something went wrong
  }
};

export async function getUserCar(userId, carId) {
  const { data: userCar, error } = await supabase
    .from("user_cars")
    .select("*")
    .eq("user_id", userId)
    .eq("car_id", carId)
    .single();

  if (error) {
    throw new Error("Car not found for the specified user and car ID");
  }

  return userCar;
}

export const deleteUserCar = async (carId, userId) => {
  try {
    // Delete user-car relationship
    const { error: deleteError } = await supabase
      .from("user_cars")
      .delete()
      .eq("car_id", carId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Update user's total cars owned count
    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_cars_owned: supabase.raw("total_cars_owned - 1"),
      })
      .eq("id", userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error deleting user car:", error);
  }
};

export const createNewAuctionUser = async (userId, auctionId) => {
  try {
    const { data: auctionUser, error } = await supabase
      .from("auction_users")
      .insert([
        {
          user_id: userId,
          auction_id: auctionId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return auctionUser;
  } catch (error) {
    console.error("Error creating auction user:", error);
    throw error;
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
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      console.log("No auction found for ID:", auctionId);
      return null;
    }

    console.log(
      "Found auction:",
      auction.make,
      auction.model,
      "Player:",
      auction.player
    );

    // Try to find the auction user relationship
    const { data: auctionUsers, error: auctionUserError } = await supabase
      .from("auction_users")
      .select("user_id")
      .eq("auction_id", auctionId)
      .limit(1);

    const auctionUser = auctionUsers?.[0];

    // If we found an auction user relationship, use that to get the user
    if (auctionUser && auctionUser.user_id) {
      console.log(
        "Found auction user relationship with userId:",
        auctionUser.user_id
      );
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", auctionUser.user_id)
        .single();

      if (user && !userError) {
        console.log("Found user via relationship:", user.nickname);
        return user;
      } else {
        console.log("User not found for userId:", auctionUser.user_id);
      }
    } else {
      console.log("No auction user relationship found");
    }

    // If no auction user relationship found or user not found, try to find by player nickname
    if (auction.player) {
      console.log("Finding user by nickname:", auction.player);
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("nickname", auction.player)
        .limit(1);

      const user = users?.[0];

      if (user && !usersError) {
        console.log(
          "Found user by nickname:",
          user.nickname,
          "with ID:",
          user.id
        );
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
    if (auction.last_bid_player && auction.last_bid_player !== auction.player) {
      console.log(
        "Trying to find user by lastBidPlayer:",
        auction.last_bid_player
      );
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("nickname", auction.last_bid_player)
        .limit(1);

      const user = users?.[0];

      if (user && !usersError) {
        console.log("Found user by lastBidPlayer:", user.nickname);
        try {
          await createNewAuctionUser(user.id, auctionId);
          console.log(
            "Created new auction user relationship for lastBidPlayer"
          );
        } catch (err) {
          console.error(
            "Error creating auction user relationship for lastBidPlayer:",
            err
          );
        }
        return user;
      }
    }

    console.log("No user found for auction ID:", auctionId);
    // Return a default user object with a default avatar to prevent null issues
    return {
      id: "default",
      nickname: auction.player || "Unknown",
      avatar: "avatar1",
    };
  } catch (error) {
    console.error("Error in fetchAuctionUser:", error);
    // Return a default user object with a default avatar to prevent null issues
    return {
      id: "default",
      nickname: "Unknown",
      avatar: "avatar1",
    };
  }
};

export const increaseAuctionUserMoney = async (auctionUserId) => {
  try {
    // Update user money by adding 2000
    const { data: user, error } = await supabase
      .from("users")
      .update({
        money: supabase.raw("money + 2000"),
      })
      .eq("id", auctionUserId)
      .select("money")
      .single();

    if (error) throw error;

    console.log(
      "Increased auction user money by 2000! New amount:",
      user.money
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function getUserCreatedAuction(auctionId) {
  try {
    const { data: auctionUsers, error } = await supabase
      .from("auction_users")
      .select("user_id")
      .eq("auction_id", auctionId)
      .single();

    if (error) {
      console.error("Error fetching auction user:", error);
      return null;
    }

    return auctionUsers?.user_id || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const addUserToAuction = async (userId, auctionId) => {
  try {
    const { data, error } = await supabase
      .from("auction_users")
      .insert([
        {
          user_id: userId,
          auction_id: auctionId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding user to auction:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error adding user to auction:", error);
    // Handle error or notify the user
  }
};

export const fetchUserBiddedList = async (userId) => {
  try {
    const { data: bidInfo, error } = await supabase
      .from("bid_info")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user's bidded auctions:", error);
      return [];
    }

    return bidInfo || [];
  } catch (error) {
    console.error("Error fetching user's bidded auctions:", error);
    return [];
  }
};

export const fetchUserData = async (userId) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const fetchUserAchievementsList = async (userId) => {
  try {
    const { data: achievements, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }

    return achievements || [];
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return [];
  }
};

export const getCarPriceByIdFromUserCar = async (userId, carId) => {
  try {
    const { data: userCar, error } = await supabase
      .from("user_cars")
      .select(
        `
        cars (
          price
        )
      `
      )
      .eq("user_id", userId)
      .eq("car_id", carId)
      .single();

    if (error) {
      console.error("Error fetching user car:", error);
      throw new Error("Car not found in user's cars");
    }

    if (userCar && userCar.cars) {
      return userCar.cars.price;
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
    const avatarNumber = parseInt(avatar.replace("avatar", ""));

    if (!isNaN(avatarNumber)) {
      // Use import() instead of require for dynamic imports
      // This returns a Promise, so we need to handle it differently
      return import(`./assets/images/avatars/avatar${avatarNumber}.png`)
        .then((module) => module.default)
        .catch((error) => {
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
    console.warn("Missing make or model for getImageSource");
    return "https://via.placeholder.com/300x200?text=No+Image";
  }

  const imageName = `${make} ${model}.png`;

  try {
    // First try to use dynamic import
    return import(`./assets/images/cars/${imageName}`)
      .then((module) => module.default)
      .catch((error) => {
        console.warn(
          `Car image for ${make} ${model} not found: ${error.message}`
        );
        // Return a placeholder image
        return "https://via.placeholder.com/300x200?text=No+Image";
      });
  } catch (error) {
    console.warn(
      `Error loading car image for ${make} ${model}: ${error.message}`
    );
    return "https://via.placeholder.com/300x200?text=No+Image";
  }
};

export const getAchievementImageSource = (title) => {
  const imageName = `${title}.png`;
  // Use dynamic import instead of require
  return import(`./assets/images/achievements/${imageName}`)
    .then((module) => module.default)
    .catch((error) => {
      console.warn(`Achievement image for ${title} not found`);
      // You might want to return a default image here
      return null;
    });
};

export async function createConversation(userId1, userId2) {
  try {
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert([
        {
          last_message_at: new Date().toISOString(),
          is_group: false,
        },
      ])
      .select()
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }

    // Add both users to the conversation
    const { error: userConversationError } = await supabase
      .from("user_conversations")
      .insert([
        {
          user_id: userId1,
          conversation_id: newConversation.id,
        },
        {
          user_id: userId2,
          conversation_id: newConversation.id,
        },
      ]);

    if (userConversationError) {
      console.error(
        "Error adding users to conversation:",
        userConversationError
      );
      throw userConversationError;
    }

    return newConversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function sendMessage(
  conversationId,
  senderId,
  content,
  isEvent = false
) {
  try {
    const timestamp = new Date().toISOString();

    // Create new message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          timestamp,
          read: false,
          is_event: isEvent,
        },
      ])
      .select()
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      throw messageError;
    }

    // Update conversation with last message info
    const { error: conversationError } = await supabase
      .from("conversations")
      .update({
        last_message_at: timestamp,
        last_message_content: content,
        last_message_sender_id: senderId,
        updated_at: timestamp,
      })
      .eq("id", conversationId);

    if (conversationError) {
      console.error("Error updating conversation:", conversationError);
      throw conversationError;
    }

    return newMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function fetchUserConversations(userId) {
  try {
    if (!userId) {
      console.error("No user ID provided to fetchUserConversations");
      return [];
    }

    // Get all conversations where the user is a participant
    const { data: userConversations, error: userConversationsError } =
      await supabase
        .from("user_conversations")
        .select(
          `
        conversation_id,
        conversations (
          id,
          last_message_at,
          last_message_content,
          last_message_sender_id,
          created_at,
          updated_at
        )
      `
        )
        .eq("user_id", userId);

    if (userConversationsError) {
      console.error(
        "Error fetching user conversations:",
        userConversationsError
      );
      throw userConversationsError;
    }

    if (!userConversations || userConversations.length === 0) {
      return [];
    }

    // Fetch full conversation details including participants for each conversation
    const conversationPromises = userConversations.map(async (item) => {
      const conversationId = item.conversation_id;
      const conversation = item.conversations;

      // Get all participants for this conversation
      const { data: participants, error: participantsError } = await supabase
        .from("user_conversations")
        .select(
          `
          user_id,
          users (
            id,
            nickname,
            avatar
          )
        `
        )
        .eq("conversation_id", conversationId);

      if (participantsError) {
        console.error(
          `Error fetching participants for conversation ${conversationId}:`,
          participantsError
        );
        return null;
      }

      // Get recent messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: false })
        .limit(10);

      if (messagesError) {
        console.error(
          `Error fetching messages for conversation ${conversationId}:`,
          messagesError
        );
      }

      return {
        id: conversation.id,
        lastMessageAt: conversation.last_message_at,
        lastMessageContent: conversation.last_message_content,
        lastMessageSenderId: conversation.last_message_sender_id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        participants: {
          items: participants.map((p) => ({
            user: p.users,
            userId: p.user_id,
            conversationId: conversationId,
          })),
        },
        messages: {
          items: messages || [],
        },
      };
    });

    const fetchedConversations = await Promise.all(conversationPromises);

    // Filter out null conversations and sort by last message timestamp (newest first)
    return fetchedConversations
      .filter((conv) => conv !== null)
      .sort((a, b) => {
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
    if (!conversationId) {
      console.error("No conversation ID provided to fetchConversationMessages");
      return [];
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true }); // Oldest to newest

    if (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }

    return messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export async function markMessageAsRead(messageId) {
  try {
    if (!messageId) {
      console.error("No message ID provided to markMessageAsRead");
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId)
      .select();

    if (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

export async function checkAndUpdateAchievements(userId) {
  if (!userId) {
    console.error("No user ID provided to checkAndUpdateAchievements");
    return;
  }

  try {
    const info = await fetchUserData(userId);
    if (!info) {
      console.error("Could not fetch user data for ID:", userId);
      return;
    }

    const userAchievements = await fetchUserAchievementsList(userId);
    const userCars = await fetchUserCarsRequest(userId);
    const userBidded = await fetchUserBiddedList(userId);
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
        .filter((bid) => bid && bid.auction_id) // Updated field name
        .map((bid) => bid.auction_id);

      const uniqueAuctions = new Set(userAuctionsParticipated);
      if (uniqueAuctions.size >= 20) addAchievement("Auction Veteran");

      // Safe reduce operation
      const totalSpent = userBidded.reduce((sum, bid) => {
        return (
          sum + (bid && typeof bid.bid_value === "number" ? bid.bid_value : 0) // Updated field name
        );
      }, 0);

      if (totalSpent > 500000) addAchievement("Big Spender");

      // Safe filter operation for first bids
      const validBids = userBidded.filter((bid) => bid && bid.auction_id);
      const uniqueAuctionsFirstBid = new Set(
        validBids
          .filter((bid) => {
            return bid && bid.auction_id;
          })
          .map((bid) => bid.auction_id)
      ).size;

      if (uniqueAuctionsFirstBid >= 5) addAchievement("Early Bird");

      // Safe check for high roller
      if (
        userBidded.some(
          (bid) =>
            bid && typeof bid.bid_value === "number" && bid.bid_value > 100000
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
        const car = userCars.find((userCar) => userCar?.car?.id === carId);
        const carData = car?.car;
        return (
          carData &&
          typeof carData.sell_price === "number" &&
          typeof carData.purchase_price === "number" &&
          carData.sell_price > carData.purchase_price
        );
      });

      if (profitSales) addAchievement("First Profit");
    }

    // Only update if we have new achievements and valid user data
    if (newAchievements.length > 0 && userId) {
      try {
        // Insert new achievements
        const achievementInserts = newAchievements.map((ach) => ({
          user_id: userId,
          name: ach.name,
          date: ach.date,
        }));

        const { error } = await supabase
          .from("achievements")
          .insert(achievementInserts);

        if (error) throw error;

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
