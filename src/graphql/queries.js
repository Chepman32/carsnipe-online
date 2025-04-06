/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      nickname
      money
      cars {
        nextToken
        __typename
      }
      auctions {
        nextToken
        __typename
      }
      email
      bidded {
        auctionId
        bidValue
        timestamp
        __typename
      }
      avatar
      bio
      achievements {
        name
        date
        __typename
      }
      sold
      totalCarsOwned
      totalAuctionsParticipated
      totalBidsPlaced
      totalSpent
      totalAuctionsWon
      totalProfitEarned
      conversations {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nickname
        money
        email
        avatar
        bio
        sold
        totalCarsOwned
        totalAuctionsParticipated
        totalBidsPlaced
        totalSpent
        totalAuctionsWon
        totalProfitEarned
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCar = /* GraphQL */ `
  query GetCar($id: ID!) {
    getCar(id: $id) {
      id
      make
      model
      year
      price
      type
      purchasePrice
      sellPrice
      inAuction
      users {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCars = /* GraphQL */ `
  query ListCars(
    $filter: ModelCarFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCars(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        make
        model
        year
        price
        type
        purchasePrice
        sellPrice
        inAuction
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAuction = /* GraphQL */ `
  query GetAuction($id: ID!) {
    getAuction(id: $id) {
      id
      make
      model
      year
      carId
      currentBid
      endTime
      status
      lastBidPlayer
      player
      buy
      minBid
      type
      user {
        nextToken
        __typename
      }
      bidsCount
      finishedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAuctions = /* GraphQL */ `
  query ListAuctions(
    $filter: ModelAuctionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAuctions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        make
        model
        year
        carId
        currentBid
        endTime
        status
        lastBidPlayer
        player
        buy
        minBid
        type
        bidsCount
        finishedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getConversation = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
      id
      name
      participants {
        nextToken
        __typename
      }
      messages {
        nextToken
        __typename
      }
      lastMessageAt
      lastMessageContent
      lastMessageSenderId
      isGroup
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listConversations = /* GraphQL */ `
  query ListConversations(
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConversations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        isGroup
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      conversationId
      senderId
      content
      timestamp
      read
      conversation {
        id
        name
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        isGroup
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      conversationMessagesId
      __typename
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        conversationId
        senderId
        content
        timestamp
        read
        createdAt
        updatedAt
        conversationMessagesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserCar = /* GraphQL */ `
  query GetUserCar($id: ID!) {
    getUserCar(id: $id) {
      id
      userId
      carId
      user {
        id
        nickname
        money
        email
        avatar
        bio
        sold
        totalCarsOwned
        totalAuctionsParticipated
        totalBidsPlaced
        totalSpent
        totalAuctionsWon
        totalProfitEarned
        createdAt
        updatedAt
        __typename
      }
      car {
        id
        make
        model
        year
        price
        type
        purchasePrice
        sellPrice
        inAuction
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUserCars = /* GraphQL */ `
  query ListUserCars(
    $filter: ModelUserCarFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserCars(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        carId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const userCarsByUserId = /* GraphQL */ `
  query UserCarsByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserCarFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userCarsByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        carId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const userCarsByCarId = /* GraphQL */ `
  query UserCarsByCarId(
    $carId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserCarFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userCarsByCarId(
      carId: $carId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        carId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAuctionUser = /* GraphQL */ `
  query GetAuctionUser($id: ID!) {
    getAuctionUser(id: $id) {
      id
      userId
      auctionId
      user {
        id
        nickname
        money
        email
        avatar
        bio
        sold
        totalCarsOwned
        totalAuctionsParticipated
        totalBidsPlaced
        totalSpent
        totalAuctionsWon
        totalProfitEarned
        createdAt
        updatedAt
        __typename
      }
      auction {
        id
        make
        model
        year
        carId
        currentBid
        endTime
        status
        lastBidPlayer
        player
        buy
        minBid
        type
        bidsCount
        finishedAt
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAuctionUsers = /* GraphQL */ `
  query ListAuctionUsers(
    $filter: ModelAuctionUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAuctionUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        auctionId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const auctionUsersByUserId = /* GraphQL */ `
  query AuctionUsersByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelAuctionUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    auctionUsersByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        auctionId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const auctionUsersByAuctionId = /* GraphQL */ `
  query AuctionUsersByAuctionId(
    $auctionId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelAuctionUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    auctionUsersByAuctionId(
      auctionId: $auctionId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        auctionId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserConversation = /* GraphQL */ `
  query GetUserConversation($id: ID!) {
    getUserConversation(id: $id) {
      id
      userId
      conversationId
      user {
        id
        nickname
        money
        email
        avatar
        bio
        sold
        totalCarsOwned
        totalAuctionsParticipated
        totalBidsPlaced
        totalSpent
        totalAuctionsWon
        totalProfitEarned
        createdAt
        updatedAt
        __typename
      }
      conversation {
        id
        name
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        isGroup
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUserConversations = /* GraphQL */ `
  query ListUserConversations(
    $filter: ModelUserConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserConversations(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        conversationId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const userConversationsByUserId = /* GraphQL */ `
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const userConversationsByConversationId = /* GraphQL */ `
  query UserConversationsByConversationId(
    $conversationId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userConversationsByConversationId(
      conversationId: $conversationId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        conversationId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
