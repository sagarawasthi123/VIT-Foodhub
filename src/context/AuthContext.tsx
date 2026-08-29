import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, Role } from '../types';
import * as authService from '../services/authService';
import { supabase } from '../lib/supabase';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        (async () => {
          try {
            const profile = await authService.fetchProfile(data.session.user.id);
            setUser(profile);
          } catch {
            setUser(null);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        (async () => {
          try {
            const profile = await authService.fetchProfile(session.user.id);
            setUser(profile);
          } catch {
            setUser(null);
          }
        })();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    async login(email, password) {
      setLoading(true);
      try {
        const u = await authService.login(email, password);
        setUser(u);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async loginByRole(role) {
      setLoading(true);
      try {
        const u = await authService.loginByRole(role);
        setUser(u);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async register(data) {
      setLoading(true);
      try {
        const u = await authService.register(data);
        setUser(u);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async requestPasswordReset(email) {
      await authService.requestPasswordReset(email);
    },
    logout() {
      (async () => {
        await supabase.auth.signOut();
        setUser(null);
      })();
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
