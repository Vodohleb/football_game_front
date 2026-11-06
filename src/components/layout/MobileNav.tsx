import { NavLink } from 'react-router-dom';

import { MOBILE_NAV } from '@/components/layout/navItems';
import { cn } from '@/utils/cn';

export function MobileNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-secondary/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-1 pb-1 pt-2.5 text-[10px] font-semibold transition-colors',
                isActive ? 'text-accent-primary' : 'text-text-muted',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
