import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const getUserIdFromEvent = (event) => {
  return event.requestContext?.authorizer?.jwt?.claims?.sub;
};

export const handler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    const month = event.queryStringParameters.month;

    if (!userId) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    const data = await dynamo.send(new QueryCommand({
      TableName: "trades",
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": userId
      }
    }));

    const filtered = data.Items.filter(item => item.month === month);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(filtered)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
