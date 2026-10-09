import { useState } from "react";
import { useI18n } from "../i18n/context";
import { api } from "../services/api";

export function ImageUpload({
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
  return (
    <span className="image-upload">
      <input
        type="file"
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
          try {
            const body = new FormData();
            body.append("image", file);
            onChange(await api<string>("/staff/receipt-image", "POST", body));
          } catch (error) {
            setError(error instanceof Error ? error.message : "imageReadError");
          } finally {
            onBusyChange(false);
          }
        }}
      />
      <small>{t("receiptImageHelp")}</small>
      {error && (
        <small role="alert" className="error">
          {t(error)}
        </small>
      )}
      {value && (
        <>
          <img
            className="receipt-preview"
            src={value}
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
