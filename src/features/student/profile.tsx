import { Page, DateText, State } from "../../components/ui";
import { Form } from "../../components/form";
import { useAuth } from "../auth/context";
import { useI18n } from "../../i18n/context";
import { api } from "../../services/api";
import { useResource } from "../../hooks/use-resource";
import type { Academic, User } from "../../types/domain";
import { academicYearLabel, academicTermLabel } from "../../i18n/academic-year";
export function Profile() {
  const { account, refresh, logout } = useAuth(),
    { t, language } = useI18n(),
    profile = useResource<{ user: User; college?: Academic; academicYear?: Academic; activeTerm?: Academic; device?: { registeredAt: string } }>("/profile");
  if (!account) return null;
  const error = profile.error === "NOT_FOUND" ? "PROFILE_ROUTE_MISSING"
    : profile.error === "INVALID_ACADEMIC_CONTEXT" ? "PROFILE_ACADEMIC_CONTEXT_MISSING"
    : profile.error === "INTERNAL_ERROR" ? "PROFILE_LOAD_FAILED" : profile.error;
  if (!profile.data) return <Page title="profile"><State loading={profile.loading} error={error} reload={profile.reload} /></Page>;
  const user = profile.data.user;
  const year = profile.data.academicYear;
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
            initial={{ fullName: user.fullName, phone: user.phone ?? "" }}
            fields={[{ key: "fullName" }, { key: "phone", type: "tel" }]}
            submit={(values) => api("/profile", "PATCH", values)}
            onDone={() => { profile.reload(); void refresh(); }}
          />
          {user.role === "student" && (
            <dl>
              <dt>{t("collegeId")}</dt>
              <dd>
                {profile.data.college?.name || "—"}
              </dd>
              <dt>{t("academicYearId")}</dt>
              <dd>
                {year ? academicYearLabel(year.name, language) : "—"}
              </dd>
              <dt>{t("activeTerm")}</dt>
              <dd>{profile.data.activeTerm ? academicTermLabel(profile.data.activeTerm, year, language) : t("noActiveTerm")}</dd>
              <dt>{t("device")}</dt>
              <dd>
                {profile.data.device ? (
                  <DateText value={profile.data.device.registeredAt} />
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
