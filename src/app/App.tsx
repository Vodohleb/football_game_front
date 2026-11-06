import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';
import { ToastViewport } from '@/components/ui/ToastViewport';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastViewport />
    </>
  );
}
