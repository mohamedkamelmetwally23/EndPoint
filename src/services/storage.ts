import { uploadPresigned } from "@vercel/blob/client";
import { api, API_BASE_URL } from "./api";
export type UploadContext = { purpose: "summary" | "material" | "receipt" | "cover"; scopeId?: string; editing?: boolean };
export async function uploadFile(file: File, context: UploadContext) {
  const prepared = await api<{ id: string; pathname: string; access: "public" | "private" }>("/files/prepare", "POST", {
    ...context, originalName: file.name, mimeType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : ""), size: file.size,
  });
  try { await uploadPresigned(prepared.pathname, file, { access: prepared.access,
    handleUploadUrl: `${API_BASE_URL}/files/${prepared.id}/upload`,
    contentType: file.type || "application/pdf" }); }
  catch { throw new Error("FILE_UPLOAD_FAILED"); }
  // Completion verifies the actual Blob size, media type and signature and persists metadata.
  return api<{ id: string; url: string }>(`/files/${prepared.id}/complete`, "POST");
}
export function fileUrl(value: string) {
  return value.startsWith("/api/v1/") ? `${API_BASE_URL}${value.slice("/api/v1".length)}` : value;
}
