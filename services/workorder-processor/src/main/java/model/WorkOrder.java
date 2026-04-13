package model;

public class WorkOrder {
    private String workOrderId;
    private String ticketId;
    private String title;
    private String description;
    private String priority;
    private String contractorEmail;
    private String createdBy;
    private String status;
    private String createdAt;

    public WorkOrder() {}

    public WorkOrder(
            String workOrderId,
            String ticketId,
            String title,
            String description,
            String priority,
            String contractorEmail,
            String createdBy,
            String status,
            String createdAt
    ) {
        this.workOrderId = workOrderId;
        this.ticketId = ticketId;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.contractorEmail = contractorEmail;
        this.createdBy = createdBy;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(String workOrderId) { this.workOrderId = workOrderId; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getContractorEmail() { return contractorEmail; }
    public void setContractorEmail(String contractorEmail) { this.contractorEmail = contractorEmail; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}