import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, LoginPayload, RegisterPayload } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeUser(role: UserRole, name: string, email: string): User {
  const parts = name.split(' ');
  return {
    id: crypto.randomUUID(),
    name,
    email,
    phone: '0712 345 678',
    role,
    initials: parts.map(p => p[0]).join('').toUpperCase().slice(0, 2),
    idNumber: '23456789',
    residence: 'Nairobi',
    trustScore: 94,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async ({ email, password: _password, role }: LoginPayload): Promise<User> => {
    setIsLoading(true);
    // Simulate API call — replace with real endpoint
    await new Promise(r => setTimeout(r, 700));
    const nameMap: Record<UserRole, string> = {
      passenger: 'Jane Mwangi',
      owner: 'Modern Coast Sacco',
      admin: 'Platform Admin',
    };
    const u = makeUser(role, nameMap[role], email);
    setUser(u);
    setIsLoading(false);
    return u;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    // Simulate API call — replace with real endpoint
    await new Promise(r => setTimeout(r, 900));
    const u = makeUser(payload.role, `${payload.firstName} ${payload.lastName}`, payload.email);
    u.phone = payload.phone;
    u.idNumber = payload.idNumber;
    setUser(u);
    setIsLoading(false);
    return u;
  }, []);

  const logout = useCallback(() => setUser(null), []);

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
