import { ActionLabel } from "../components/action-label";
import { useState } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  CalendarDays,
  BookOpen,
  Compass,
  UserRound,
  LayoutDashboard,
  Building2,
  Users,
  ShoppingBag,
  Wallet,
  History,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../features/auth/context";
import { useI18n } from "../i18n/context";
import { PreferencesControls, State } from "../components/ui";
export function Workspace() {
  const { account, loading, logout } = useAuth(),
    { t } = useI18n(),
    [open, setOpen] = useState(false);
  if (loading) return <State loading />;
  if (!account) return <Navigate to="/login" replace />;
  const role = account.user.role;
  const items =
    role === "student"
      ? ([
          ["timeline", CalendarDays],
          ["learning", BookOpen],
          ["explore", Compass],
          ["profile", UserRound],
        ] as const)
      : role === "super_admin"
        ? ([
            ["dashboard", LayoutDashboard],
            ["academics", Building2],
            ["packages", BookOpen],
            ["people", Users],
            ["orders", ShoppingBag],
            ["finance", Wallet],
            ["audit", History],
            ["profile", UserRound],
          ] as const)
        : role === "lecturer"
          ? ([
              ["home", LayoutDashboard],
              ["myContent", BookOpen],
              ["students", Users],
              ["finance", Wallet],
              ["profile", UserRound],
            ] as const)
          : ([
              ["home", LayoutDashboard],
              ["myContent", BookOpen],
              ["finance", Wallet],
              ["profile", UserRound],
            ] as const);
  return (
    <div className="workspace">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <img src="/brand/endpoint-logo.png" alt="Endpoint" />
          <button
            className="mobile-only quiet"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <p className="role-label">{t(role)}</p>
        <nav aria-label={t("app")}>
          {items.map(([label, Icon]) => (
            <NavLink
              key={label}
              to={`/${label}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={20} />
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-account">
          <NavLink to="/profile" className="sidebar-account-profile" onClick={() => setOpen(false)}>
            <span className="avatar">{account.user.fullName.trim().split(/\s+/).slice(0, 2).map((name) => name[0]).join("").toUpperCase()}</span>
            <div className="sidebar-account-info">
              <strong>{account.user.fullName}</strong>
              <small>{t(role)}</small>
            </div>
          </NavLink>
          <button className="sidebar-logout" onClick={() => void logout()}>
            <ActionLabel action="logout" />
          </button>
        </div>
      </aside>
      {open && (
        <button
          aria-label={t("close")}
          className="scrim"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace-body">
        <header className="topbar">
          <button
            className="mobile-only quiet"
            aria-label={t("mobileNav")}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="topbar-context">
            {t("app")} <span>/</span> {t(role)}
          </span>
          <PreferencesControls />
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
