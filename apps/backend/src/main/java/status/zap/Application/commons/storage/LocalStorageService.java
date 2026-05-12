package status.zap.Application.commons.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Primary
@Service
public class LocalStorageService implements StorageService {

    // SVG removido — pode conter JavaScript (XSS via SVG inline)
    private static final List<String> ALLOWED_TYPES =
            List.of("image/png", "image/jpeg", "image/webp");
    private static final long MAX_SIZE_BYTES = 2L * 1024 * 1024; // 2 MB

    @Value("${storage.local.base-dir:uploads}")
    private String baseDir;

    @Value("${storage.local.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    @Override
    public String store(MultipartFile file, String folder) {
        validate(file);
        try {
            Path dir = Paths.get(baseDir, folder);
            Files.createDirectories(dir);

            String ext      = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Path   dest     = dir.resolve(filename);

            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return baseUrl + "/" + folder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar arquivo: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String relative = fileUrl.replace(baseUrl, "").replace("/", java.io.File.separator);
            Files.deleteIfExists(Paths.get(baseDir + relative));
        } catch (IOException e) {
            log.warn("Não foi possível remover arquivo {}: {}", fileUrl, e.getMessage());
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("Arquivo não pode ser vazio");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new IllegalArgumentException("Tipo não permitido. Use: PNG, JPEG ou WebP");
        if (file.getSize() > MAX_SIZE_BYTES)
            throw new IllegalArgumentException("Arquivo excede 2MB");
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
