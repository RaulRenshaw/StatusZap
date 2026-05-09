package status.zap.Application.commons.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstração de armazenamento de arquivos.
 *
 * Implementação atual: LocalStorageService (disco local).
 * Para migrar para S3/MinIO, basta criar S3StorageService implementando
 * esta interface e trocar o @Primary ou o @ConditionalOnProperty.
 */
public interface StorageService {

    /**
     * Salva o arquivo e retorna a URL pública de acesso.
     *
     * @param file      arquivo recebido via multipart
     * @param folder    subpasta lógica (ex: "logos")
     * @return URL pública do arquivo salvo
     */
    String store(MultipartFile file, String folder);

    /**
     * Remove um arquivo pelo caminho/chave.
     *
     * @param fileKey caminho relativo ou chave S3
     */
    void delete(String fileKey);
}