import { request } from "@/shared/services/http";

export const uploadService = {
  async uploadLogo(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await request<{ logoUrl: string }>("/profile/logo", {
      method: "POST",
      body: form,
    });
    return res.logoUrl;
  },
};
