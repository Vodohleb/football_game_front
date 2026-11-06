import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { UserMenu } from '@/components/layout/UserMenu';
import { ADMIN_NAV } from '@/components/layout/navItems';
import { Logo } from '@/components/layout/Logo';
import { useUiStore } from '@/stores/uiStore';

export function AdminLayout() {
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-bg-secondary/80 backdrop-blur-xl lg:block">
        <SidebarNav sections={ADMIN_NAV} admin />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-3 sm:px-5 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card text-text-secondary lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo to="/admin" compact />
            </div>
            <span className="hidden rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold sm:block">
              Administration
            </span>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-3 pb-10 pt-5 sm:px-5 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileDrawer sections={ADMIN_NAV} admin />
    </div>
  );
}
