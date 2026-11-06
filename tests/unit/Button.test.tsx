import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Играть</Button>);

    const button = screen.getByRole('button', { name: 'Играть' });
    await userEvent.click(button);

    expect(button).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', () => {
    render(<Button loading>Загрузка</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports the danger variant', () => {
    render(<Button variant="danger">Удалить</Button>);
    expect(screen.getByRole('button', { name: 'Удалить' })).toHaveClass('bg-red');
  });
});
