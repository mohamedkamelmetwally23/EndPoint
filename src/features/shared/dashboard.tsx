import { useAuth } from "../auth/context";
import { useResource } from "../../hooks/use-resource";
import { Page, State, Money, DateText } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import type { Audit, Finance } from "../../types/domain";
import { FinanceChart } from "./finance";
import { Wallet, Users, BookOpen, Layers3 } from "lucide-react";
export function Dashboard() {
  const { account } = useAuth(),
    resource = useResource<{
      stats: Record<string, number>;
      activity: Audit[];
      accounts?: Finance;
    }>("/staff/dashboard"),
    { t } = useI18n();
  return (
    <Page title={account?.user.role === "super_admin" ? "dashboard" : "home"}>
      <State
        loading={resource.loading}
        error={resource.error}
        reload={resource.reload}
      />
      <div className="stat-grid">
        {Object.entries(resource.data?.stats || {}).map(([key, value]) => (
          <section className="stat" key={key}>
            <span className="stat-icon">
              {["revenue", "expenseTotal", "netProfit"].includes(key) ? (
                <Wallet size={21} aria-hidden="true" />
              ) : key.toLowerCase().includes("student") ? (
                <Users size={21} aria-hidden="true" />
              ) : key.toLowerCase().includes("lecture") ? (
                <BookOpen size={21} aria-hidden="true" />
              ) : (
                <Layers3 size={21} aria-hidden="true" />
              )}
            </span>
            <span>{t(key)}</span>
            <strong>
              {["revenue", "expenseTotal", "netProfit"].includes(key) ? (
                <Money value={value} />
              ) : (
                value
              )}
            </strong>
          </section>
        ))}
      </div>
      {resource.data?.accounts && (
        <FinanceChart data={resource.data.accounts} />
      )}
      <section className="surface">
        <h2>{t("recentActivity")}</h2>
        <div className="record-list">
          {resource.data?.activity.map((a) => (
            <div key={a._id}>
              <span>{a.actor?.fullName}</span>
              <strong>{t(a.action)}</strong>
              <small>
                <DateText value={a.timestamp} />
              </small>
            </div>
          ))}
        </div>
        <State empty={resource.data?.activity.length === 0} />
      </section>
    </Page>
  );
}
