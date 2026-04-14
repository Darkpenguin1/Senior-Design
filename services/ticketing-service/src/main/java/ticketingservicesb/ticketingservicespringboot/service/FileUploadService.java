package ticketingservicesb.ticketingservicespringboot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import ticketingservicesb.ticketingservicespringboot.dto.PresignUploadResponse;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
public class FileUploadService {

    private final String bucketName;
    private final String awsRegion;
    private final String cloudFrontDomain;

    public FileUploadService(
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${aws.region}") String awsRegion,
            @Value("${aws.cdn.url}") String cloudFrontDomain
    ) {
        this.bucketName = bucketName;
        this.awsRegion = awsRegion;
        this.cloudFrontDomain = cloudFrontDomain;
    }

    public PresignUploadResponse createPresignedUploadUrl(String fileName, String contentType) {
        validateInput(fileName, contentType);

        String safeFileName = sanitizeFileName(fileName);
        String key = "uploads/" + UUID.randomUUID() + "-" + safeFileName;

        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()) {

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest putObjectPresignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(5))
                    .putObjectRequest(putObjectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest =
                    presigner.presignPutObject(putObjectPresignRequest);

            String cdnUrl = "https://" + cloudFrontDomain + "/" + key;

            return new PresignUploadResponse(
                    presignedRequest.url().toString(),
                    key,
                    cdnUrl,
                    300
            );
        }
    }

    private void validateInput(String fileName, String contentType) {
        Set<String> allowedContentTypes = Set.of(
                "image/png",
                "image/jpeg",
                "image/webp"
        );

        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("fileName is required");
        }

        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("contentType is required");
        }

        if (!allowedContentTypes.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported content type: " + contentType);
        }
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}