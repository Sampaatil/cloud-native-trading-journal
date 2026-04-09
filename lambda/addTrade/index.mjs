import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const getUserIdFromEvent = (event) => {
  return event.requestContext?.authorizer?.jwt?.claims?.sub;
};

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = getUserIdFromEvent(event);

    if (!userId) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    const params = {
      TableName: "trades",
      Item: {
        userId,
        tradeId: body.tradeId,
        month: body.month,
        date: body.date,
        pair: body.pair,
        reason: body.reason,
        direction: body.direction,
        sl: body.sl,
        riskfree: body.riskfree,
        result: body.result,
        pips: body.pips,
        analysis: body.analysis || ""
      }
    };

    await dynamo.send(new PutCommand(params));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Trade added" })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
