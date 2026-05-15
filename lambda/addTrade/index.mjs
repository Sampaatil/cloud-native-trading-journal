import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {

    const body = JSON.parse(event.body);

    // ✅ USER FROM TOKEN
    const userId =
      event.requestContext.authorizer.claims.sub;

    const trade = {
      ...body,
      userId
    };

    await dynamo.send(new PutCommand({
      TableName: "trades",
      Item: trade
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "Trade added"
      })
    };

  } catch (err) {

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};
