import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-text-secondary', className)}>
      <Loader2 className={cn('animate-spin text-accent-primary', SIZES[size])} />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
