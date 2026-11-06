import { Spinner } from '@/components/ui/Spinner';

interface LoadingScreenProps {
  label?: string;
  fullscreen?: boolean;
}

export function LoadingScreen({
  label = 'Загрузка...',
  fullscreen = false,
}: LoadingScreenProps) {
  return (
    <div
      className={
        fullscreen
          ? 'flex min-h-screen items-center justify-center'
          : 'flex min-h-60 items-center justify-center'
      }
    >
      <Spinner size="lg" label={label} />
    </div>
  );
}
