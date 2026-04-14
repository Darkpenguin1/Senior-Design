package ticketingservicesb.ticketingservicespringboot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ticketingservicesb.ticketingservicespringboot.dto.AuthRequest;
import ticketingservicesb.ticketingservicespringboot.dto.AuthResponse;
import ticketingservicesb.ticketingservicespringboot.model.Contractor;
import ticketingservicesb.ticketingservicespringboot.model.Management;
import ticketingservicesb.ticketingservicespringboot.model.Student;
import ticketingservicesb.ticketingservicespringboot.repository.ContractorRepository;
import ticketingservicesb.ticketingservicespringboot.repository.ManagementRepository;
import ticketingservicesb.ticketingservicespringboot.repository.StudentRepository;
import ticketingservicesb.ticketingservicespringboot.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StudentRepository studentRepository;
    private final ContractorRepository contractorRepository;
    private final ManagementRepository managementRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(StudentRepository studentRepository,
                          ContractorRepository contractorRepository,
                          ManagementRepository managementRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.studentRepository = studentRepository;
        this.contractorRepository = contractorRepository;
        this.managementRepository = managementRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody AuthRequest request) {
        validate(request);
        String email = request.email().trim().toLowerCase();
        String hash = passwordEncoder.encode(request.password());

        switch (request.role()) {
            case "student" -> {
                if (studentRepository.findByEmail(email).isPresent()) throw conflict();
                Student s = new Student();
                s.setEmail(email);
                s.setPassword(hash);
                Student saved = studentRepository.save(s);
                String token = jwtService.generate(saved.getStudentId(), saved.getEmail(), "student");
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(new AuthResponse(saved.getStudentId(), saved.getEmail(), "student", token));
            }
            case "contractor" -> {
                if (contractorRepository.findByEmail(email).isPresent()) throw conflict();
                Contractor c = new Contractor();
                c.setEmail(email);
                c.setPassword(hash);
                c.setName(email);
                c.setClockedIn(false);
                Contractor saved = contractorRepository.save(c);
                String token = jwtService.generate(saved.getId(), saved.getEmail(), "contractor");
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(new AuthResponse(saved.getId(), saved.getEmail(), "contractor", token));
            }
            case "management" -> {
                if (managementRepository.findByEmail(email).isPresent()) throw conflict();
                Management m = new Management();
                m.setEmail(email);
                m.setPassword(hash);
                Management saved = managementRepository.save(m);
                String token = jwtService.generate(saved.getId(), saved.getEmail(), "management");
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(new AuthResponse(saved.getId(), saved.getEmail(), "management", token));
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        validate(request);
        String email = request.email().trim().toLowerCase();

        // TEMP: hardcoded test account — remove once real login is complete.
        if ("test@test.com".equals(email) && "password".equals(request.password())) {
            String role = request.role();
            if ("student".equals(role) || "contractor".equals(role) || "management".equals(role)) {
                String token = jwtService.generate(-1L, email, role);
                return ResponseEntity.ok(new AuthResponse(-1L, email, role, token));
            }
        }

        switch (request.role()) {
            case "student" -> {
                Student s = studentRepository.findByEmail(email).orElseThrow(AuthController::unauthorized);
                if (!passwordEncoder.matches(request.password(), s.getPassword())) throw unauthorized();
                String token = jwtService.generate(s.getStudentId(), s.getEmail(), "student");
                return ResponseEntity.ok(new AuthResponse(s.getStudentId(), s.getEmail(), "student", token));
            }
            case "contractor" -> {
                Contractor c = contractorRepository.findByEmail(email).orElseThrow(AuthController::unauthorized);
                if (c.getPassword() == null || !passwordEncoder.matches(request.password(), c.getPassword())) throw unauthorized();
                String token = jwtService.generate(c.getId(), c.getEmail(), "contractor");
                return ResponseEntity.ok(new AuthResponse(c.getId(), c.getEmail(), "contractor", token));
            }
            case "management" -> {
                Management m = managementRepository.findByEmail(email).orElseThrow(AuthController::unauthorized);
                if (!passwordEncoder.matches(request.password(), m.getPassword())) throw unauthorized();
                String token = jwtService.generate(m.getId(), m.getEmail(), "management");
                return ResponseEntity.ok(new AuthResponse(m.getId(), m.getEmail(), "management", token));
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role");
        }
    }

    private static void validate(AuthRequest r) {
        if (r == null || r.email() == null || r.email().isBlank()
                || r.password() == null || r.password().isBlank()
                || r.role() == null || r.role().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email, password, and role are required");
        }
    }

    private static ResponseStatusException conflict() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }

    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}
