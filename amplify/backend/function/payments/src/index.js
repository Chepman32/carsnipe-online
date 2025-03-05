const { DynamoDBClient, ListTablesCommand, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const dynamoDBClient = new DynamoDBClient({});

exports.handler = async (event) => {
    console.log('Received raw event:', JSON.stringify(event, null, 2));

    let eventBody;

    try {
        if (event.body) {
            eventBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        } else if (event) {
            eventBody = event;
        } else {
            console.error('Error: event.body and event are both undefined');
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Malformed event data received from webhook.' })
            };
        }

        console.log('Parsed event body:', JSON.stringify(eventBody, null, 2));

        if (!eventBody || eventBody.type !== 'checkout.session.completed') {
            console.log('Not a checkout.session.completed event or eventBody.type is missing, ignoring');
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Not a checkout event' })
            };
        }

        const email = eventBody?.data?.object?.customer_details?.email?.trim().toLowerCase();
        let paymentAmount = eventBody?.data?.object?.amount_total;

        switch (paymentAmount) {
            case 199: paymentAmount = 50000; break;
            case 399: paymentAmount = 100000; break;
            case 699: paymentAmount = 200000; break;
            case 1099: paymentAmount = 300000; break;
            case 1599: paymentAmount = 500000; break;
            case 2599: paymentAmount = 1000000; break;
            default: paymentAmount = 0;
        }

        if (!email || paymentAmount === 0) {
            console.warn('Email or payment amount is missing or invalid:', {
                email,
                originalAmount: eventBody?.data?.object?.amount_total,
                mappedAmount: paymentAmount
            });
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Email or payment amount missing or invalid',
                    debug: {
                        receivedEmail: email,
                        receivedAmount: eventBody?.data?.object?.amount_total
                    }
                }),
            };
        }

        console.log('Processing payment:', {
            email,
            originalAmount: eventBody?.data?.object?.amount_total,
            mappedAmount: paymentAmount
        });

        const listTablesCommand = new ListTablesCommand({});
        const tablesResponse = await dynamoDBClient.send(listTablesCommand);
        const userTables = tablesResponse.TableNames.filter(name => name.startsWith('User'));

        if (userTables.length === 0) {
            console.warn('No User tables found');
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'No User tables found in DynamoDB' })
            };
        }

        let usersUpdated = [];

        for (const tableName of userTables) {
            console.log(`Scanning table: ${tableName}`);
            let lastEvaluatedKey;

            do {
                const scanCommand = new ScanCommand({
                    TableName: tableName,
                    FilterExpression: "email = :email",
                    ExpressionAttributeValues: marshall({ ":email": email }),
                    ExclusiveStartKey: lastEvaluatedKey
                });

                const tableContent = await dynamoDBClient.send(scanCommand);
                lastEvaluatedKey = tableContent.LastEvaluatedKey;

                if (tableContent.Items && tableContent.Items.length > 0) {
                    for (const item of tableContent.Items) {
                        const user = unmarshall(item);
                        console.log(`Found user in ${tableName}:`, user);

                        const newMoneyValue = (user.money || 0) + paymentAmount;

                        const updateCommand = new UpdateItemCommand({
                            TableName: tableName,
                            Key: marshall({ id: user.id }),
                            UpdateExpression: 'SET money = :newMoney',
                            ExpressionAttributeValues: marshall({ ':newMoney': newMoneyValue }),
                            ReturnValues: 'ALL_NEW'
                        });

                        try {
                             const updateResult = await dynamoDBClient.send(updateCommand);
                             console.log(`Updated user in ${tableName}. New money value: ${newMoneyValue}`);
                             usersUpdated.push({ ...user, money: newMoneyValue });
                         } catch(error){
                             console.error(`Error updating user in ${tableName}:`, error)
                             throw error;
                         }
                    }
                } else {
                    console.log(`No matching users found in ${tableName}`);
                }
            } while (lastEvaluatedKey);
        }

        if (usersUpdated.length > 0) {
            console.log('Successfully updated users:', usersUpdated);
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Users money updated successfully',
                    users: usersUpdated
                })
            };
        } else {
            console.warn('No matching users found in any table');
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'No matching user found',
                    debug: { searchedEmail: email }
                })
            };
            // now it will not go to the end of the function and not throw an error
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        return {
            statusCode: 500,
             headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};
