import { useResource } from "../../hooks/use-resource";
import { Page, State, DateText } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { Audit } from "../../types/domain";
import { useState } from "react";
type FrequentLogin = { _id: string; count: number; lastLogin: string; user: { fullName: string; email: string } };
function FrequentLogins() {
  const resource = useResource<FrequentLogin[]>("/admin/audit/frequent-logins"), { t } = useI18n();
  return <>
    <p>{t("frequentLoginHelp")}</p>
    <State loading={resource.loading} error={resource.error} empty={resource.data?.length === 0} reload={resource.reload} />
    <section className="surface"><div className="table-wrap"><table>
      <thead><tr>{["actor", "email", "loginCount", "lastLogin"].map(key => <th key={key}>{t(key)}</th>)}</tr></thead>
      <tbody>{resource.data?.map(row => <tr key={row._id}>
        <td>{row.user.fullName}</td><td>{row.user.email}</td><td>{row.count}</td><td><DateText value={row.lastLogin} /></td>
      </tr>)}</tbody>
    </table></div></section>
  </>;
}
export function AuditLogs() {
  const [tab, setTab] = useState("all");
  const resource = useResource<Audit[]>(tab === "devices" ? "/admin/audit/other-devices" : "/admin/audit"),
    { t } = useI18n();
  return (
    <Page title="audit">
      <div className="tabs">
        <button className={tab === "all" ? "selected" : ""} onClick={() => setTab("all")}>{t("audit")}</button>
        <button className={tab === "frequent" ? "selected" : ""} onClick={() => setTab("frequent")}>{t("frequentLogins")}</button>
        <button className={tab === "devices" ? "selected" : ""} onClick={() => setTab("devices")}>{t("otherDevices")}</button>
      </div>
      {tab === "frequent" ? <FrequentLogins /> : <>
      {tab === "devices" && <p>{t("otherDevicesHelp")}</p>}
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
      </>}
    </Page>
  );
}
