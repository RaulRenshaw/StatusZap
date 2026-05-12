package status.zap.Application.commons.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String folder);
    void delete(String fileKey);
}
