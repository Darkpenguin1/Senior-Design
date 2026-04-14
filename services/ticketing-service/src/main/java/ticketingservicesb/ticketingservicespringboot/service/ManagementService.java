package ticketingservicesb.ticketingservicespringboot.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ticketingservicesb.ticketingservicespringboot.model.Management;
import ticketingservicesb.ticketingservicespringboot.repository.ManagementRepository;

import java.util.List;

@Service
public class ManagementService {

    private final ManagementRepository managementRepository;

    public ManagementService(ManagementRepository managementRepository) {
        this.managementRepository = managementRepository;
    }

    public Management createManagement(Management management) {
        return managementRepository.save(management);
    }

    public List<Management> getAllManagement() {
        return managementRepository.findAll();
    }

    public Management getManagementById(Long id) {
        return managementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Management not found"));
    }

    public Management updateManagement(Long id, Management updated) {
        Management existing = getManagementById(id);
        existing.setEmail(updated.getEmail());
        existing.setPassword(updated.getPassword());
        return managementRepository.save(existing);
    }

    public void deleteManagement(Long id) {
        if (!managementRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Management not found");
        }
        managementRepository.deleteById(id);
    }
}
