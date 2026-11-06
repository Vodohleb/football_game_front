import { ArrowLeft, Ghost } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuthStore } from '@/stores/authStore';

export default function NotFoundPage() {
  useDocumentTitle('Страница не найдена');
  const token = useAuthStore((state) => state.accessToken);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-bg-card text-accent-primary">
        <Ghost className="h-12 w-12" />
      </div>
      <p className="mt-6 font-display text-6xl font-extrabold text-text-primary">
        404
      </p>
      <h1 className="mt-2 text-xl font-bold text-text-primary">
        Такой страницы нет
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        Возможно, ссылка устарела или страница была перемещена.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link to={token ? '/app/dashboard' : '/'}>
          <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
            {token ? 'На главную' : 'На главную'}
          </Button>
        </Link>
        {token && (
          <Link to="/app/games">
            <Button variant="secondary">К мини-играм</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
