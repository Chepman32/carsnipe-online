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
        __typename
      }
      avatar
      bio
      achievements {
        name
        date
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
        createdAt
        updatedAt
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
