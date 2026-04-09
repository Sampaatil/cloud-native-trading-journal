import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const getUserIdFromEvent = (event) => {
  return event.requestContext?.authorizer?.jwt?.claims?.sub;
};

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = getUserIdFromEvent(event);

    await dynamo.send(new DeleteCommand({
      TableName: "trades",
      Key: {
        userId,
        tradeId: body.tradeId
      }
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Deleted successfully" })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
