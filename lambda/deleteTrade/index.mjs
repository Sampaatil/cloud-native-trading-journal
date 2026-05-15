import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {

    const body = JSON.parse(event.body);

    // ✅ USER FROM TOKEN
    const userId =
      event.requestContext.authorizer.claims.sub;

    await dynamo.send(new DeleteCommand({
      TableName: "trades",

      Key: {
        userId,
        tradeId: body.tradeId
      }
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "Deleted successfully"
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
