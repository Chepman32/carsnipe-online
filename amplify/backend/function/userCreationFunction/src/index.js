const {
    DynamoDBClient,
    ScanCommand,
    PutItemCommand
  } = require("@aws-sdk/client-dynamodb");
  const { marshall } = require("@aws-sdk/util-dynamodb");
  const { v4: uuidv4 } = require("uuid");
  const mockUsers = require("./mockUsers.json");
  
  const dynamoDBClient = new DynamoDBClient({ region: "us-east-2" });
  const userTableName = "User-d5sbvamfrnfcdkuamsf6bannaa-staging";
  
  exports.handler = async () => {
    console.log("Creating mock user...");
  
    try {
      const existingEmails = await getAllEmails();
  
      for (const mock of mockUsers) {
        if (!existingEmails.has(mock.email)) {
          const createdUser = await createMockUser(mock.nickname, mock.email);
          console.log("Created mock user:", createdUser);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Mock user created", user: createdUser }),
          };
        }
      }
  
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "No unused mock emails available" }),
      };
    } catch (error) {
      console.error("Error creating mock user:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error", error: error.message }),
      };
    }
  };
  
  async function getAllEmails() {
    const scanParams = { TableName: userTableName };
    const scanCommand = new ScanCommand(scanParams);
    const response = await dynamoDBClient.send(scanCommand);
  
    const emails = new Set();
    (response.Items || []).forEach(item => {
      if (item.email?.S) {
        emails.add(item.email.S);
      }
    });
  
    return emails;
  }
  
  async function createMockUser(nickname, email) {
    const timestamp = new Date().toISOString();
    const randomAvatar = `avatar${Math.floor(Math.random() * 72) + 1}`;
  
    const user = {
      id: uuidv4(),
      nickname,
      email,
      money: 100000,
      bidded: [],
      avatar: randomAvatar,
      bio: "",
      achievements: [],
      sold: [],
      totalCarsOwned: 0,
      totalAuctionsParticipated: 0,
      totalBidsPlaced: 0,
      totalSpent: 0,
      totalAuctionsWon: 0,
      totalProfitEarned: 0,
      isMock: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  
    const putParams = {
      TableName: userTableName,
      Item: marshall(user),
    };
  
    await dynamoDBClient.send(new PutItemCommand(putParams));
    return user;
  }