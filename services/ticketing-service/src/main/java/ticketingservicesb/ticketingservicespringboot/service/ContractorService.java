package ticketingservicesb.ticketingservicespringboot.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ticketingservicesb.ticketingservicespringboot.model.Contractor;
import ticketingservicesb.ticketingservicespringboot.repository.ContractorRepository;

import java.util.List;

@Service
public class ContractorService {

    private final ContractorRepository contractorRepository;

    public ContractorService(ContractorRepository contractorRepository) {
        this.contractorRepository = contractorRepository;
    }

    public Contractor createContractor(Contractor contractor) {
        return contractorRepository.save(contractor);
    }

    public List<Contractor> getAllContractors() {
        return contractorRepository.findAll();
    }

    public Contractor getContractorById(Long id) {
        return contractorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contractor not found"));
    }

    public Contractor updateContractor(Long id, Contractor updated) {
        Contractor existing = getContractorById(id);
        existing.setName(updated.getName());
        existing.setLocation(updated.getLocation());
        existing.setClockedIn(updated.getClockedIn());
        existing.setEmail(updated.getEmail());
        return contractorRepository.save(existing);
    }

    public void deleteContractor(Long id) {
        if (!contractorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contractor not found");
        }
        contractorRepository.deleteById(id);
    }
}
