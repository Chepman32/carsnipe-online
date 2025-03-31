const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");

const dynamoDBClient = new DynamoDBClient({ region: "us-east-2" });

exports.handler = async (event) => {
  console.log("Automated auction creation triggered");

  try {
    await deleteExpiredAuctions();

    const randomUser = await getRandomUser();
    if (!randomUser) {
      console.error("No users found in the database");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "No users found in the database" }),
      };
    }

    const randomCar = await getRandomCar();
    if (!randomCar) {
      console.error("No cars found in the database");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "No cars found in the database" }),
      };
    }

    const auctionResult = await createNewAuction(randomUser, randomCar);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Auction created successfully",
        auction: auctionResult,
      }),
    };
  } catch (error) {
    console.error("Error creating automated auction:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating automated auction",
        error: error.message,
      }),
    };
  }
};

async function getRandomUser() {
  try {
    const userTableName = "User-d5sbvamfrnfcdkuamsf6bannaa-staging";
    const scanParams = {
      TableName: userTableName,
    };

    const scanCommand = new ScanCommand(scanParams);
    const tableContent = await dynamoDBClient.send(scanCommand);

    if (!tableContent.Items || tableContent.Items.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * tableContent.Items.length);
    return unmarshall(tableContent.Items[randomIndex]);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

async function getRandomCar() {
  try {
    const carTableName = "Car-d5sbvamfrnfcdkuamsf6bannaa-staging";
    const scanParams = {
      TableName: carTableName,
    };

    const scanCommand = new ScanCommand(scanParams);
    const tableContent = await dynamoDBClient.send(scanCommand);

    if (!tableContent.Items || tableContent.Items.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * tableContent.Items.length);
    return unmarshall(tableContent.Items[randomIndex]);
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
}

async function createNewAuction(user, car) {
  const auctionDurationHours = Math.floor(Math.random() * 24) + 1;
  const auctionDurationSeconds = auctionDurationHours * 60 * 60;

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const endTime = currentTimeInSeconds + auctionDurationSeconds;

  const minBidPercentages = [30, 40, 50, 60, 70, 80, 100];
  const randomPercentageIndex = Math.floor(
    Math.random() * minBidPercentages.length
  );
  const minBidPercentage = minBidPercentages[randomPercentageIndex];

  const minBid = Math.floor((car.price * minBidPercentage) / 100);

  const auctionId = uuidv4();
  const timestamp = new Date().toISOString();

  const auction = {
    id: auctionId,
    make: car.make,
    model: car.model,
    year: car.year,
    type: car.type || "Unknown",
    carId: car.id,
    currentBid: 0,
    endTime: endTime.toString(),
    status: "Active",
    lastBidPlayer: "",
    player: user.nickname || "Anonymous",
    buy: car.price,
    minBid: minBid,
    bidsCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const auctionTableName = "Auction-d5sbvamfrnfcdkuamsf6bannaa-staging";
  const auctionUserTableName = "AuctionUser-d5sbvamfrnfcdkuamsf6bannaa-staging";

  try {
    const putParams = {
      TableName: auctionTableName,
      Item: marshall(auction),
    };

    const putCommand = new PutItemCommand(putParams);
    await dynamoDBClient.send(putCommand);

    const auctionUser = {
      id: uuidv4(),
      auctionId: auctionId,
      userId: user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const auctionUserParams = {
      TableName: auctionUserTableName,
      Item: marshall(auctionUser),
    };

    const auctionUserCommand = new PutItemCommand(auctionUserParams);
    await dynamoDBClient.send(auctionUserCommand);

    return auction;
  } catch (error) {
    console.error("Error creating auction:", error);
    throw error;
  }
}

async function deleteExpiredAuctions() {
  try {
    const auctionTableName = "Auction-d5sbvamfrnfcdkuamsf6bannaa-staging";
    const scanParams = {
      TableName: auctionTableName,
    };

    const scanCommand = new ScanCommand(scanParams);
    const tableContent = await dynamoDBClient.send(scanCommand);

    if (!tableContent.Items || tableContent.Items.length === 0) {
      return;
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const oneMinuteInSeconds = 60;

    for (const item of tableContent.Items) {
      const auction = unmarshall(item);

      if (parseInt(auction.currentBid) === parseInt(auction.buy)) {
        // Delete the auction immediately if the buy price is met
        const deleteParams = {
          TableName: auctionTableName,
          Key: { id: { S: auction.id } },
        };

        const deleteCommand = new DeleteItemCommand(deleteParams);
        await dynamoDBClient.send(deleteCommand);
        continue;
      }

      if (parseInt(auction.endTime) < currentTimeInSeconds) {
        if (auction.status !== "Finished") {
          // Mark the auction as "Finished" and set finishedAt timestamp
          const updateParams = {
            TableName: auctionTableName,
            Key: { id: { S: auction.id } },
            UpdateExpression: "SET #status = :status, #finishedAt = :finishedAt",
            ExpressionAttributeNames: {
              "#status": "status",
              "#finishedAt": "finishedAt",
            },
            ExpressionAttributeValues: {
              ":status": { S: "Finished" },
              ":finishedAt": { N: currentTimeInSeconds.toString() },
            },
          };

          const updateCommand = new PutItemCommand(updateParams);
          await dynamoDBClient.send(updateCommand);
        } else if (
          auction.finishedAt &&
          parseInt(auction.finishedAt) + oneMinuteInSeconds < currentTimeInSeconds
        ) {
          // Delete the auction if it has been finished for over a minute
          const deleteParams = {
            TableName: auctionTableName,
            Key: { id: { S: auction.id } },
          };

          const deleteCommand = new DeleteItemCommand(deleteParams);
          await dynamoDBClient.send(deleteCommand);
        }
      }
    }
  } catch (error) {
    console.error("Error handling expired auctions:", error);
  }
}