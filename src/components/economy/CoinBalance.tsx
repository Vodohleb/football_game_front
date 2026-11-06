import { Coins } from 'lucide-react';

import { useWalletStore } from '@/stores/walletStore';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

interface CoinBalanceProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-10 px-3 text-sm gap-2',
  lg: 'h-12 px-4 text-base gap-2.5',
};

export function CoinBalance({
  className,
  showLabel = false,
  size = 'md',
}: CoinBalanceProps) {
  const balance = useWalletStore((state) => state.balance);
  const known = useWalletStore((state) => state.known);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-gold/25 bg-gold/10 font-bold text-gold',
        SIZES[size],
        className,
      )}
      title="Монеты"
    >
      <Coins className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {showLabel && <span className="font-medium text-gold/70">Монеты</span>}
      <span className="tabular-nums">
        {known ? formatNumber(balance) : '—'}
      </span>
    </span>
  );
}
