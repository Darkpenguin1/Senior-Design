package service;

import model.TicketCreatedEvent;
import model.WorkOrder;
import repository.WorkOrderRepository;


import java.time.Instant;
import java.util.UUID;

public class WorkOrderService {

    private final WorkOrderRepository repository;

    public WorkOrderService(String tableName) {
        System.out.println("Entering WorkOrderService constructor");
        this.repository = new WorkOrderRepository(tableName);
        System.out.println("Exiting WorkOrderService constructor");
    }

    public void processTicketCreated(TicketCreatedEvent event) {
        WorkOrder workOrder = new WorkOrder(
                UUID.randomUUID().toString(),
                event.getTicketId(),
                "Work order for ticket " + event.getTicketId(),
                event.getDescription(),
                "MEDIUM",
                event.getContractorEmail(),
                "ticketing-service",
                "OPEN",
                Instant.now().toString()
        );
        System.out.println("Going to save a work order");
        repository.saveWorkOrder(workOrder);
    }
}