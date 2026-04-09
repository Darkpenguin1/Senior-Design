package ticketingservicesb.ticketingservicespringboot.controller;

import ticketingservicesb.ticketingservicespringboot.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(201).body(ticketService.createTicket(request));
    }
}