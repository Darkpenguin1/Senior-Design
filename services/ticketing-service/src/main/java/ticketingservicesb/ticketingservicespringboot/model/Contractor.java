package ticketingservicesb.ticketingservicespringboot.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "contractors")
public class Contractor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(nullable = false)
    private Boolean clockedIn = false;

    @JsonIgnore
    @OneToMany(mappedBy = "contractor", fetch = FetchType.LAZY)
    private List<Ticket> currentTickets;

    public Contractor() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getClockedIn() {
        return clockedIn;
    }

    public void setClockedIn(Boolean clockedIn) {
        this.clockedIn = clockedIn;
    }

    public List<Ticket> getCurrentTickets() {
        return currentTickets;
    }

    public void setCurrentTickets(List<Ticket> currentTickets) {
        this.currentTickets = currentTickets;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
