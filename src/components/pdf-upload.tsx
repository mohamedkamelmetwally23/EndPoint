import { useState } from "react";
import { uploadFile, type UploadContext } from "../services/storage";
import { useI18n } from "../i18n/context";
import { PdfLink } from "./pdf-link";

export function PdfUpload({
  value,
  onChange,
  onBusyChange,
  context,
}: {
  value: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
  context: UploadContext;
}) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  return (
    <span className="image-upload">
      <input
        type="file"
        disabled={uploading}
        accept="application/pdf,.pdf"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          event.target.value = "";
          setError("");
          if (
            !file.name.toLowerCase().endsWith(".pdf") ||
            file.size > 20 * 1024 * 1024
          ) {
            setError("summaryPdfHelp");
            return;
          }
          onBusyChange(true);
          setUploading(true);
          try {
            onChange((await uploadFile(file, context)).url);
            setName(file.name);
          } catch (error) {
            setError(error instanceof Error ? error.message : "pdfUploadError");
          } finally {
            onBusyChange(false);
            setUploading(false);
          }
        }}
      />
      <small>{t("summaryPdfHelp")}</small>
      {uploading && <small role="status">{t("uploadingFile")}</small>}
      {error && (
        <small role="alert" className="error">
          {t(error)}
        </small>
      )}
      {value && (
        <>
          <PdfLink value={value} label={name || t("summaryPdf")} />
          <button
            type="button"
            onClick={() => {
              onChange("");
              setName("");
            }}
          >
            {t("removePdf")}
          </button>
        </>
      )}
    </span>
  );
}
