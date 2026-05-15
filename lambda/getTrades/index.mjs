import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

  try {

    console.log(
      JSON.stringify(event, null, 2)
    );

    // ✅ SAFE AUTHORIZER ACCESS
    const claims =
      event?.requestContext?.authorizer?.claims;

    if (!claims) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "No authorizer claims found"
        })
      };
    }

    // ✅ USER ID FROM JWT
    const userId =
      claims.sub;

    // ✅ MONTH
    const month =
      event?.queryStringParameters?.month;

    if (!month) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Month required"
        })
      };
    }

    // ✅ QUERY DB
    const data = await dynamo.send(
      new QueryCommand({
        TableName: "trades",

        KeyConditionExpression:
          "userId = :u",

        ExpressionAttributeValues: {
          ":u": userId
        }
      })
    );

    // ✅ FILTER MONTH
    const filtered =
      data.Items.filter(
        item => item.month === month
      );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(filtered)
    };

  } catch (err) {

    console.log(err);

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
