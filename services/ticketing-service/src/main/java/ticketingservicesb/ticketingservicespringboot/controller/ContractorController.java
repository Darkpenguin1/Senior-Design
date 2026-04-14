package ticketingservicesb.ticketingservicespringboot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ticketingservicesb.ticketingservicespringboot.model.Contractor;
import ticketingservicesb.ticketingservicespringboot.service.ContractorService;

import java.util.List;

@RestController
@RequestMapping("/api/contractors")
public class ContractorController {

    private final ContractorService contractorService;

    public ContractorController(ContractorService contractorService) {
        this.contractorService = contractorService;
    }

    @PostMapping
    public ResponseEntity<Contractor> createContractor(@RequestBody Contractor contractor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractorService.createContractor(contractor));
    }

    @GetMapping
    public ResponseEntity<List<Contractor>> getAllContractors() {
        return ResponseEntity.ok(contractorService.getAllContractors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contractor> getContractorById(@PathVariable Long id) {
        return ResponseEntity.ok(contractorService.getContractorById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contractor> updateContractor(@PathVariable Long id, @RequestBody Contractor contractor) {
        return ResponseEntity.ok(contractorService.updateContractor(id, contractor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContractor(@PathVariable Long id) {
        contractorService.deleteContractor(id);
        return ResponseEntity.noContent().build();
    }
}
