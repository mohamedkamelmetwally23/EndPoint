import { createContext, useContext } from "react";

// Keep the shared context independent of translations and provider hot updates.
export const PreferencesContext = createContext<{
  t: (key: string) => string;
  language: string;
  theme: string;
  toggleLanguage: () => void;
  toggleTheme: () => void;
} | null>(null);

export function useI18n() {
  const preferences = useContext(PreferencesContext);
  if (!preferences) throw new Error("useI18n requires Preferences");
  return preferences;
}
