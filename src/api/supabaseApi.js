import { supabase } from '../supabase';

// ============================================================================
// USERS API
// ============================================================================

export const getUser = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_cars (
          cars (*)
        ),
        auction_users (
          auctions (*)
        ),
        user_conversations (
          conversations (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

export const listUsers = async (filters = {}, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        nickname: userData.nickname,
        email: userData.email,
        money: userData.money || 100000,
        avatar: userData.avatar || 'avatar1',
        bio: userData.bio || '',
        is_mock: userData.isMock || false,
        ...userData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const updateData = {
      ...userData,
      updated_at: new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (userData.totalCarsOwned !== undefined) {
      updateData.total_cars_owned = userData.totalCarsOwned;
      delete updateData.totalCarsOwned;
    }
    if (userData.totalAuctionsParticipated !== undefined) {
      updateData.total_auctions_participated = userData.totalAuctionsParticipated;
      delete updateData.totalAuctionsParticipated;
    }
    if (userData.totalBidsPlaced !== undefined) {
      updateData.total_bids_placed = userData.totalBidsPlaced;
      delete updateData.totalBidsPlaced;
    }
    if (userData.totalSpent !== undefined) {
      updateData.total_spent = userData.totalSpent;
      delete updateData.totalSpent;
    }
    if (userData.totalAuctionsWon !== undefined) {
      updateData.total_auctions_won = userData.totalAuctionsWon;
      delete updateData.totalAuctionsWon;
    }
    if (userData.totalProfitEarned !== undefined) {
      updateData.total_profit_earned = userData.totalProfitEarned;
      delete updateData.totalProfitEarned;
    }
    if (userData.isMock !== undefined) {
      updateData.is_mock = userData.isMock;
      delete updateData.isMock;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ============================================================================
// CARS API
// ============================================================================

export const getCar = async (id) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        user_cars (
          users (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting car:', error);
    throw error;
  }
};

export const listCars = async (filters = {}, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('cars')
      .select('*')
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'inAuction') {
          query = query.eq('in_auction', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing cars:', error);
    throw error;
  }
};

export const createCar = async (carData) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .insert([{
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        type: carData.type,
        purchase_price: carData.purchasePrice,
        sell_price: carData.sellPrice,
        in_auction: carData.inAuction || false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
};

export const updateCar = async (id, carData) => {
  try {
    const updateData = {
      ...carData,
      updated_at: new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (carData.purchasePrice !== undefined) {
      updateData.purchase_price = carData.purchasePrice;
      delete updateData.purchasePrice;
    }
    if (carData.sellPrice !== undefined) {
      updateData.sell_price = carData.sellPrice;
      delete updateData.sellPrice;
    }
    if (carData.inAuction !== undefined) {
      updateData.in_auction = carData.inAuction;
      delete updateData.inAuction;
    }

    const { data, error } = await supabase
      .from('cars')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

export const deleteCar = async (id) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

// ============================================================================
// AUCTIONS API
// ============================================================================

export const getAuction = async (id) => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        auction_users (
          users (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting auction:', error);
    throw error;
  }
};

export const listAuctions = async (filters = {}, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('auctions')
      .select('*')
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'currentBid') {
          query = query.eq('current_bid', value);
        } else if (key === 'endTime') {
          query = query.eq('end_time', value);
        } else if (key === 'lastBidPlayer') {
          query = query.eq('last_bid_player', value);
        } else if (key === 'minBid') {
          query = query.eq('min_bid', value);
        } else if (key === 'bidsCount') {
          query = query.eq('bids_count', value);
        } else if (key === 'finishedAt') {
          query = query.eq('finished_at', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing auctions:', error);
    throw error;
  }
};

export const createAuction = async (auctionData) => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .insert([{
        make: auctionData.make,
        model: auctionData.model,
        year: auctionData.year,
        car_id: auctionData.carId,
        current_bid: auctionData.currentBid,
        end_time: auctionData.endTime,
        status: auctionData.status,
        last_bid_player: auctionData.lastBidPlayer,
        player: auctionData.player,
        buy: auctionData.buy,
        min_bid: auctionData.minBid,
        type: auctionData.type,
        bids_count: auctionData.bidsCount || 0,
        finished_at: auctionData.finishedAt
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating auction:', error);
    throw error;
  }
};

export const updateAuction = async (id, auctionData) => {
  try {
    const updateData = {
      ...auctionData,
      updated_at: new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (auctionData.carId !== undefined) {
      updateData.car_id = auctionData.carId;
      delete updateData.carId;
    }
    if (auctionData.currentBid !== undefined) {
      updateData.current_bid = auctionData.currentBid;
      delete updateData.currentBid;
    }
    if (auctionData.endTime !== undefined) {
      updateData.end_time = auctionData.endTime;
      delete updateData.endTime;
    }
    if (auctionData.lastBidPlayer !== undefined) {
      updateData.last_bid_player = auctionData.lastBidPlayer;
      delete updateData.lastBidPlayer;
    }
    if (auctionData.minBid !== undefined) {
      updateData.min_bid = auctionData.minBid;
      delete updateData.minBid;
    }
    if (auctionData.bidsCount !== undefined) {
      updateData.bids_count = auctionData.bidsCount;
      delete updateData.bidsCount;
    }
    if (auctionData.finishedAt !== undefined) {
      updateData.finished_at = auctionData.finishedAt;
      delete updateData.finishedAt;
    }

    const { data, error } = await supabase
      .from('auctions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating auction:', error);
    throw error;
  }
};

export const deleteAuction = async (id) => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting auction:', error);
    throw error;
  }
};

// ============================================================================
// CONVERSATIONS API
// ============================================================================

export const getConversation = async (id) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user_conversations (
          users (*)
        ),
        messages (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const listConversations = async (filters = {}, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('conversations')
      .select('*')
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'lastMessageAt') {
          query = query.eq('last_message_at', value);
        } else if (key === 'lastMessageContent') {
          query = query.eq('last_message_content', value);
        } else if (key === 'lastMessageSenderId') {
          query = query.eq('last_message_sender_id', value);
        } else if (key === 'isGroup') {
          query = query.eq('is_group', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing conversations:', error);
    throw error;
  }
};

export const createConversation = async (conversationData) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        name: conversationData.name,
        last_message_at: conversationData.lastMessageAt,
        last_message_content: conversationData.lastMessageContent,
        last_message_sender_id: conversationData.lastMessageSenderId,
        is_group: conversationData.isGroup || false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const updateConversation = async (id, conversationData) => {
  try {
    const updateData = {
      ...conversationData,
      updated_at: new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (conversationData.lastMessageAt !== undefined) {
      updateData.last_message_at = conversationData.lastMessageAt;
      delete updateData.lastMessageAt;
    }
    if (conversationData.lastMessageContent !== undefined) {
      updateData.last_message_content = conversationData.lastMessageContent;
      delete updateData.lastMessageContent;
    }
    if (conversationData.lastMessageSenderId !== undefined) {
      updateData.last_message_sender_id = conversationData.lastMessageSenderId;
      delete updateData.lastMessageSenderId;
    }
    if (conversationData.isGroup !== undefined) {
      updateData.is_group = conversationData.isGroup;
      delete updateData.isGroup;
    }

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export const deleteConversation = async (id) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// ============================================================================
// MESSAGES API
// ============================================================================

export const getMessage = async (id) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        conversations (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
};

export const listMessages = async (filters = {}, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'conversationId') {
          query = query.eq('conversation_id', value);
        } else if (key === 'senderId') {
          query = query.eq('sender_id', value);
        } else if (key === 'isEvent') {
          query = query.eq('is_event', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing messages:', error);
    throw error;
  }
};

export const createMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: messageData.conversationId,
        sender_id: messageData.senderId,
        content: messageData.content,
        timestamp: messageData.timestamp,
        read: messageData.read || false,
        is_event: messageData.isEvent || false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

export const updateMessage = async (id, messageData) => {
  try {
    const updateData = {
      ...messageData,
      updated_at: new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (messageData.conversationId !== undefined) {
      updateData.conversation_id = messageData.conversationId;
      delete updateData.conversationId;
    }
    if (messageData.senderId !== undefined) {
      updateData.sender_id = messageData.senderId;
      delete updateData.senderId;
    }
    if (messageData.isEvent !== undefined) {
      updateData.is_event = messageData.isEvent;
      delete updateData.isEvent;
    }

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const deleteMessage = async (id) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// ============================================================================
// JUNCTION TABLES API
// ============================================================================

// User-Car relationships
export const getUserCars = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_cars')
      .select(`
        *,
        cars (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user cars:', error);
    throw error;
  }
};

export const createUserCar = async (userId, carId) => {
  try {
    const { data, error } = await supabase
      .from('user_cars')
      .insert([{
        user_id: userId,
        car_id: carId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user car relationship:', error);
    throw error;
  }
};

export const deleteUserCar = async (userId, carId) => {
  try {
    const { data, error } = await supabase
      .from('user_cars')
      .delete()
      .eq('user_id', userId)
      .eq('car_id', carId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting user car relationship:', error);
    throw error;
  }
};

// User-Auction relationships
export const getUserAuctions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('auction_users')
      .select(`
        *,
        auctions (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user auctions:', error);
    throw error;
  }
};

export const createAuctionUser = async (userId, auctionId) => {
  try {
    const { data, error } = await supabase
      .from('auction_users')
      .insert([{
        user_id: userId,
        auction_id: auctionId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating auction user relationship:', error);
    throw error;
  }
};

export const deleteAuctionUser = async (userId, auctionId) => {
  try {
    const { data, error } = await supabase
      .from('auction_users')
      .delete()
      .eq('user_id', userId)
      .eq('auction_id', auctionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting auction user relationship:', error);
    throw error;
  }
};

// User-Conversation relationships
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_conversations')
      .select(`
        *,
        conversations (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

export const createUserConversation = async (userId, conversationId) => {
  try {
    const { data, error } = await supabase
      .from('user_conversations')
      .insert([{
        user_id: userId,
        conversation_id: conversationId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user conversation relationship:', error);
    throw error;
  }
};

export const deleteUserConversation = async (userId, conversationId) => {
  try {
    const { data, error } = await supabase
      .from('user_conversations')
      .delete()
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting user conversation relationship:', error);
    throw error;
  }
};

// ============================================================================
// BID INFO API
// ============================================================================

export const getUserBids = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bid_info')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user bids:', error);
    throw error;
  }
};

export const createBidInfo = async (bidData) => {
  try {
    const { data, error } = await supabase
      .from('bid_info')
      .insert([{
        user_id: bidData.userId,
        auction_id: bidData.auctionId,
        bid_value: bidData.bidValue,
        timestamp: bidData.timestamp
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating bid info:', error);
    throw error;
  }
};

// ============================================================================
// ACHIEVEMENTS API
// ============================================================================

export const getUserAchievements = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
};

export const createAchievement = async (achievementData) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert([{
        user_id: achievementData.userId,
        name: achievementData.name,
        date: achievementData.date
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating achievement:', error);
    throw error;
  }
};

export const deleteAchievement = async (id) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }
};