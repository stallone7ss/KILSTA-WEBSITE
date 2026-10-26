import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';
import { Button } from './Button';
import { Logo } from '../site/Logo';

describe('shared UI primitives', () => {
  it('renders a button and exposes its busy state while loading', () => {
    const { rerender } = render(<Button>Send request</Button>);
    const button = screen.getByRole('button', { name: 'Send request' });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('aria-busy');

    rerender(<Button loading>Send request</Button>);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders badges with their tone styling', () => {
    render(<Badge tone="warning">Sample</Badge>);
    const badge = screen.getByText('Sample');
    expect(badge.className).toContain('bg-amber-50');
  });

  it('renders the brand logo as a labelled home link', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('link', { name: /KILSTA Business & ICT Consultants/i })
    ).toHaveAttribute('href', '/');
    expect(screen.getByText('Business & ICT Consultants')).toBeInTheDocument();
  });
});
