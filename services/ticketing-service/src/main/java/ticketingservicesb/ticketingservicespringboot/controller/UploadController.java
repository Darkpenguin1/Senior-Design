package ticketingservicesb.ticketingservicespringboot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ticketingservicesb.ticketingservicespringboot.service.FileUploadService;

import ticketingservicesb.ticketingservicespringboot.dto.*;
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final FileUploadService fileUploadService;

    public UploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/presign")
    public ResponseEntity<PresignUploadResponse> createPresignedUploadUrl(
            @RequestBody PresignUploadRequest request
    ) {
        return ResponseEntity.ok(
                fileUploadService.createPresignedUploadUrl(
                        request.getFileName(),
                        request.getContentType()
                )
        );
    }
}