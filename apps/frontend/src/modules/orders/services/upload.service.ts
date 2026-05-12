/**
 * upload.service.ts — stub para upload de arquivos
 *
 * TODO: substituir por chamada real a POST /profile/logo (multipart/form-data)
 */

import { store } from "@/lib/store";

export const uploadService = {
  uploadLogo: (file: File): Promise<string> => store.uploadLogo(file),
};
