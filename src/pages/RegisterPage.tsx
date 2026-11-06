import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { useWalletStore } from '@/stores/walletStore';
import { errorMessage } from '@/utils/errors';
import { rememberLogin } from '@/utils/remember';

const schema = z
  .object({
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    username: z
      .string()
      .min(3, 'Минимум 3 символа')
      .max(32, 'Максимум 32 символа')
      .regex(
        /^[A-Za-z0-9_]+$/,
        'Только латиница, цифры и символ подчёркивания',
      ),
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .regex(/[A-Za-z]/, 'Пароль должен содержать букву')
      .regex(/\d/, 'Пароль должен содержать цифру'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
    terms: z.literal(true, {
      error: 'Необходимо принять условия',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function passwordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score, label: 'Слабый', color: 'bg-red' };
  }
  if (score <= 3) {
    return { score, label: 'Средний', color: 'bg-gold' };
  }
  if (score === 4) {
    return { score, label: 'Хороший', color: 'bg-blue' };
  }
  return { score, label: 'Надёжный', color: 'bg-accent-primary' };
}

export default function RegisterPage() {
  useDocumentTitle('Регистрация');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const password = useWatch({ control, name: 'password' });
  const strength = passwordStrength(password ?? '');

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access_token);
      rememberLogin(true);
      useWalletStore.getState().reset();
      queryClient.clear();
      notify.success(
        'Аккаунт создан!',
        'Стартовые монеты и карточки уже начислены.',
      );
      navigate('/app/dashboard', { replace: true });
    },
    onError: (error) => {
      notify.error('Ошибка регистрации', errorMessage(error));
    },
  });

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Получите стартовые монеты, карточки и место в рейтинге."
      footer={
        <p className="text-sm text-text-secondary">
          Уже зарегистрированы?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent-primary hover:underline"
          >
            Войти
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
          label="Никнейм"
          autoComplete="username"
          placeholder="footballer"
          leftIcon={<UserRound className="h-4 w-4" />}
          error={errors.username?.message}
          hint="3–32 символа: латиница, цифры и _"
          {...register('username')}
        />
        <div>
          <Input
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Минимум 8 символов"
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
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar
                value={strength.score}
                max={5}
                className="flex-1"
                barClassName={strength.color}
              />
              <span className="w-20 text-right text-[11px] text-text-secondary">
                {strength.label}
              </span>
            </div>
          )}
        </div>
        <Input
          label="Повторите пароль"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Повторите пароль"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border bg-bg-secondary accent-accent-primary"
              {...register('terms')}
            />
            <span>
              Я принимаю условия использования и политику конфиденциальности
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-xs text-red">{errors.terms.message}</p>
          )}
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
          Создать аккаунт
        </Button>
      </form>
    </AuthLayout>
  );
}
