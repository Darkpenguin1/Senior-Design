package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

/**
 * Read-side handler for the notification service. Serves
 * GET /notifications?role={role} via API Gateway HTTP API. Queries the
 * role-createdAt-index GSI on the notifications table and returns a JSON array.
 *
 * Co-located with NotificationHandler in the same JAR so a single deployment
 * artifact services both the SNS fanout and the read API. The Terraform
 * config attaches this class as the handler for the API Gateway-backed Lambda.
 */
public class NotificationApiHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private static final DynamoDbClient DDB = DynamoDbClient.create();
    private static final String TABLE = System.getenv("NOTIFICATIONS_TABLE");

    private static final Map<String, String> CORS_HEADERS = Map.of(
        "Access-Control-Allow-Origin", "*",
        "Access-Control-Allow-Methods", "GET,OPTIONS",
        "Access-Control-Allow-Headers", "Content-Type",
        "Content-Type", "application/json"
    );

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent event, Context context) {
        String role = "student";
        if (event != null && event.getQueryStringParameters() != null) {
            String r = event.getQueryStringParameters().get("role");
            if (r != null && !r.isEmpty()) role = r;
        }

        try {
            List<Map<String, AttributeValue>> items = queryByRole(role);
            String body = toJsonArray(items);
            return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(200)
                .withHeaders(CORS_HEADERS)
                .withBody(body)
                .build();
        } catch (Exception e) {
            context.getLogger().log("Query failed: " + e.getMessage());
            return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(500)
                .withHeaders(CORS_HEADERS)
                .withBody("{\"error\":\"query failed\"}")
                .build();
        }
    }

    private List<Map<String, AttributeValue>> queryByRole(String role) {
        Map<String, AttributeValue> values = new HashMap<>();
        values.put(":r", AttributeValue.fromS(role));

        QueryRequest req = QueryRequest.builder()
            .tableName(TABLE)
            .indexName("role-createdAt-index")
            .keyConditionExpression("#r = :r")
            .expressionAttributeNames(Map.of("#r", "role"))
            .expressionAttributeValues(values)
            .scanIndexForward(false) // newest first
            .limit(50)
            .build();

        QueryResponse resp = DDB.query(req);
        return resp.items();
    }

    /** Hand-rolled JSON serializer to avoid pulling in a JSON library. */
    private String toJsonArray(List<Map<String, AttributeValue>> items) {
        StringJoiner arr = new StringJoiner(",", "[", "]");
        for (Map<String, AttributeValue> item : items) {
            StringJoiner obj = new StringJoiner(",", "{", "}");
            for (Map.Entry<String, AttributeValue> e : item.entrySet()) {
                obj.add("\"" + e.getKey() + "\":" + valueToJson(e.getValue()));
            }
            arr.add(obj.toString());
        }
        return arr.toString();
    }

    private String valueToJson(AttributeValue v) {
        if (v.s() != null) return "\"" + escape(v.s()) + "\"";
        if (v.bool() != null) return v.bool().toString();
        if (v.n() != null) return v.n();
        return "null";
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
