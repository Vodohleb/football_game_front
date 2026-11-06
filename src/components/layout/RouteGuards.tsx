import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useMe } from '@/hooks/useMe';
import { useAuthStore } from '@/stores/authStore';

export function RequireAuth() {
  const token = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const { isLoading } = useMe();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (isLoading && !user) {
    return <LoadingScreen fullscreen label="Проверяем права..." />;
  }

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.accessToken);
  if (token) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}
