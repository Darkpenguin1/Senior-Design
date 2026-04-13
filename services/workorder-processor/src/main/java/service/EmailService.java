package service;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

public class EmailService {
    private final SesV2Client sesClient;
    private final String fromEmail;

    public EmailService() {
        this.sesClient = SesV2Client.builder()
                .region(Region.US_EAST_1)
                .build();
        this.fromEmail = System.getenv("SES_FROM_EMAIL");
    }

    public void sendEmail(String toEmail, String subjectText, String bodyText) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("SES_FROM_EMAIL is not set");
        }
        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException("toEmail is required");
        }

        SendEmailRequest request = SendEmailRequest.builder()
                .fromEmailAddress(fromEmail)
                .destination(Destination.builder().toAddresses(toEmail).build())
                .content(EmailContent.builder()
                        .simple(Message.builder()
                                .subject(Content.builder().data(subjectText).build())
                                .body(Body.builder()
                                        .text(Content.builder().data(bodyText).build())
                                        .build())
                                .build())
                        .build())
                .build();

        sesClient.sendEmail(request);
    }
}