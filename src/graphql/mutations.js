/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
        __typename
      }
      avatar
      bio
      achievements {
        name
        date
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
        __typename
      }
      avatar
      bio
      achievements {
        name
        date
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
        __typename
      }
      avatar
      bio
      achievements {
        name
        date
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
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
export const createAuction = /* GraphQL */ `
  mutation CreateAuction(
    $input: CreateAuctionInput!
    $condition: ModelAuctionConditionInput
  ) {
    createAuction(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAuction = /* GraphQL */ `
  mutation UpdateAuction(
    $input: UpdateAuctionInput!
    $condition: ModelAuctionConditionInput
  ) {
    updateAuction(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAuction = /* GraphQL */ `
  mutation DeleteAuction(
    $input: DeleteAuctionInput!
    $condition: ModelAuctionConditionInput
  ) {
    deleteAuction(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCar = /* GraphQL */ `
  mutation CreateCar(
    $input: CreateCarInput!
    $condition: ModelCarConditionInput
  ) {
    createCar(input: $input, condition: $condition) {
      id
      make
      model
      year
      price
      type
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
export const updateCar = /* GraphQL */ `
  mutation UpdateCar(
    $input: UpdateCarInput!
    $condition: ModelCarConditionInput
  ) {
    updateCar(input: $input, condition: $condition) {
      id
      make
      model
      year
      price
      type
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
export const deleteCar = /* GraphQL */ `
  mutation DeleteCar(
    $input: DeleteCarInput!
    $condition: ModelCarConditionInput
  ) {
    deleteCar(input: $input, condition: $condition) {
      id
      make
      model
      year
      price
      type
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      content
      senderId
      receiverId
      timestamp
      conversation {
        id
        lastMessageTimestamp
        createdAt
        updatedAt
        __typename
      }
      conversationMessagesId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
      id
      content
      senderId
      receiverId
      timestamp
      conversation {
        id
        lastMessageTimestamp
        createdAt
        updatedAt
        __typename
      }
      conversationMessagesId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
      id
      content
      senderId
      receiverId
      timestamp
      conversation {
        id
        lastMessageTimestamp
        createdAt
        updatedAt
        __typename
      }
      conversationMessagesId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createConversation = /* GraphQL */ `
  mutation CreateConversation(
    $input: CreateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    createConversation(input: $input, condition: $condition) {
      id
      participants {
        nextToken
        __typename
      }
      messages {
        nextToken
        __typename
      }
      lastMessageTimestamp
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation(
    $input: UpdateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    updateConversation(input: $input, condition: $condition) {
      id
      participants {
        nextToken
        __typename
      }
      messages {
        nextToken
        __typename
      }
      lastMessageTimestamp
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteConversation = /* GraphQL */ `
  mutation DeleteConversation(
    $input: DeleteConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    deleteConversation(input: $input, condition: $condition) {
      id
      participants {
        nextToken
        __typename
      }
      messages {
        nextToken
        __typename
      }
      lastMessageTimestamp
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createUserCar = /* GraphQL */ `
  mutation CreateUserCar(
    $input: CreateUserCarInput!
    $condition: ModelUserCarConditionInput
  ) {
    createUserCar(input: $input, condition: $condition) {
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
export const updateUserCar = /* GraphQL */ `
  mutation UpdateUserCar(
    $input: UpdateUserCarInput!
    $condition: ModelUserCarConditionInput
  ) {
    updateUserCar(input: $input, condition: $condition) {
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
export const deleteUserCar = /* GraphQL */ `
  mutation DeleteUserCar(
    $input: DeleteUserCarInput!
    $condition: ModelUserCarConditionInput
  ) {
    deleteUserCar(input: $input, condition: $condition) {
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
export const createAuctionUser = /* GraphQL */ `
  mutation CreateAuctionUser(
    $input: CreateAuctionUserInput!
    $condition: ModelAuctionUserConditionInput
  ) {
    createAuctionUser(input: $input, condition: $condition) {
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
export const updateAuctionUser = /* GraphQL */ `
  mutation UpdateAuctionUser(
    $input: UpdateAuctionUserInput!
    $condition: ModelAuctionUserConditionInput
  ) {
    updateAuctionUser(input: $input, condition: $condition) {
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
export const deleteAuctionUser = /* GraphQL */ `
  mutation DeleteAuctionUser(
    $input: DeleteAuctionUserInput!
    $condition: ModelAuctionUserConditionInput
  ) {
    deleteAuctionUser(input: $input, condition: $condition) {
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
export const createUserConversation = /* GraphQL */ `
  mutation CreateUserConversation(
    $input: CreateUserConversationInput!
    $condition: ModelUserConversationConditionInput
  ) {
    createUserConversation(input: $input, condition: $condition) {
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
        createdAt
        updatedAt
        __typename
      }
      conversation {
        id
        lastMessageTimestamp
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
export const updateUserConversation = /* GraphQL */ `
  mutation UpdateUserConversation(
    $input: UpdateUserConversationInput!
    $condition: ModelUserConversationConditionInput
  ) {
    updateUserConversation(input: $input, condition: $condition) {
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
        createdAt
        updatedAt
        __typename
      }
      conversation {
        id
        lastMessageTimestamp
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
export const deleteUserConversation = /* GraphQL */ `
  mutation DeleteUserConversation(
    $input: DeleteUserConversationInput!
    $condition: ModelUserConversationConditionInput
  ) {
    deleteUserConversation(input: $input, condition: $condition) {
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
        createdAt
        updatedAt
        __typename
      }
      conversation {
        id
        lastMessageTimestamp
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
