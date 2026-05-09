package status.zap.Application.commons.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import status.zap.Application.commons.storage.StorageService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Armazenamento local em disco.
 *
 * Configuração em application.properties:
 *   storage.local.base-dir=uploads          (pasta raiz física)
 *   storage.local.base-url=http://localhost:8080/uploads  (prefixo URL pública)
 *
 * Para usar S3/MinIO no futuro:
 *   1. Adicione dependência aws-sdk-s3 ou minio-sdk
 *   2. Crie S3StorageService implements StorageService
 *   3. Anote com @Service @ConditionalOnProperty(name="storage.type", havingValue="s3")
 *   4. Anote este com @ConditionalOnProperty(name="storage.type", havingValue="local", matchIfMissing=true)
 */
@Primary
@Service
public class LocalStorageService implements StorageService {

    private static final List<String> ALLOWED_TYPES =
            List.of("image/png", "image/jpeg", "image/webp", "image/svg+xml");
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

            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path destination = dir.resolve(filename);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            // Retorna URL pública — trocar por URL do bucket em S3
            return baseUrl + "/" + folder + "/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar arquivo: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) return;
        try {
            // fileKey é a URL pública; derivamos o path físico
            String relativePath = fileKey.replace(baseUrl, "").replace("/", java.io.File.separator);
            Path path = Paths.get(baseDir + relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log mas não lança — exclusão não deve interromper o fluxo principal
            System.err.println("Aviso: não foi possível remover arquivo " + fileKey + ": " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode ser vazio");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Tipo de arquivo não permitido. Use: PNG, JPEG, WebP ou SVG");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("Arquivo excede o tamanho máximo de 2MB");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}