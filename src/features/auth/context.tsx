import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../../services/api";
import type { User, Academic } from "../../types/domain";
export type Account = {
  user: User;
  activeTerm?: Academic;
  device?: { registeredAt: string };
};
const Context = createContext<{
  account?: Account;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}>({ loading: true, refresh: async () => {}, logout: async () => {} });
export function Auth({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(),
    [loading, setLoading] = useState(true);
  const refresh = async () => {
    try {
      setAccount(await api<Account>("/auth/me"));
    } catch {
      setAccount(undefined);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  return (
    <Context.Provider
      value={{
        account,
        loading,
        refresh,
        logout: async () => {
          await api("/auth/logout", "POST");
          setAccount(undefined);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
