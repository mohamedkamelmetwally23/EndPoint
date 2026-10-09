import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { api } from "../services/api";
import { ActionLabel } from "./action-label";
import { Dialog } from "./dialog";
import {
  ChevronLeft,
  Languages,
  Moon,
  Sun,
  Inbox,
  LoaderCircle,
  BookOpen,
  Building2,
  LayoutDashboard,
  Users,
  Wallet,
  CalendarDays,
  UserRound,
  History,
  ShoppingBag,
  Compass,
} from "lucide-react";
const pageIcons = {
  dashboard: LayoutDashboard,
  home: LayoutDashboard,
  academics: Building2,
  packages: BookOpen,
  myContent: BookOpen,
  learning: BookOpen,
  people: Users,
  students: Users,
  finance: Wallet,
  timeline: CalendarDays,
  profile: UserRound,
  audit: History,
  orders: ShoppingBag,
  explore: Compass,
};
export function Page({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { t } = useI18n();
  const Icon = pageIcons[title as keyof typeof pageIcons] || BookOpen;
  return (
    <>
      <header className="page-heading">
        <div className="page-heading-title">
          <span className="page-icon">
            <Icon size={26} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">{t("app")}</p>
            <h1>{t(title)}</h1>
          </div>
        </div>
        <div className="actions">{actions}</div>
      </header>
      {children}
    </>
  );
}
export function State({
  loading,
  error,
  empty,
  emptyLabel = "empty",
  reload,
}: {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyLabel?: string;
  reload?: () => void;
}) {
  const { t } = useI18n();
  if (loading)
    return (
      <p role="status" className="state">
        <LoaderCircle className="spin" size={24} aria-hidden="true" />
        {t("loading")}
      </p>
    );
  if (error)
    return (
      <div role="alert" className="state error">
        {t(error)} {reload && <button onClick={reload}>{t("retry")}</button>}
      </div>
    );
  if (empty)
    return (
      <div className="state">
        <span className="empty-icon">
          <Inbox size={30} aria-hidden="true" />
        </span>
          <h2>{t(emptyLabel)}</h2>
      </div>
    );
  return null;
}
export function Badge({ value }: { value: string }) {
  const { t } = useI18n();
  return <span className={`badge ${value}`}>{t(value)}</span>;
}
export function Money({ value }: { value: number }) {
  const { language } = useI18n();
  return (
    <>
      {new Intl.NumberFormat(language, {
        style: "currency",
        currency: "EGP",
      }).format(value / 100)}
    </>
  );
}
export function DateText({ value }: { value?: string }) {
  const { language } = useI18n();
  return (
    <>
      {value
        ? new Intl.DateTimeFormat(language, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(value))
        : "—"}
    </>
  );
}
export function Progress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const { t } = useI18n();
  return (
    <div className="progress">
      <div>
        <span>{t("progress")}</span>
        <span dir="ltr">
          {completed} / {total}
        </span>
      </div>
      <progress value={completed} max={total || 1} />
    </div>
  );
}
export function Action({
  path,
  method = "POST",
  body,
  label,
  onDone,
  confirm = false,
}: {
  path: string;
  method?: string;
  body?: unknown;
  label: string;
  onDone: () => void;
  confirm?: boolean;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false),
    [confirming, setConfirming] = useState(false),
    [error, setError] = useState("");
  const execute = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api(path, method, body);
      setConfirming(false);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "INTERNAL_ERROR");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="inline-action">
      <button
        className={label === "delete" ? "danger-action" : undefined}
        title={t(label)}
        disabled={busy}
        onClick={() => {
          setError("");
          if (confirm) setConfirming(true);
          else void execute();
        }}
      >
        <ActionLabel action={busy ? "loading" : label} />
      </button>
      {confirming && (
        <Dialog className="confirmation-dialog" title={t("confirmAction")} onClose={() => { if (!busy) setConfirming(false); }}>
          <div className="confirmation-icon"><ShoppingBag size={28} aria-hidden="true" /></div>
          <h3 className="confirmation-action">{t(label)}</h3>
          {label === "completeOrder" && <p className="confirmation-description">{t("completeOrderHelp")}</p>}
          {error && <p role="alert" className="error">{t(error)}</p>}
          <div className="confirmation-buttons">
            <button className={label === "delete" ? "danger-action" : "primary"} disabled={busy} onClick={() => void execute()}>
              <ActionLabel action={busy ? "loading" : label} />
            </button>
            <button disabled={busy} onClick={() => setConfirming(false)}>{t("goBack")}</button>
          </div>
        </Dialog>
      )}
      {error && !confirming && (
        <span role="alert" className="error">
          {t(error)}
        </span>
      )}
    </div>
  );
}
export function Back({ to }: { to: string }) {
  const { t } = useI18n();
  return (
    <Link className="back" to={to}>
      <ChevronLeft size={18} aria-hidden="true" />
      {t("back")}
    </Link>
  );
}
export function PreferencesControls() {
  const { t, language, theme, toggleLanguage, toggleTheme } = useI18n();
  return (
    <div className="actions">
      <button
        className="quiet"
        aria-label={t("language")}
        onClick={toggleLanguage}
      >
        <Languages size={18} aria-hidden="true" />
        {language === "en" ? "العربية" : "English"}
      </button>
      <button className="quiet" aria-label={t("theme")} onClick={toggleTheme}>
        {theme === "light" ? (
          <Moon size={19} aria-hidden="true" />
        ) : (
          <Sun size={19} aria-hidden="true" />
        )}
        <span className="sr-only">
          {t(theme === "light" ? "dark" : "light")}
        </span>
      </button>
    </div>
  );
}
