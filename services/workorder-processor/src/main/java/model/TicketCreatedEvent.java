package model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class TicketCreatedEvent {

    @JsonProperty("ticketId")
    private String ticketId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("contractorEmail")
    private String contractorEmail;

    @JsonProperty("priority")
    private String priority;

    @JsonProperty("title")
    private String title;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    // Default constructor (required for Jackson)
    public TicketCreatedEvent() {}

    // All-args constructor
    public TicketCreatedEvent(
            String ticketId,
            String description,
            String contractorEmail,
            String priority,
            String title,
            LocalDateTime createdAt
    ) {
        this.ticketId = ticketId;
        this.description = description;
        this.contractorEmail = contractorEmail;
        this.priority = priority;
        this.title = title;
        this.createdAt = createdAt;
    }

    // ===== Getters & Setters =====

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContractorEmail() {
        return contractorEmail;
    }

    public void setContractorEmail(String contractorEmail) {
        this.contractorEmail = contractorEmail;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}