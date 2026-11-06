import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { ApiMeta } from '@/types/api';

interface PaginationProps {
  meta: ApiMeta | null | undefined;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.total_pages <= 1) {
    return null;
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-xs text-text-secondary">
        Страница {meta.page} из {meta.total_pages} · всего {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Назад
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={meta.page >= meta.total_pages}
          onClick={() => onPageChange(meta.page + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Вперёд
        </Button>
      </div>
    </div>
  );
}
