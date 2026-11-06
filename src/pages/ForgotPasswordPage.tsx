import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { notify } from '@/stores/notificationStore';
import { errorMessage } from '@/utils/errors';

const emailSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
});

const resetSchema = z
  .object({
    token: z.string().min(1, 'Введите токен из письма'),
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .regex(/[A-Za-z]/, 'Пароль должен содержать букву')
      .regex(/\d/, 'Пароль должен содержать цифру'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  useDocumentTitle('Восстановление пароля');
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' },
  });

  const request = useMutation({
    mutationFn: (values: EmailValues) =>
      authService.forgotPassword(values.email),
    onSuccess: (data) => {
      setSent(true);
      setMessage(data.message);
      setDevToken(data.reset_token);
      if (data.reset_token) {
        resetForm.setValue('token', data.reset_token);
      }
    },
    onError: (error) => notify.error('Ошибка', errorMessage(error)),
  });

  const reset = useMutation({
    mutationFn: (values: ResetValues) =>
      authService.resetPassword(values.token, values.password),
    onSuccess: () => {
      notify.success('Пароль изменён', 'Теперь войдите с новым паролем.');
      navigate('/login');
    },
    onError: (error) => notify.error('Не удалось изменить пароль', errorMessage(error)),
  });

  if (!sent) {
    return (
      <AuthLayout
        title="Восстановление пароля"
        subtitle="Укажите email, и мы отправим ссылку для сброса пароля."
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Вернуться ко входу
          </Link>
        }
      >
        <form
          className="space-y-4"
          onSubmit={emailForm.handleSubmit((values) => request.mutate(values))}
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="user@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={emailForm.formState.errors.email?.message}
            {...emailForm.register('email')}
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={request.isPending}
          >
            Отправить ссылку
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Новый пароль"
      subtitle={message}
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Вернуться ко входу
        </Link>
      }
    >
      <form
        className="space-y-4"
        onSubmit={resetForm.handleSubmit((values) => reset.mutate(values))}
        noValidate
      >
        {devToken && (
          <div className="rounded-xl border border-gold/25 bg-gold/10 px-3 py-2.5 text-xs text-gold">
            Dev-режим: токен сброса подставлен автоматически.
          </div>
        )}
        <Input
          label="Токен сброса"
          placeholder="Токен из письма"
          leftIcon={<KeyRound className="h-4 w-4" />}
          error={resetForm.formState.errors.token?.message}
          {...resetForm.register('token')}
        />
        <Input
          label="Новый пароль"
          type="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          leftIcon={<Lock className="h-4 w-4" />}
          error={resetForm.formState.errors.password?.message}
          {...resetForm.register('password')}
        />
        <Input
          label="Повторите пароль"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          leftIcon={<Lock className="h-4 w-4" />}
          error={resetForm.formState.errors.confirmPassword?.message}
          {...resetForm.register('confirmPassword')}
        />
        <Button type="submit" size="lg" fullWidth loading={reset.isPending}>
          Сохранить новый пароль
        </Button>
      </form>
    </AuthLayout>
  );
}
