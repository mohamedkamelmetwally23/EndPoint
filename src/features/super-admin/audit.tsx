import { useResource } from "../../hooks/use-resource";
import { Page, State, DateText } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { Audit } from "../../types/domain";
export function AuditLogs() {
  const resource = useResource<Audit[]>("/admin/audit"),
    { t } = useI18n();
  return (
    <Page title="audit">
      <State
        loading={resource.loading}
        error={resource.error}
        empty={resource.data?.length === 0}
        reload={resource.reload}
      />
      <section className="surface">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["date", "actor", "action", "entityType"].map((h) => (
                  <th key={h}>{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resource.data?.map((row) => (
                <tr key={row._id}>
                  <td data-label={t("date")}>
                    <DateText value={row.timestamp} />
                  </td>
                  <td data-label={t("actor")}>{row.actor?.fullName || "—"}</td>
                  <td data-label={t("action")}>{t(row.action)}</td>
                  <td data-label={t("entityType")}>
                    {t(row.entityType)}
                    <small>{row.entityId}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Page>
  );
}
