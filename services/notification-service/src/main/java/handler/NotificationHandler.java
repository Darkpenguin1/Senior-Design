package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Fanout handler. Triggered by SNS work-order-events. Each SNS record carries
 * a JSON payload from the workorder-processor Lambda; we transform it into a
 * notification row and persist it to the notifications-dev DynamoDB table.
 *
 * The frontend later reads from this table (via an API Gateway endpoint, see
 * Phase 3) to display notifications to students/management/contractors.
 */
public class NotificationHandler implements RequestHandler<SNSEvent, Void> {

    private static final DynamoDbClient DDB = DynamoDbClient.create();
    private static final String TABLE = System.getenv("NOTIFICATIONS_TABLE");

    @Override
    public Void handleRequest(SNSEvent event, Context context) {
        if (event == null || event.getRecords() == null) {
            context.getLogger().log("No SNS records in event");
            return null;
        }

        for (SNSEvent.SNSRecord record : event.getRecords()) {
            try {
                String message = record.getSNS().getMessage();
                context.getLogger().log("Processing SNS message: " + message);
                writeNotification(message, context);
            } catch (Exception e) {
                context.getLogger().log("Failed to process record: " + e.getMessage());
            }
        }
        return null;
    }

    private void writeNotification(String message, Context context) {
        if (TABLE == null || TABLE.isEmpty()) {
            context.getLogger().log("NOTIFICATIONS_TABLE not set; skipping write");
            return;
        }

        // Minimal hand-rolled extraction so we don't need a JSON library on
        // the classpath. The publisher format is fixed (see Handler.java in
        // workorder-processor), so this is fine for the demo.
        String workOrderId = extract(message, "workOrderId");
        String status = extract(message, "status");
        if (status == null || status.isEmpty()) status = "status-change";

        String createdAt = Instant.now().toString();
        String notificationId = UUID.randomUUID().toString();

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("notification_id", AttributeValue.fromS(notificationId));
        item.put("role", AttributeValue.fromS("student"));
        item.put("createdAt", AttributeValue.fromS(createdAt));
        item.put("type", AttributeValue.fromS(status));
        item.put("title", AttributeValue.fromS("Work order update"));
        item.put("message", AttributeValue.fromS(
            "Work order " + (workOrderId == null ? "?" : workOrderId) + " has a new update."));
        item.put("workOrderId", AttributeValue.fromS(workOrderId == null ? "" : workOrderId));
        item.put("read", AttributeValue.fromBool(false));

        PutItemRequest req = PutItemRequest.builder()
            .tableName(TABLE)
            .item(item)
            .build();
        DDB.putItem(req);
        context.getLogger().log("Wrote notification " + notificationId);
    }

    /** Extracts a string field value from a flat JSON object. Demo-grade. */
    private static String extract(String json, String field) {
        if (json == null) return null;
        String key = "\"" + field + "\":\"";
        int i = json.indexOf(key);
        if (i < 0) return null;
        int start = i + key.length();
        int end = json.indexOf('"', start);
        if (end < 0) return null;
        return json.substring(start, end);
    }
}
