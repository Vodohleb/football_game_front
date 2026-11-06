import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/Header';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { MobileNav } from '@/components/layout/MobileNav';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useMe } from '@/hooks/useMe';
import { useAuthStore } from '@/stores/authStore';
import { normalizeError } from '@/utils/errors';

export function AppLayout() {
  const { error, isLoading } = useMe();
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    if (error && normalizeError(error).status === 401) {
      clear();
    }
  }, [error, clear]);

  if (isLoading) {
    return <LoadingScreen label="Загружаем профиль..." fullscreen />;
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-bg-secondary/80 backdrop-blur-xl lg:block">
        <SidebarNav />
      </aside>
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-3 pb-24 pt-5 sm:px-5 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <MobileDrawer />
    </div>
  );
}
