import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "../../services/api";
import type { User } from "../../types/domain";
export type Account = {
  user: Pick<User, "_id" | "fullName" | "role">;
};
const Context = createContext<{
  account?: Account;
  loading: boolean;
  refresh: () => Promise<void>;
  acceptLogin: (account: Account) => void;
  logout: () => Promise<void>;
}>({ loading: true, refresh: async () => {}, acceptLogin: () => {}, logout: async () => {} });
export function Auth({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(),
    [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const value = await api<Account>("/auth/me");
      if (current === generation.current) setAccount(value);
    } catch {
      if (current === generation.current) setAccount(undefined);
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <Context.Provider
      value={{
        account,
        loading,
        refresh,
        acceptLogin: (value) => { generation.current++; setAccount(value); setLoading(false); },
        logout: async () => {
          generation.current++;
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
