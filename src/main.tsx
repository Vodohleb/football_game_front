import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers';
import { useAuthStore } from '@/stores/authStore';
import { shouldRestoreSession } from '@/utils/remember';
import '@/styles/index.css';

if (!shouldRestoreSession()) {
  useAuthStore.getState().clear();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
