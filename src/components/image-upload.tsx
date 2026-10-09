import { useState } from "react";
import { useI18n } from "../i18n/context";
import { fileUrl, uploadFile, type UploadContext } from "../services/storage";

export function ImageUpload({
  value,
  onChange,
  onBusyChange,
  context,
  inline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
  context: UploadContext;
  inline?: boolean;
}) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  return (
    <span className="image-upload">
      <input
        type="file"
        disabled={uploading}
        accept="image/png,image/jpeg,image/webp"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          event.target.value = "";
          setError("");
          if (
            !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
            file.size > 2 * 1024 * 1024
          ) {
            setError("receiptImageHelp");
            return;
          }
          onBusyChange(true);
          setUploading(true);
          try {
            if (inline) {
              const value = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(new Error("imageReadError"));
                reader.readAsDataURL(file);
              });
              onChange(value);
            } else onChange((await uploadFile(file, context)).url);
          } catch (error) {
            setError(error instanceof Error ? error.message : "imageReadError");
          } finally {
            onBusyChange(false);
            setUploading(false);
          }
        }}
      />
      <small>{t("receiptImageHelp")}</small>
      {uploading && <small role="status">{t("uploadingFile")}</small>}
      {error && (
        <small role="alert" className="error">
          {t(error)}
        </small>
      )}
      {value && (
        <>
          <img
            className="receipt-preview"
            src={fileUrl(value)}
            alt={t("receiptImage")}
          />
          <button type="button" onClick={() => onChange("")}>
            {t("removeImage")}
          </button>
        </>
      )}
    </span>
  );
}
