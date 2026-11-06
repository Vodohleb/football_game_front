import { getData, postData } from '@/services/api';
import type { AuthData, MeData, Tokens } from '@/types/api';

export const authService = {
  register(body: { email: string; username: string; password: string }) {
    return postData<AuthData>('/auth/register', body);
  },
  login(body: { email: string; password: string }) {
    return postData<AuthData>('/auth/login', body);
  },
  logout() {
    return postData<{ message: string }>('/auth/logout', {});
  },
  refresh() {
    return postData<{ tokens: Tokens }>('/auth/refresh', {});
  },
  me() {
    return getData<MeData>('/auth/me');
  },
  verifyEmail(token: string) {
    return postData<{ message: string }>('/auth/verify-email', { token });
  },
  forgotPassword(email: string) {
    return postData<{ message: string; reset_token: string | null }>(
      '/auth/forgot-password',
      { email },
    );
  },
  resetPassword(token: string, new_password: string) {
    return postData<{ message: string }>('/auth/reset-password', {
      token,
      new_password,
    });
  },
};
