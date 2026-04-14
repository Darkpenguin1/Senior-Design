package ticketingservicesb.ticketingservicespringboot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import ticketingservicesb.ticketingservicespringboot.model.Ticket;

import java.util.HashMap;
import java.util.Map;

@Service
public class WorkOrderPublisher {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;

    @Value("${work.order.queue.url}")
    private String queueUrl;

    public WorkOrderPublisher(SqsClient sqsClient, ObjectMapper objectMapper) {
        this.sqsClient = sqsClient;
        this.objectMapper = objectMapper;
    }

    public void publishTicketCreated(Ticket ticket) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("ticketId", ticket.getId().toString());
            payload.put("title", ticket.getTitle());
            payload.put("description", ticket.getDescription());
            payload.put("priority", ticket.getPriority().name());
            payload.put("contractorEmail",
                ticket.getContractor() != null ? ticket.getContractor().getEmail() : "example@email.com"
            );
            payload.put("createdAt", ticket.getCreatedAt());

            String messageBody = objectMapper.writeValueAsString(payload);

            SendMessageRequest request = SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(messageBody)
                    .build();

            sqsClient.sendMessage(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send message to SQS", e);
        }
    }
}