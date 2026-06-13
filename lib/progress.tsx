import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lesson_progress';

interface ProgressCtx {
  completed: Set<string>;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  ready: boolean;
}

const Ctx = createContext<ProgressCtx>({
  completed: new Set(),
  isDone: () => false,
  toggle: () => {},
  ready: false,
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v) {
          try {
            const arr = JSON.parse(v) as string[];
            setCompleted(new Set(arr));
          } catch {}
        }
      })
      .finally(() => setReady(true));
  }, []);

  const persist = (s: Set<string>) => AsyncStorage.setItem(KEY, JSON.stringify([...s]));

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persist(next);
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ completed, isDone: (id) => completed.has(id), toggle, ready }}>
      {children}
    </Ctx.Provider>
  );
}

export const useProgress = () => useContext(Ctx);
