import { useState } from "react";
import { api } from "../services/api";
import { useI18n } from "../i18n/context";
import { PdfLink } from "./pdf-link";

export function PdfUpload({
  value,
  onChange,
  onBusyChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  return (
    <span className="image-upload">
      <input
        type="file"
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
          try {
            const body = new FormData();
            body.append("pdf", file);
            onChange(await api<string>("/staff/summary-pdf", "POST", body));
            setName(file.name);
          } catch (error) {
            setError(error instanceof Error ? error.message : "pdfUploadError");
          } finally {
            onBusyChange(false);
          }
        }}
      />
      <small>{t("summaryPdfHelp")}</small>
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
