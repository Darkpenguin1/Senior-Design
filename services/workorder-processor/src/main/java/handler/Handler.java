package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import model.TicketCreatedEvent;
import service.WorkOrderService;
import service.EmailService;

public class Handler implements RequestHandler<SQSEvent, Void> {
    

    /*
        Intended flow for this Lambda:

        1. Spring Boot API creates the ticket in RDS.
        2. After successful ticket creation, Spring Boot publishes a TicketCreated event to SQS.
        3. This Lambda consumes the SQS message.
        4. Lambda deserializes the message into a TicketCreatedEvent model.
        5. Lambda creates a work order in DynamoDB using WORK_ORDERS_TABLE_NAME.
        6. Lambda sends a notification email directly to the contractor.

        Keep notification simple:
        - Do NOT introduce extra notification Lambdas unless required.
        - Preferred approach: send email directly from this Lambda after the DynamoDB write succeeds.
            Example future implementation: Amazon SES.
    */

    private static final String WORK_ORDERS_TABLE_NAME = System.getenv("WORK_ORDERS_TABLE_NAME");

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Void handleRequest(SQSEvent event, Context context) {
        context.getLogger().log("Received " + event.getRecords().size() + " SQS record(s)\n");
        EmailService emailService = new EmailService();
        String recipient = System.getenv("SES_TO_EMAIL");
        if (WORK_ORDERS_TABLE_NAME == null || WORK_ORDERS_TABLE_NAME.isBlank()) {
            throw new IllegalStateException("Missing WORK_ORDERS_TABLE_NAME environment variable");
        }

        context.getLogger().log("About to create WorkOrderService\n");

        WorkOrderService service = new WorkOrderService(WORK_ORDERS_TABLE_NAME);

            context.getLogger().log("Able create WorkOrderService\n");

        for (SQSEvent.SQSMessage msg : event.getRecords()) {
            context.getLogger().log("Message body: " + msg.getBody() + "\n");

            try {
                TicketCreatedEvent ticketEvent =
                        objectMapper.readValue(msg.getBody(), TicketCreatedEvent.class);

                service.processTicketCreated(ticketEvent);
                
                context.getLogger().log("Created work order for ticket " + ticketEvent.getTicketId() + "\n");

                String subject = "New Work Order Created";

                String body = """
                        A new work order has been created.

                        Ticket ID: %s
                        Description: %s
                        Priority: %s
                        Contractor: %s
                        """.formatted(
                        ticketEvent.getTicketId(),
                        ticketEvent.getDescription(),
                        ticketEvent.getPriority(),
                        ticketEvent.getContractorEmail()
                );

                emailService.sendEmail(recipient, subject, body);

                context.getLogger().log("Email sent successfully\n");
                

            } catch (Exception e) {
                context.getLogger().log("ERROR processing message: " + e.getMessage() + "\n");
                throw new RuntimeException(e);
            }
        }

        return null;
    }
}