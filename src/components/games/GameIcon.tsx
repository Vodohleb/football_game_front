import {
  ArrowUpDown,
  EyeOff,
  Grid3X3,
  HelpCircle,
  Layers3,
  Target,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/utils/cn';

const ICONS: Record<string, LucideIcon> = {
  draft: Layers3,
  guess_player: HelpCircle,
  penalty: Target,
  tiki_taka_toe: Grid3X3,
  higher_lower: ArrowUpDown,
  mystery_player: EyeOff,
  pvp_penalty: Target,
  pvp_quiz: HelpCircle,
};

interface GameIconProps {
  code: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-9 w-9 rounded-xl [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6',
  lg: 'h-16 w-16 rounded-2xl [&>svg]:h-8 [&>svg]:w-8',
};

export function GameIcon({ code, className, size = 'md' }: GameIconProps) {
  const Icon = ICONS[code] ?? Target;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border border-white/10 bg-white/5 text-accent-primary',
        SIZES[size],
        className,
      )}
    >
      <Icon />
    </span>
  );
}
