import { LogOut, ShieldCheck } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { Logo } from '@/components/layout/Logo';
import { APP_NAV, type NavSection } from '@/components/layout/navItems';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { usePvpStore } from '@/stores/pvpStore';
import { useWalletStore } from '@/stores/walletStore';
import { cn } from '@/utils/cn';

interface SidebarNavProps {
  sections?: NavSection[];
  onNavigate?: () => void;
  admin?: boolean;
}

export function SidebarNav({
  sections = APP_NAV,
  onNavigate,
  admin = false,
}: SidebarNavProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isPrivileged = user?.role === 'admin' || user?.role === 'superadmin';

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // The local session is cleared regardless of the server response.
    }
    useAuthStore.getState().clear();
    useWalletStore.getState().reset();
    useGameStore.getState().clearAll();
    usePvpStore.getState().clear();
    onNavigate?.();
    navigate('/');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo to={admin ? '/admin' : '/app/dashboard'} />
      </div>

      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent-primary/12 text-accent-primary'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                    )
                  }
                >
                  <item.icon className="h-4.5 w-4.5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-gold px-1.5 text-[10px] font-bold text-bg-primary">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        {isPrivileged && !admin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            Админ-панель
          </NavLink>
        )}
        {admin && (
          <NavLink
            to="/app/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            Игровая часть
          </NavLink>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-red/10 hover:text-red"
        >
          <LogOut className="h-4.5 w-4.5" />
          Выйти
        </button>
      </div>
    </div>
  );
}
