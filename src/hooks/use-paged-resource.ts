import { useEffect, useState, useCallback } from "react";
import { apiPage, type Pagination } from "../services/api";
export function usePagedResource<T>(path: string, enabled = true) {
  const [cursor, setCursor] = useState({ path, page: 1 });
  const page = cursor.path === path ? cursor.page : 1;
  const [result, setResult] = useState<{ data: T[]; pagination: Pagination }>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let active = true;
    setResult(undefined); setLoading(true); setError("");
    apiPage<T>(`${path}${path.includes("?") ? "&" : "?"}page=${page}&limit=20`)
      .then(value => { if (active) setResult(value); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "INTERNAL_ERROR"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, page, revision, enabled]);
  return { data: result?.data, pagination: result?.pagination, error, loading, page,
    setPage: (value: number) => setCursor({ path, page: value }),
    reload: useCallback(() => setRevision(value => value + 1), []) };
}
