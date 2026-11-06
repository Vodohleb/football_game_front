import { useQuery } from '@tanstack/react-query';
import { Menu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/layout/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { CoinBalance } from '@/components/economy/CoinBalance';
import { RatingBadge } from '@/components/economy/RatingBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { economyService } from '@/services/economyService';
import { ratingService } from '@/services/ratingService';
import { useMe } from '@/hooks/useMe';
import { useUiStore } from '@/stores/uiStore';
import { formatNumber } from '@/utils/format';

export function Header() {
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen);
  const { data: me } = useMe();
  const { data: progress } = useQuery({
    queryKey: ['economy', 'progress'],
    queryFn: economyService.progress,
    staleTime: 30_000,
  });
  const { data: myRating } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-3 sm:px-5 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card text-text-secondary transition-colors hover:text-text-primary lg:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="lg:hidden">
          <Logo compact />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Tooltip content="Уровень и накопленный опыт">
            <span className="flex items-center gap-1.5 rounded-full border border-accent-primary/20 bg-accent-primary/10 px-3 py-1.5 text-xs font-bold text-accent-primary">
              <Zap className="h-3.5 w-3.5" />
              LVL {me?.profile?.level ?? progress?.level ?? '—'}
            </span>
          </Tooltip>
          <span className="hidden text-xs text-text-muted xl:block">
            {formatNumber(me?.profile?.xp ?? progress?.xp)} XP
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/app/leaderboard" className="hidden sm:block">
            <RatingBadge
              rating={myRating?.global_rating}
              rank={myRating?.global_rank}
              compact
            />
          </Link>
          <Link to="/app/shop/packs">
            <CoinBalance size="sm" className="sm:h-9 sm:px-3" />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
