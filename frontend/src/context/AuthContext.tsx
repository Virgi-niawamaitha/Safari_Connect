import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, LoginPayload, RegisterPayload } from '../types';
import { authApi, getToken, setToken, clearToken } from '../services/api';
import type { ApiUser } from '../services/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const mapRole = (role: string): UserRole => {
  if (role === 'OWNER') return 'owner';
  if (role === 'ADMIN') return 'admin';
  return 'passenger';
};

const mapUser = (apiUser: ApiUser): User => {
  const name = `${apiUser.firstName} ${apiUser.lastName}`.trim();
  const parts = name.split(' ');
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    phone: apiUser.phone ?? '',
    role: mapRole(apiUser.role),
    initials: parts.map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2),
    idNumber: '',
    residence: '',
    trustScore: 90,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from stored token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    authApi.me()
      .then(res => setUser(mapUser(res.data)))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.data.token);
      const u = mapUser(res.data.user);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const backendRole =
        payload.role === 'owner' ? 'OWNER' :
        payload.role === 'admin' ? 'ADMIN' : 'USER';

      const res = await authApi.register({
        firstName: payload.firstName,
        lastName:  payload.lastName,
        email:     payload.email,
        phone:     payload.phone || undefined,
        password:  payload.password,
        role:      backendRole as 'USER' | 'OWNER' | 'ADMIN',
      });
      setToken(res.data.token);
      const u = mapUser(res.data.user);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
