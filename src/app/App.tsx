import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { ToastViewport } from '@/components/ui/ToastViewport';

export function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <RouterProvider router={router} />
      <ToastViewport />
    </ErrorBoundary>
  );
}
