import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { SidebarNav } from '@/components/layout/SidebarNav';
import type { NavSection } from '@/components/layout/navItems';
import { useUiStore } from '@/stores/uiStore';

interface MobileDrawerProps {
  sections?: NavSection[];
  admin?: boolean;
}

export function MobileDrawer({ sections, admin = false }: MobileDrawerProps) {
  const open = useUiStore((state) => state.mobileMenuOpen);
  const setOpen = useUiStore((state) => state.setMobileMenuOpen);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="relative h-full w-72 border-r border-border bg-bg-secondary shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNav
              sections={sections}
              admin={admin}
              onNavigate={() => setOpen(false)}
            />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
