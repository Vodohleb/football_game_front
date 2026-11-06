import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-5xl font-extrabold text-red">Ошибка</p>
          <h1 className="mt-3 text-xl font-bold text-text-primary">
            Что-то пошло не так
          </h1>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            {this.state.message || 'Неизвестная ошибка интерфейса.'}
          </p>
          <Button
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
