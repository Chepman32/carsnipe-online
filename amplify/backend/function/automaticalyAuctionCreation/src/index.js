const { DynamoDBClient, ScanCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");

// Initialize DynamoDB client with explicit region
const dynamoDBClient = new DynamoDBClient({ region: "us-east-2" });

exports.handler = async (event) => {
    console.log("Automated auction creation triggered");

    try {
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
        const userTableName = "User-d6zkh67iufdejfmae42vhabyoq-dev";
        console.log("Scanning user table:", userTableName); // Log table name for debugging
        const scanParams = {
            TableName: userTableName,
        };

        const scanCommand = new ScanCommand(scanParams);
        const tableContent = await dynamoDBClient.send(scanCommand);

        if (!tableContent.Items || tableContent.Items.length === 0) {
            console.log("No users found in table");
            return null;
        }

        const randomIndex = Math.floor(Math.random() * tableContent.Items.length);
        const randomUser = unmarshall(tableContent.Items[randomIndex]);

        console.log("Selected random user:", randomUser);
        return randomUser;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

async function getRandomCar() {
    try {
        const carTableName = "Car-d6zkh67iufdejfmae42vhabyoq-dev";
        console.log("Scanning car table:", carTableName); // Log table name for debugging
        const scanParams = {
            TableName: carTableName,
        };

        const scanCommand = new ScanCommand(scanParams);
        const tableContent = await dynamoDBClient.send(scanCommand);

        if (!tableContent.Items || tableContent.Items.length === 0) {
            console.log("No cars found in table");
            return null;
        }

        const randomIndex = Math.floor(Math.random() * tableContent.Items.length);
        const randomCar = unmarshall(tableContent.Items[randomIndex]);

        console.log("Selected random car:", randomCar);
        return randomCar;
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
    const randomPercentageIndex = Math.floor(Math.random() * minBidPercentages.length);
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

    const auctionTableName = "Auction-d6zkh67iufdejfmae42vhabyoq-staging";
    const auctionUserTableName = "AuctionUser-d6zkh67iufdejfmae42vhabyoq-staging";
    console.log("Creating auction in table:", auctionTableName); // Log table name for debugging
    console.log("Creating auction user in table:", auctionUserTableName); // Log table name for debugging

    try {
        const putParams = {
            TableName: auctionTableName,
            Item: marshall(auction),
        };

        const putCommand = new PutItemCommand(putParams);
        await dynamoDBClient.send(putCommand);

        console.log("Auction created successfully:", auction);

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

        console.log("AuctionUser relationship created:", auctionUser);

        return auction;
    } catch (error) {
        console.error("Error creating auction:", error);
        throw error;
    }
}