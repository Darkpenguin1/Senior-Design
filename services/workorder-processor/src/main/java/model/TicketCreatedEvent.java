package model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TicketCreatedEvent {

    @JsonProperty("ticketId")
    private String ticketId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("contractorEmail")
    private String contractorEmail;

    @JsonProperty
    private String priority; 

    // Default constructor (required for Jackson)
    public TicketCreatedEvent() {}

    // Optional all-args constructor
    public TicketCreatedEvent(String ticketId, String description, String contractorEmail, String priority) {
        this.ticketId = ticketId;
        this.description = description;
        this.contractorEmail = contractorEmail;
        this.priority = priority;
    }

    // Getters & Setters
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
}