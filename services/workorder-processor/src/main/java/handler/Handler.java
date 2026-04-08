package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.time.Instant;

public class Handler implements RequestHandler<String, String> {

    // Static so the SNS client is reused across warm Lambda invocations.
    private static final SnsClient SNS = SnsClient.create();
    private static final String TOPIC_ARN = System.getenv("SNS_TOPIC_ARN");

    @Override
    public String handleRequest(String input, Context context) {

        System.out.println("Running CI version 1.0");
        context.getLogger().log("Received: " + input);

        publishEvent(input, context);

        return "Processed: " + input;
    }

    private void publishEvent(String input, Context context) {
        if (TOPIC_ARN == null || TOPIC_ARN.isEmpty()) {
            context.getLogger().log("SNS_TOPIC_ARN not set; skipping publish");
            return;
        }

        // Minimal JSON payload describing the work order event. The fanout
        // Lambda will parse this and write a notification row to DynamoDB.
        String message = String.format(
            "{\"workOrderId\":\"%s\",\"status\":\"status-change\",\"createdAt\":\"%s\"}",
            escape(input),
            Instant.now().toString()
        );

        try {
            PublishRequest req = PublishRequest.builder()
                .topicArn(TOPIC_ARN)
                .subject("Work order event")
                .message(message)
                .build();
            SNS.publish(req);
            context.getLogger().log("Published to SNS: " + message);
        } catch (Exception e) {
            // Don't fail the Lambda if the publish fails; just log it.
            context.getLogger().log("SNS publish failed: " + e.getMessage());
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
