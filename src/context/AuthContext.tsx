import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, Role } from '../types';
import * as authService from '../services/authService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginByRole: (role: Role) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    regNo: string;
    password: string;
  }) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'vit-foodhub-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function persist(u: User) {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  const value: AuthContextValue = {
    user,
    loading,
    async login(email, password) {
      setLoading(true);
      try {
        const u = await authService.login(email, password);
        persist(u);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async loginByRole(role) {
      setLoading(true);
      try {
        const u = await authService.loginByRole(role);
        persist(u);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async register(data) {
      setLoading(true);
      try {
        const u = await authService.register(data);
        persist(u);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async requestPasswordReset(email) {
      await authService.requestPasswordReset(email);
    },
    logout() {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
