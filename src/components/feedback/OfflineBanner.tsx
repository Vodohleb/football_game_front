import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import { notify } from '@/stores/notificationStore';

function initialOnlineState(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }
  return navigator.onLine;
}

export function OfflineBanner() {
  const [online, setOnline] = useState(initialOnlineState);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      notify.success('Соединение восстановлено');
    };
    const handleOffline = () => {
      setOnline(false);
      notify.warning(
        'Нет подключения к интернету',
        'Проверьте сеть. Активная игровая сессия сохранена.',
      );
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-3 border-b border-red/30 bg-[#2a1215] px-3 py-2 text-xs font-semibold text-red"
          role="status"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Нет подключения к интернету</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-md border border-red/30 px-2 py-1 text-[10px] uppercase tracking-wide transition-colors hover:bg-red/10"
          >
            <RefreshCw className="h-3 w-3" />
            Повторить
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
