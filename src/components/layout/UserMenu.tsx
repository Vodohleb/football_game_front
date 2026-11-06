import { ChevronDown, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { usePvpStore } from '@/stores/pvpStore';
import { useWalletStore } from '@/stores/walletStore';

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout.
    }
    useAuthStore.getState().clear();
    useWalletStore.getState().reset();
    useGameStore.getState().clearAll();
    usePvpStore.getState().clear();
    navigate('/');
  };

  const username = user?.username ?? 'Player';
  const privileged = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl border border-border bg-bg-card py-1.5 pl-1.5 pr-2 transition-colors hover:border-[#3a4b5e]"
      >
        <Avatar name={username} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-text-primary sm:block">
          {username}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-text-primary">
              {username}
            </p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <Link
            to="/app/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary"
          >
            <UserRound className="h-4 w-4" />
            Профиль
          </Link>
          {privileged && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold hover:bg-gold/10"
            >
              <ShieldCheck className="h-4 w-4" />
              Админ-панель
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-left text-sm text-red hover:bg-red/10"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
