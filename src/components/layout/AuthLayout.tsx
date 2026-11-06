import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/layout/Logo';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden flex-1 overflow-hidden border-r border-border bg-bg-secondary p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-accent-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-blue/10 blur-3xl" />
        <div className="relative">
          <Logo />
          <h2 className="mt-16 max-w-md font-display text-4xl font-extrabold leading-tight text-text-primary">
            Твоя футбольная
            <span className="text-gradient"> арена</span> начинается здесь
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
            Шесть мини-игр, коллекция карточек, собственный клуб и PvP-сражения
            в одном месте. Играй, зарабатывай монеты и поднимайся в рейтинге.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            { value: '6', label: 'мини-игр' },
            { value: '3', label: 'типа паков' },
            { value: 'PvP', label: 'дуэли' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-bg-card/70 px-4 py-4 backdrop-blur"
            >
              <p className="font-display text-2xl font-extrabold text-accent-primary">
                {item.value}
              </p>
              <p className="text-xs text-text-secondary">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between px-5 lg:hidden">
          <Logo />
          <Link to="/" className="text-xs text-text-secondary hover:text-text-primary">
            На главную
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 hidden text-xs text-text-muted transition-colors hover:text-text-primary lg:inline-block"
            >
              ← На главную
            </Link>
            <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
            )}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
