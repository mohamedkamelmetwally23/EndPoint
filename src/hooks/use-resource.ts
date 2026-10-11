import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
export function useResource<T>(path: string, enabled = true) {
  const [data, setData] = useState<T>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError("");
    api<T>(path)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "INTERNAL_ERROR");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision, enabled]);
  return {
    data,
    error,
    loading,
    reload: useCallback(() => setRevision((v) => v + 1), []),
  };
}
