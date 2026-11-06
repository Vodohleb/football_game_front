import { cn } from '@/utils/cn';

interface ModeSelectorProps {
  modes: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ModeSelector({
  modes,
  value,
  onChange,
  label = 'Режим',
}: ModeSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
              value === mode.value
                ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                : 'border-border bg-bg-card text-text-secondary hover:border-[#3a4b5e] hover:text-text-primary',
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
