package com.cueillette.backend.service;

import com.cueillette.backend.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;

@Service
public class PickingImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Path uploadDirectory;

    public PickingImageStorageService(
            @Value("${app.upload.picking-images-dir:uploads/pickings}") String uploadDirectory) {
        this.uploadDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    public String storePickingImage(Long pickingId, MultipartFile file) {
        validate(file);
        String extension = resolveExtension(file);
        try {
            Files.createDirectories(uploadDirectory);
            deleteExistingImages(pickingId);
            Path target = uploadDirectory.resolve(pickingId + "." + extension);
            file.transferTo(target);
            return "/api/uploads/pickings/" + pickingId + "." + extension;
        } catch (IOException ex) {
            throw new BadRequestException("Unable to save image file");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Image must be 5 MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Only JPEG, PNG and WebP images are allowed");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> throw new BadRequestException("Unsupported image type");
        };
    }

    private void deleteExistingImages(Long pickingId) throws IOException {
        String prefix = pickingId + ".";
        try (var stream = Files.list(uploadDirectory)) {
            stream
                    .filter(path -> path.getFileName().toString().startsWith(prefix))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                            // best effort cleanup before replace
                        }
                    });
        }
    }
}
