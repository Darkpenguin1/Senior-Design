package ticketingservicesb.ticketingservicespringboot.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TicketService {

    public Map<String, Object> createTicket(Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Service layer reached");
        response.put("request", request);
        return response;
    }
}