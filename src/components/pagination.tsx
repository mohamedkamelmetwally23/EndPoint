import { useI18n } from "../i18n/context";
import type { Pagination as PageInfo } from "../services/api";
export function Pagination({ page, pagination, loading, setPage }: {
  page: number; pagination?: PageInfo; loading: boolean; setPage: (page: number) => void;
}) {
  const { t } = useI18n();
  return <div className="tabs">
    <button disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>{t("previous")}</button>
    <span aria-live="polite">{page} / {Math.max(1, Math.ceil((pagination?.total ?? 0) / (pagination?.limit ?? 20)))}</span>
    <button disabled={loading || !pagination?.hasNext} onClick={() => setPage(page + 1)}>{t("next")}</button>
  </div>;
}
