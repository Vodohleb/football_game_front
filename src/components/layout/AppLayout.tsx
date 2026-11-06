import { motion, useReducedMotion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Header } from '@/components/layout/Header';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { MobileNav } from '@/components/layout/MobileNav';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AchievementWatcher } from '@/components/feedback/AchievementWatcher';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useMe } from '@/hooks/useMe';
import { useAuthStore } from '@/stores/authStore';
import { normalizeError } from '@/utils/errors';

export function AppLayout() {
  const { data: me, error, isLoading } = useMe();
  const clear = useAuthStore((state) => state.clear);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const level = me?.profile?.level;
  const userId = me?.user.id;

  useEffect(() => {
    if (error && normalizeError(error).status === 401) {
      clear();
    }
  }, [error, clear]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    if (!level || !userId) {
      return;
    }
    const key = `football-arena-level-${userId}`;
    const previousRaw = localStorage.getItem(key);
    if (previousRaw !== null && level > Number(previousRaw)) {
      setLevelUp(level);
    }
    localStorage.setItem(key, String(level));
  }, [level, userId]);

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
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <MobileNav />
      <MobileDrawer />
      <AchievementWatcher />

      <Modal
        open={levelUp !== null}
        onClose={() => setLevelUp(null)}
        title="Новый уровень!"
        size="sm"
        footer={
          <Button fullWidth onClick={() => setLevelUp(null)}>
            Продолжить
          </Button>
        }
      >
        <div className="text-center">
          <motion.div
            initial={reduceMotion ? false : { scale: 0.5, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/30 bg-gold/10 text-gold"
          >
            <Trophy className="h-10 w-10" />
          </motion.div>
          <p className="mt-4 font-display text-5xl font-extrabold text-text-primary">
            {levelUp}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Открыт новый уровень профиля. Продолжайте играть, чтобы получать
            ещё больше наград.
          </p>
        </div>
      </Modal>
    </div>
  );
}
