import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
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

    await dynamo.send(new UpdateCommand({
      TableName: "trades",

      Key: {
        userId,
        tradeId: body.tradeId
      },

      UpdateExpression: `
      SET
      #date = :date,
      pair = :pair,
      reason = :reason,
      direction = :direction,
      sl = :sl,
      riskfree = :riskfree,
      #result = :result,
      pips = :pips,
      analysis = :analysis
      `,

      ExpressionAttributeNames: {
        "#date": "date",
        "#result": "result"
      },

      ExpressionAttributeValues: {
        ":date": body.date,
        ":pair": body.pair,
        ":reason": body.reason,
        ":direction": body.direction,
        ":sl": body.sl,
        ":riskfree": body.riskfree,
        ":result": body.result,
        ":pips": body.pips,
        ":analysis": body.analysis || ""
      }
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "Updated successfully"
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
