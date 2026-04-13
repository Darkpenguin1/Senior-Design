package repository;

import model.WorkOrder;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.regions.Region;

import java.util.HashMap;
import java.util.Map;

public class WorkOrderRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public WorkOrderRepository(String tableName) {
        System.out.println("Entering WorkOrderRepository constructor");
        this.tableName = tableName;

        System.out.println("About to build DynamoDbClient");
        this.dynamoDbClient = DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .build();
        System.out.println("Built DynamoDbClient successfully");
    }

    public void saveWorkOrder(WorkOrder workOrder) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("work_order_id", AttributeValue.builder().s(workOrder.getWorkOrderId()).build());
        item.put("ticket_id", AttributeValue.builder().s(workOrder.getTicketId()).build());
        item.put("title", AttributeValue.builder().s(workOrder.getTitle()).build());
        item.put("description", AttributeValue.builder().s(workOrder.getDescription()).build());
        item.put("priority", AttributeValue.builder().s(workOrder.getPriority()).build());
        item.put("contractor_email", AttributeValue.builder().s(workOrder.getContractorEmail()).build());
        item.put("created_by", AttributeValue.builder().s(workOrder.getCreatedBy()).build());
        item.put("status", AttributeValue.builder().s(workOrder.getStatus()).build());
        item.put("created_at", AttributeValue.builder().s(workOrder.getCreatedAt()).build());

        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
    }
}