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
    private static final String STORED_EXTENSION = "jpg";

    private final Path uploadDirectory;
    private final PickingImageProcessor imageProcessor;

    public PickingImageStorageService(
            @Value("${app.upload.picking-images-dir:uploads/pickings}") String uploadDirectory,
            PickingImageProcessor imageProcessor) {
        this.uploadDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        this.imageProcessor = imageProcessor;
    }

    public String storePickingImage(Long pickingId, MultipartFile file) {
        validate(file);
        byte[] optimized = imageProcessor.toOptimizedJpeg(file);
        try {
            Files.createDirectories(uploadDirectory);
            deleteExistingImages(pickingId);
            Path target = uploadDirectory.resolve(pickingId + "." + STORED_EXTENSION);
            Files.write(target, optimized);
            return "/api/uploads/pickings/" + pickingId + "." + STORED_EXTENSION;
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
