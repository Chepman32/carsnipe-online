const { DynamoDBClient, ListTablesCommand, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoDBClient = new DynamoDBClient({});

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Step 1: Extract email and payment amount from the event
    const eventBody = JSON.parse(event.body);
    const email = eventBody?.data?.object?.customer_details?.email;
    let paymentAmount = eventBody?.data?.object?.amount_total;

    // Fix the payment amount mapping logic
    if (paymentAmount === 199) {
      paymentAmount = 2000;
    } else if (paymentAmount === 449) {
      paymentAmount = 5000;
    } else if (paymentAmount === 899) {
      paymentAmount = 15000;
    } else if (paymentAmount === 1999) {
      paymentAmount = 25000;
    } else if (paymentAmount === 4499) {
      paymentAmount = 50000;
    } else if (paymentAmount === 8999) {
      paymentAmount = 100000;
    }
    else {
      paymentAmount = 0;
    }

    if (!email || !paymentAmount) {
      console.log('Email or payment amount is missing in the event body.');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email or payment amount missing' }),
      };
    }

    console.log('Extracted email:', email);
    console.log('Extracted payment amount:', eventBody?.data?.object?.amount_total);

    // Step 2: List all DynamoDB tables
    const listTablesCommand = new ListTablesCommand({});
    const tablesResponse = await dynamoDBClient.send(listTablesCommand);
    const tableNames = tablesResponse.TableNames;

    let usersUpdated = [];

    // Step 3: Scan each table to find users with the matching email
    for (const tableName of tableNames) {
      console.log(`Scanning table: ${tableName}`);
      const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: marshall({ ":email": email })
      });
      const tableContent = await dynamoDBClient.send(scanCommand);

      if (tableContent.Items && tableContent.Items.length > 0) {
        for (const item of tableContent.Items) {
          const user = unmarshall(item);
          console.log(`Found user with matching email (email) in table ${tableName}:`, user);

          // Step 4: Update the user's money field
          const newMoneyValue = (user.money || 0) + paymentAmount;
          const updateCommand = new UpdateItemCommand({
            TableName: tableName,
            Key: marshall({ id: user.id }), // Ensure 'id' is the correct key
            UpdateExpression: 'SET money = :newMoney',
            ExpressionAttributeValues: marshall({ ':newMoney': newMoneyValue }),
          });
          await dynamoDBClient.send(updateCommand);
          console.log(`Updated user's money to ${newMoneyValue}`);

          // Add to updated users list for logging
          usersUpdated.push({ ...user, money: newMoneyValue });
        }
      }
    }

    if (usersUpdated.length > 0) {
      console.log('Users updated:', JSON.stringify(usersUpdated, null, 2));
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Users money updated successfully', users: usersUpdated }),
      };
    } else {
      console.log('No matching user found in any of the tables.');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No matching user found' }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred' }),
    };
  }
};
