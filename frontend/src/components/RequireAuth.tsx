import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RequireAuthProps {
  role?: UserRole;
  children: React.ReactNode;
}

const ROLE_HOME: Record<UserRole, string> = {
  passenger: '/passenger/home',
  owner:     '/owner/dashboard',
  admin:     '/admin/dashboard',
};

export default function RequireAuth({ role, children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const loginPath = role ? `/auth/login?role=${role}` : '/auth/login?role=passenger';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <>{children}</>;
}
