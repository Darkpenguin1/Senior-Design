package ticketingservicesb.ticketingservicespringboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ticketingservicesb.ticketingservicespringboot.model.Contractor;

import java.util.List;

public interface ContractorRepository extends JpaRepository<Contractor, Long> {

    List<Contractor> findByClockedInIs(Boolean clockedIn);
}
