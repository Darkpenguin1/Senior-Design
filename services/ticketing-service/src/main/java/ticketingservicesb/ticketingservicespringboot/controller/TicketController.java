package ticketingservicesb.ticketingservicespringboot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ticketingservicesb.ticketingservicespringboot.model.Ticket;
import ticketingservicesb.ticketingservicespringboot.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket,
                                               @RequestParam Long studentId,
                                               @RequestParam(required = false) Long contractorId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(ticket, studentId, contractorId));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long contractorId,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(ticketService.getTickets(studentId, contractorId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id,
                                               @RequestBody Ticket ticket,
                                               @RequestParam(required = false) Long contractorId) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket, contractorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
