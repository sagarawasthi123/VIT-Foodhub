import { Navigate } from 'react-router-dom';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    const home = `/${user.role}`;
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
