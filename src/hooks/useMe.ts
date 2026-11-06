import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';

export function useMe() {
  const query = useQuery({
    queryKey: ['users', 'me'],
    queryFn: userService.me,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }
    const current = useAuthStore.getState().user;
    if (
      !current ||
      current.username !== query.data.user.username ||
      current.role !== query.data.user.role
    ) {
      useAuthStore.getState().setUser(query.data.user);
    }
    if (query.data.wallet) {
      useWalletStore.getState().setBalance(query.data.wallet.balance);
    }
  }, [query.data]);

  return query;
}
