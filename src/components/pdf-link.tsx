import { useEffect, useState } from "react";
import { fileUrl } from "../services/storage";

export function PdfLink({ value, label }: { value: string; label: string }) {
  const [href, setHref] = useState("");
  useEffect(() => {
    if (!value.startsWith("data:application/pdf;base64,")) {
      setHref(fileUrl(value));
      return;
    }
    const bytes = Uint8Array.from(
      atob(value.split(",")[1] || ""),
      (character) => character.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" }),
    );
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);
  return (
    <a
      className="file-link"
      href={href || undefined}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
