import { Page, DateText } from "../../components/ui";
import { Form } from "../../components/form";
import { useAuth } from "../auth/context";
import { useI18n } from "../../i18n/context";
import { api } from "../../services/api";
import { useResource } from "../../hooks/use-resource";
import type { Academics } from "../../types/domain";
import { academicYearLabel, academicTermLabel } from "../../i18n/academic-year";
export function Profile() {
  const { account, refresh, logout } = useAuth(),
    { t, language } = useI18n(),
    academics = useResource<Academics>("/public/academics");
  if (!account) return null;
  const user = account.user;
  const year = academics.data?.academic_years.find(c => c._id === user.academicYearId);
  return (
    <Page title="profile">
      <div className="profile-grid">
        <section className="surface">
          <div className="profile-heading">
            <span className="avatar large">{user.fullName[0]}</span>
            <div>
              <h2>{user.fullName}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <Form
            initial={{ fullName: user.fullName, phone: user.phone }}
            fields={[{ key: "fullName" }, { key: "phone", type: "tel" }]}
            submit={(values) => api("/profile", "PATCH", values)}
            onDone={() => void refresh()}
          />
          {user.role === "student" && (
            <dl>
              <dt>{t("collegeId")}</dt>
              <dd>
                {academics.data?.colleges.find((c) => c._id === user.collegeId)
                  ?.name || "—"}
              </dd>
              <dt>{t("academicYearId")}</dt>
              <dd>
                {year ? academicYearLabel(year.name, language) : "—"}
              </dd>
              <dt>{t("activeTerm")}</dt>
              <dd>{account.activeTerm ? academicTermLabel(account.activeTerm, year, language) : t("noActiveTerm")}</dd>
              <dt>{t("device")}</dt>
              <dd>
                {account.device ? (
                  <DateText value={account.device.registeredAt} />
                ) : (
                  t("noDevice")
                )}
              </dd>
            </dl>
          )}
        </section>
        <section className="surface">
          <h2>{t("changePassword")}</h2>
          <Form
            label="changePassword"
            fields={[
              { key: "currentPassword", type: "password" },
              { key: "password", type: "password" },
              { key: "confirmPassword", type: "password" },
            ]}
            submit={async (values) => {
              await api("/auth/change-password", "POST", values);
              await logout();
            }}
          />
          {user.role === "student" && (
            <p className="muted">{t("deviceInfo")}</p>
          )}
        </section>
      </div>
    </Page>
  );
}
