import {
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { en, ar } from "./messages";
import "./audit";
import { PreferencesContext } from "./state";
export { useI18n } from "./state";
export function Preferences({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(
      localStorage.getItem("endpoint.language") === "ar" ? "ar" : "en",
    ),
    [theme, setTheme] = useState(
      localStorage.getItem("endpoint.theme") === "dark" ? "dark" : "light",
    );
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("endpoint.language", language);
  }, [language]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("endpoint.theme", theme);
  }, [theme]);
  return (
    <PreferencesContext.Provider
      value={{
        t: (key) =>
          (language === "ar" ? ar : en)[key] ||
          en[key] ||
          (/^[A-Z_]+$/.test(key)
            ? language === "ar"
              ? ar.error!
              : en.error!
            : key),
        language,
        theme,
        toggleLanguage: () => setLanguage((v) => (v === "en" ? "ar" : "en")),
        toggleTheme: () => setTheme((v) => (v === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
