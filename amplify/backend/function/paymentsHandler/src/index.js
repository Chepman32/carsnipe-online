const {
    DynamoDBClient,
    ListTablesCommand,
    ScanCommand,
    UpdateItemCommand,
  } = require("@aws-sdk/client-dynamodb");
  const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
  
  const dynamoDBClient = new DynamoDBClient({});
  
  exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
  
    try {
      // Step 1: Parse event and extract email and payment amount
      const eventBody = JSON.parse(event.body);
      const email = eventBody?.data?.object?.customer_details?.email;
      const amountTotal = eventBody?.data?.object?.amount_total;
  
      // Map payment amount to in-game currency
      const paymentMapping = {
        199: 50000,    // $1.99 -> 50,000 credits
        399: 100000,   // $3.99 -> 100,000 credits
        699: 200000,   // $6.99 -> 200,000 credits
        1099: 300000,  // $10.99 -> 300,000 credits
        1599: 500000,  // $15.99 -> 500,000 credits
        2599: 1000000  // $25.99 -> 1,000,000 credits
      };
  
      const paymentAmount = paymentMapping[amountTotal] || 0;
  
      if (!email || paymentAmount === 0) {
        console.error(
          `Invalid email or payment amount. Email: ${email}, Amount: ${amountTotal}`
        );
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Email or valid payment amount missing",
          }),
        };
      }
  
      console.log("Extracted email:", email);
      console.log("Mapped payment amount:", paymentAmount);
  
      // Step 2: Get the list of DynamoDB tables
      let tableNames = [];
      try {
        const listTablesCommand = new ListTablesCommand({});
        const tablesResponse = await dynamoDBClient.send(listTablesCommand);
        tableNames = tablesResponse.TableNames || [];
      } catch (listError) {
        console.error("Error listing DynamoDB tables:", listError);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Failed to list DynamoDB tables",
          }),
        };
      }
  
      console.log("Available tables:", tableNames);
  
      let usersUpdated = [];
  
      // Step 3: Scan tables for matching email and update money
      for (const tableName of tableNames) {
        try {
          console.log(`Scanning table: ${tableName}`);
          const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: marshall({ ":email": email }),
          });
          const tableContent = await dynamoDBClient.send(scanCommand);
  
          if (tableContent.Items && tableContent.Items.length > 0) {
            for (const item of tableContent.Items) {
              const user = unmarshall(item);
              console.log(
                `Found user with matching email in table ${tableName}:`,
                user
              );
  
              // Update user's money field
              const newMoneyValue = (user.money || 0) + paymentAmount;
              const updateCommand = new UpdateItemCommand({
                TableName: tableName,
                Key: marshall({ id: user.id }), // Adjust key field as per your table schema
                UpdateExpression: "SET money = :newMoney",
                ExpressionAttributeValues: marshall({
                  ":newMoney": newMoneyValue,
                }),
              });
              await dynamoDBClient.send(updateCommand);
              console.log(`Updated user's money to ${newMoneyValue}`);
  
              // Add to updated users list
              usersUpdated.push({ ...user, money: newMoneyValue });
            }
          }
        } catch (scanOrUpdateError) {
          console.error(`Error processing table ${tableName}:`, scanOrUpdateError);
        }
      }
  
      // Step 4: Return response
      if (usersUpdated.length > 0) {
        console.log("Users updated:", JSON.stringify(usersUpdated, null, 2));
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Users' money updated successfully",
            users: usersUpdated,
          }),
        };
      } else {
        console.log("No matching user found in any of the tables.");
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "No matching user found" }),
        };
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "An unexpected error occurred",
          error: error.message,
        }),
      };
    }
  };