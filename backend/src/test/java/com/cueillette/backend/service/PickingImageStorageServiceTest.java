package com.cueillette.backend.service;

import com.cueillette.backend.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PickingImageStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storePickingImage_savesFileAndReturnsPublicUrl() {
        PickingImageStorageService service = new PickingImageStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "farm.jpg",
                "image/jpeg",
                new byte[] {1, 2, 3, 4});

        String url = service.storePickingImage(12L, file);

        assertThat(url).isEqualTo("/api/uploads/pickings/12.jpg");
        assertThat(tempDir.resolve("12.jpg")).exists();
    }

    @Test
    void storePickingImage_rejectsUnsupportedType() {
        PickingImageStorageService service = new PickingImageStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "farm.gif",
                "image/gif",
                new byte[] {1});

        assertThatThrownBy(() -> service.storePickingImage(1L, file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("JPEG");
    }
}
