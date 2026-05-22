package com.cueillette.backend.service;

import com.cueillette.backend.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PickingImageStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storePickingImage_savesFileAndReturnsPublicUrl() throws Exception {
        PickingImageStorageService service = new PickingImageStorageService(
                tempDir.toString(), new PickingImageProcessor());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "farm.jpg",
                "image/jpeg",
                sampleJpegBytes(64, 48));

        String url = service.storePickingImage(12L, file);

        assertThat(url).isEqualTo("/api/uploads/pickings/12.jpg");
        assertThat(tempDir.resolve("12.jpg")).exists();
    }

    @Test
    void storePickingImage_rejectsUnsupportedType() {
        PickingImageStorageService service = new PickingImageStorageService(
                tempDir.toString(), new PickingImageProcessor());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "farm.gif",
                "image/gif",
                new byte[] {1});

        assertThatThrownBy(() -> service.storePickingImage(1L, file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("JPEG");
    }

    private static byte[] sampleJpegBytes(int width, int height) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", output);
        return output.toByteArray();
    }
}
