/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateAuction = /* GraphQL */ `
  subscription OnCreateAuction($filter: ModelSubscriptionAuctionFilterInput) {
    onCreateAuction(filter: $filter) {
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
export const onUpdateAuction = /* GraphQL */ `
  subscription OnUpdateAuction($filter: ModelSubscriptionAuctionFilterInput) {
    onUpdateAuction(filter: $filter) {
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
export const onDeleteAuction = /* GraphQL */ `
  subscription OnDeleteAuction($filter: ModelSubscriptionAuctionFilterInput) {
    onDeleteAuction(filter: $filter) {
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
export const onCreateCar = /* GraphQL */ `
  subscription OnCreateCar($filter: ModelSubscriptionCarFilterInput) {
    onCreateCar(filter: $filter) {
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
export const onUpdateCar = /* GraphQL */ `
  subscription OnUpdateCar($filter: ModelSubscriptionCarFilterInput) {
    onUpdateCar(filter: $filter) {
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
export const onDeleteCar = /* GraphQL */ `
  subscription OnDeleteCar($filter: ModelSubscriptionCarFilterInput) {
    onDeleteCar(filter: $filter) {
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
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onCreateMessage(filter: $filter) {
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
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onUpdateMessage(filter: $filter) {
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
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage($filter: ModelSubscriptionMessageFilterInput) {
    onDeleteMessage(filter: $filter) {
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
export const onCreateConversation = /* GraphQL */ `
  subscription OnCreateConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onCreateConversation(filter: $filter) {
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
export const onUpdateConversation = /* GraphQL */ `
  subscription OnUpdateConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onUpdateConversation(filter: $filter) {
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
export const onDeleteConversation = /* GraphQL */ `
  subscription OnDeleteConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onDeleteConversation(filter: $filter) {
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
export const onCreateUserCar = /* GraphQL */ `
  subscription OnCreateUserCar($filter: ModelSubscriptionUserCarFilterInput) {
    onCreateUserCar(filter: $filter) {
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
export const onUpdateUserCar = /* GraphQL */ `
  subscription OnUpdateUserCar($filter: ModelSubscriptionUserCarFilterInput) {
    onUpdateUserCar(filter: $filter) {
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
export const onDeleteUserCar = /* GraphQL */ `
  subscription OnDeleteUserCar($filter: ModelSubscriptionUserCarFilterInput) {
    onDeleteUserCar(filter: $filter) {
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
export const onCreateAuctionUser = /* GraphQL */ `
  subscription OnCreateAuctionUser(
    $filter: ModelSubscriptionAuctionUserFilterInput
  ) {
    onCreateAuctionUser(filter: $filter) {
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
export const onUpdateAuctionUser = /* GraphQL */ `
  subscription OnUpdateAuctionUser(
    $filter: ModelSubscriptionAuctionUserFilterInput
  ) {
    onUpdateAuctionUser(filter: $filter) {
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
export const onDeleteAuctionUser = /* GraphQL */ `
  subscription OnDeleteAuctionUser(
    $filter: ModelSubscriptionAuctionUserFilterInput
  ) {
    onDeleteAuctionUser(filter: $filter) {
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
export const onCreateUserConversation = /* GraphQL */ `
  subscription OnCreateUserConversation(
    $filter: ModelSubscriptionUserConversationFilterInput
  ) {
    onCreateUserConversation(filter: $filter) {
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
export const onUpdateUserConversation = /* GraphQL */ `
  subscription OnUpdateUserConversation(
    $filter: ModelSubscriptionUserConversationFilterInput
  ) {
    onUpdateUserConversation(filter: $filter) {
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
export const onDeleteUserConversation = /* GraphQL */ `
  subscription OnDeleteUserConversation(
    $filter: ModelSubscriptionUserConversationFilterInput
  ) {
    onDeleteUserConversation(filter: $filter) {
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
