import { cn } from '@/utils/cn';

interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  scrollable?: boolean;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  scrollable = false,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 rounded-xl border border-border bg-bg-card p-1',
        scrollable && 'no-scrollbar overflow-x-auto',
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            value === item.value
              ? 'bg-accent-primary/15 text-accent-primary'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="rounded-full bg-bg-hover px-1.5 text-[10px] font-semibold">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
