package ticketingservicesb.ticketingservicespringboot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ticketingservicesb.ticketingservicespringboot.model.Management;
import ticketingservicesb.ticketingservicespringboot.service.ManagementService;

import java.util.List;

@RestController
@RequestMapping("/api/management")
public class ManagementController {

    private final ManagementService managementService;

    public ManagementController(ManagementService managementService) {
        this.managementService = managementService;
    }

    @PostMapping
    public ResponseEntity<Management> createManagement(@RequestBody Management management) {
        return ResponseEntity.status(HttpStatus.CREATED).body(managementService.createManagement(management));
    }

    @GetMapping
    public ResponseEntity<List<Management>> getAllManagement() {
        return ResponseEntity.ok(managementService.getAllManagement());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Management> getManagementById(@PathVariable Long id) {
        return ResponseEntity.ok(managementService.getManagementById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Management> updateManagement(@PathVariable Long id, @RequestBody Management management) {
        return ResponseEntity.ok(managementService.updateManagement(id, management));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManagement(@PathVariable Long id) {
        managementService.deleteManagement(id);
        return ResponseEntity.noContent().build();
    }
}
