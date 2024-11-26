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
export const onUpdateCar = /* GraphQL */ `
  subscription OnUpdateCar($filter: ModelSubscriptionCarFilterInput) {
    onUpdateCar(filter: $filter) {
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
export const onDeleteCar = /* GraphQL */ `
  subscription OnDeleteCar($filter: ModelSubscriptionCarFilterInput) {
    onDeleteCar(filter: $filter) {
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
      bidsCount
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
      bidsCount
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
      bidsCount
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
