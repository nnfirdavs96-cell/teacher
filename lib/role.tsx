import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Role } from '@/data/types';

const KEY = 'user_role';

interface RoleCtx {
  role: Role | null;
  ready: boolean;
  setRole: (r: Role | null) => void;
}

const Ctx = createContext<RoleCtx>({ role: null, ready: false, setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'tv' || v === 'net') setRoleState(v);
      })
      .finally(() => setReady(true));
  }, []);

  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (r) AsyncStorage.setItem(KEY, r);
    else AsyncStorage.removeItem(KEY);
  };

  return <Ctx.Provider value={{ role, ready, setRole }}>{children}</Ctx.Provider>;
}

export const useRole = () => useContext(Ctx);

export const ROLE_LABEL: Record<Role, string> = {
  tv: 'ТВ-мастер',
  net: 'Сети / сисадмин',
};
