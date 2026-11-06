import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { useWalletStore } from '@/stores/walletStore';
import { errorMessage } from '@/utils/errors';
import { rememberLogin } from '@/utils/remember';

const schema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  useDocumentTitle('Вход');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      authService.login({ email: values.email, password: values.password }),
    onSuccess: (data, variables) => {
      setAuth(data.user, data.tokens.access_token);
      rememberLogin(variables.remember);
      useWalletStore.getState().reset();
      queryClient.clear();
      notify.success('Добро пожаловать!', `Вы вошли как ${data.user.username}`);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/app/dashboard', { replace: true });
    },
    onError: (error) => {
      notify.error('Не удалось войти', errorMessage(error));
    },
  });

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить собирать коллекцию и играть."
      footer={
        <p className="text-sm text-text-secondary">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="font-semibold text-accent-primary hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="user@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-lg p-2 text-text-muted hover:text-text-primary"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          {...register('password')}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-bg-secondary accent-accent-primary"
              {...register('remember')}
            />
            Запомнить вход
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-text-secondary transition-colors hover:text-accent-primary"
          >
            Забыли пароль?
          </Link>
        </div>

        {mutation.isError && (
          <div className="rounded-xl border border-red/25 bg-red/10 px-3 py-2.5 text-sm text-red">
            {errorMessage(mutation.error)}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={mutation.isPending}
        >
          Войти
        </Button>
      </form>
    </AuthLayout>
  );
}
