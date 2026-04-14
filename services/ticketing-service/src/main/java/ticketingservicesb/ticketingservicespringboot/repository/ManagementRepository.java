package ticketingservicesb.ticketingservicespringboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ticketingservicesb.ticketingservicespringboot.model.Management;

import java.util.Optional;

public interface ManagementRepository extends JpaRepository<Management, Long> {

    Optional<Management> findByEmail(String email);
}
