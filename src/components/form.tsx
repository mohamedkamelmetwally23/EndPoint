import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n/context";
import { ApiError } from "../services/api";
import { fieldPlaceholder } from "../i18n/placeholders";
import { PasswordInput } from "./password-input";
import { ImageUpload } from "./image-upload";
import { PdfUpload } from "./pdf-upload";
import { ActionLabel } from "./action-label";
export type Values = Record<string, string | number | boolean | string[]>;
export type Field = {
  key: string;
  label?: string;
  placeholder?: string;
  dependsOn?: string;
  resets?: string[];
  disabled?: boolean;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  step?: number;
  hint?: string;
  minLength?: number;
  maxLength?: number;
};
export function Form({
  fields,
  initial = {},
  submit,
  onDone,
  label = "save",
  className = "",
}: {
  fields: Field[] | ((values: Values) => Field[]);
  initial?: Values;
  submit: (values: Values) => Promise<unknown>;
  onDone?: () => void;
  label?: string;
  className?: string;
}) {
  const { t, language } = useI18n();
  const [values, setValues] = useState<Values>(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const currentFields = typeof fields === "function" ? fields(values) : fields;
  const change = (key: string, value: Values[string]) => {
    setValues((v) => ({
      ...v,
      ...Object.fromEntries(
        (currentFields.find((field) => field.key === key)?.resets || []).map(
          (name) => [name, Array.isArray(v[name]) ? [] : ""],
        ),
      ),
      [key]: value,
    }));
    setSaved(false);
    setInvalidFields((current) => current.filter((field) => field !== key));
  };
  const handle = async (event: FormEvent) => {
    event.preventDefault();
    if (uploading) return;
    setBusy(true);
    setError("");
    setInvalidFields([]);
    try {
      await submit(values);
      setSaved(true);
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "INTERNAL_ERROR");
      if (e instanceof ApiError) setInvalidFields(e.fields);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className={`form ${className}`} onSubmit={handle}>
      {currentFields.map((field) =>
        field.type === "checkbox-group" ? (
          <fieldset
            key={field.key}
            disabled={
              field.disabled || (!!field.dependsOn && !values[field.dependsOn])
            }
          >
            <legend>{t(field.label || field.key)}</legend>
            {field.options?.map((option) => (
              <label className="check" key={option.value}>
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(values[field.key]) &&
                    (values[field.key] as string[]).includes(option.value)
                  }
                  onChange={(event) => {
                    const selected = Array.isArray(values[field.key])
                      ? (values[field.key] as string[])
                      : [];
                    change(
                      field.key,
                      event.target.checked
                        ? [...selected, option.value]
                        : selected.filter((id) => id !== option.value),
                    );
                  }}
                />
                {option.label}
              </label>
            ))}
            {!field.options?.length && (
              <small>{t(field.hint || "empty")}</small>
            )}
          </fieldset>
        ) : (
          <label
            key={field.key}
            className={field.type === "checkbox" ? "check" : ""}
          >
            <span>{t(field.label || field.key)}</span>
            {field.type === "pdf-upload" ? (
              <PdfUpload
                value={String(values[field.key] || "")}
                onChange={(value) => change(field.key, value)}
                onBusyChange={setUploading}
              />
            ) : field.type === "image-upload" ? (
              <ImageUpload
                value={String(values[field.key] || "")}
                onChange={(value) => change(field.key, value)}
                onBusyChange={setUploading}
              />
            ) : field.type === "select" ? (
              <select
                disabled={
                  field.disabled ||
                  (!!field.dependsOn && !values[field.dependsOn])
                }
                aria-label={t(field.label || field.key)}
                required={field.required !== false}
                value={String(values[field.key] ?? "")}
                onChange={(e) => change(field.key, e.target.value)}
              >
                <option value="">{t("choose")}</option>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.label)}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                placeholder={
                  field.placeholder ||
                  fieldPlaceholder(field.label || field.key, language, t)
                }
                required={field.required !== false}
                value={String(values[field.key] ?? "")}
                onChange={(e) => change(field.key, e.target.value)}
              />
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={!!values[field.key]}
                onChange={(e) => change(field.key, e.target.checked)}
              />
            ) : (
              <PasswordInput
                aria-label={t(field.label || field.key)}
                placeholder={
                  field.placeholder ||
                  fieldPlaceholder(field.label || field.key, language, t)
                }
                aria-invalid={invalidFields.includes(field.key) || undefined}
                type={field.type || "text"}
                disabled={
                  field.disabled ||
                  (!!field.dependsOn && !values[field.dependsOn])
                }
                required={field.required !== false}
                min={field.min}
                minLength={field.minLength}
                maxLength={field.maxLength}
                step={
                  field.type === "number" ? (field.step ?? "0.01") : undefined
                }
                autoComplete={
                  field.type === "password" ? "new-password" : undefined
                }
                value={String(values[field.key] ?? "")}
                onChange={(e) =>
                  change(
                    field.key,
                    field.type === "number" && e.target.value !== ""
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}{" "}
            {field.hint && <small>{t(field.hint)}</small>}
          </label>
        ),
      )}
      {error && (
        <p role="alert" className="error">
          {t(error)}
          {invalidFields.length > 0 && (
            <span>
              {" "}
              {t("invalidFields")}:{" "}
              {invalidFields
                .map((key) =>
                  t(
                    currentFields.find((field) => field.key === key)?.label ||
                      key,
                  ),
                )
                .join("، ")}
            </span>
          )}
        </p>
      )}
      {saved && <p role="status">{t("success")}</p>}
      <button className="primary" disabled={busy || uploading}>
        <ActionLabel action={busy ? "loading" : label} compact={false} />
      </button>
    </form>
  );
}
