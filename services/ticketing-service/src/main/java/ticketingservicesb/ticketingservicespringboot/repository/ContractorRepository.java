package ticketingservicesb.ticketingservicespringboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ticketingservicesb.ticketingservicespringboot.model.Contractor;

import java.util.List;
import java.util.Optional;

public interface ContractorRepository extends JpaRepository<Contractor, Long> {

    List<Contractor> findByClockedInIs(Boolean clockedIn);

    Optional<Contractor> findByEmail(String email);
}
