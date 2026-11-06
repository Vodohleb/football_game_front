import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { ToastViewport } from '@/components/ui/ToastViewport';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastViewport />
    </ErrorBoundary>
  );
}
