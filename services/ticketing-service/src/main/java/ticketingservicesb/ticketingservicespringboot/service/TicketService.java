package ticketingservicesb.ticketingservicespringboot.service;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ticketingservicesb.ticketingservicespringboot.model.Contractor;
import ticketingservicesb.ticketingservicespringboot.model.Student;
import ticketingservicesb.ticketingservicespringboot.model.Ticket;
import ticketingservicesb.ticketingservicespringboot.repository.ContractorRepository;
import ticketingservicesb.ticketingservicespringboot.repository.StudentRepository;
import ticketingservicesb.ticketingservicespringboot.repository.TicketRepository;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final StudentRepository studentRepository;
    private final ContractorRepository contractorRepository;

    public TicketService(TicketRepository ticketRepository,
                         StudentRepository studentRepository,
                         ContractorRepository contractorRepository) {
        this.ticketRepository = ticketRepository;
        this.studentRepository = studentRepository;
        this.contractorRepository = contractorRepository;
    }

    public Ticket createTicket(Ticket ticket, Long studentId, Long contractorId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        ticket.setStudent(student);

        if (contractorId != null) {
            Contractor contractor = contractorRepository.findById(contractorId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contractor not found"));
            ticket.setContractor(contractor);
        }

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTickets(Long studentId, Long contractorId, String status) {
        Specification<Ticket> spec = null;

        if (studentId != null) {
            Specification<Ticket> studentSpec =
                    (root, query, cb) -> cb.equal(root.get("student").get("studentId"), studentId);
            spec = (spec == null) ? studentSpec : spec.and(studentSpec);
        }

        if (contractorId != null) {
            Specification<Ticket> contractorSpec =
                    (root, query, cb) -> cb.equal(root.get("contractor").get("id"), contractorId);
            spec = (spec == null) ? contractorSpec : spec.and(contractorSpec);
        }

        if (status != null) {
            Specification<Ticket> statusSpec =
                    (root, query, cb) -> cb.equal(root.get("status"), status);
            spec = (spec == null) ? statusSpec : spec.and(statusSpec);
        }

        return (spec == null) ? ticketRepository.findAll() : ticketRepository.findAll(spec);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    public Ticket updateTicket(Long id, Ticket updated, Long contractorId) {
        Ticket existing = getTicketById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setStatus(updated.getStatus());
        existing.setPhotoUrls(updated.getPhotoUrls());

        if (contractorId != null) {
            Contractor contractor = contractorRepository.findById(contractorId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contractor not found"));
            existing.setContractor(contractor);
        }

        return ticketRepository.save(existing);
    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }
        ticketRepository.deleteById(id);
    }
}
