import { ActionLabel } from "../../components/action-label";
import { useState } from "react";
import { UserPlus, LogIn } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Form, type Values } from "../../components/form";
import { PreferencesControls, State } from "../../components/ui";
import { useI18n } from "../../i18n/context";
import { useAuth } from "./context";
import { api } from "../../services/api";
import { useResource } from "../../hooks/use-resource";
import type { Academics } from "../../types/domain";
import { fieldPlaceholder } from "../../i18n/placeholders";
import { academicYearLabel } from "../../i18n/academic-year";
import { PasswordInput } from "../../components/password-input";
import { StudyArt } from "./study-art";
export function AuthPage({ register = false }: { register?: boolean }) {
  const { t, language } = useI18n(),
    { account, refresh } = useAuth(),
    navigate = useNavigate(),
    academic = useResource<Academics>("/public/academics");
  const [college, setCollege] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (account) return <Navigate to="/" replace />;
  const submit = async (values: Values) => {
    if (register) {
      await api("/auth/register", "POST", values);
      await api("/auth/login", "POST", {
        email: values.email,
        password: values.password,
      });
      await refresh();
      navigate("/", { replace: true });
    } else {
      await api("/auth/login", "POST", values);
      await refresh();
      navigate("/");
    }
  };
  return (
    <div className={`auth-page ${register ? "auth-register" : ""}`}>
      <section className="auth-brand">
        <img src="/brand/endpoint-logo.png" alt="Endpoint" />
        <StudyArt />
        <div className="auth-brand-copy">
          <h1>{t("welcome")}</h1>
          <p>{t("authIntro")}</p>
        </div>
      </section>
      <main className="auth-main">
        <PreferencesControls />
        <div className="auth-card">
          <h2>{t(register ? "register" : "login")}</h2>
          <State
            error={register ? academic.error : undefined}
            reload={academic.reload}
          />
          {register ? (
            <form
              className="form register-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                setBusy(true);
                setError("");
                try {
                  await submit(Object.fromEntries(form.entries()) as Values);
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : "INTERNAL_ERROR";
                  setError(message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                {t("fullName")}
                <input
                  name="fullName"
                  placeholder={fieldPlaceholder("fullName", language, t)}
                  required
                  minLength={2}
                />
              </label>
              <label>
                {t("email")}
                <input
                  name="email"
                  placeholder={fieldPlaceholder("email", language, t)}
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                {t("phone")}
                <input
                  name="phone"
                  type="tel"
                  placeholder={fieldPlaceholder("phone", language, t)}
                  required
                />
              </label>
              <label>
                {t("collegeId")}
                <select
                  aria-label={t("collegeId")}
                  name="collegeId"
                  value={college}
                  disabled={academic.loading || !academic.data?.colleges.length}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                >
                  <option value="">{t("choose")}</option>
                  {academic.data?.colleges.filter((c) => c.status === "active").map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("academicYearId")}
                <select
                  aria-label={t("academicYearId")}
                  name="academicYearId"
                  key={college}
                  disabled={!college || academic.loading}
                  required
                >
                  <option value="">{t("choose")}</option>
                  {academic.data?.academic_years
                    .filter((y) => y.collegeId === college && y.status === "active")
                    .sort((a, b) => Number(a.name) - Number(b.name) || a.name.localeCompare(b.name))
                    .map((y) => (
                      <option value={y._id} key={y._id}>
                        {academicYearLabel(y.name, language)}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                {t("password")}
                <PasswordInput
                  name="password"
                  placeholder={fieldPlaceholder("newPassword", language, t)}
                  type="password"
                  minLength={12}
                  required
                  autoComplete="new-password"
                />
              </label>
              <label>
                {t("confirmPassword")}
                <PasswordInput
                  name="confirmPassword"
                  placeholder={fieldPlaceholder("confirmPassword", language, t)}
                  type="password"
                  minLength={12}
                  required
                  autoComplete="new-password"
                />
              </label>
              {error && (
                <p role="alert" className="error">
                  {t(error)}
                </p>
              )}
              <button className="primary" disabled={busy}>
                <ActionLabel
                  action={busy ? "loading" : "register"}
                  compact={false}
                />
              </button>
            </form>
          ) : (
            <Form
              fields={[
                { key: "email", type: "email", autoComplete: "username" },
                { key: "password", type: "password", autoComplete: "current-password" },
              ]}
              submit={submit}
              label="login"
            />
          )}
          <Link className="auth-switch-link" to={register ? "/login" : "/register"}>
            {register ? <LogIn size={19} aria-hidden="true" /> : <UserPlus size={19} aria-hidden="true" />}
            {t(register ? "login" : "register")}
          </Link>
        </div>
      </main>
    </div>
  );
}
