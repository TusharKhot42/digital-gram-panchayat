import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function Boom() {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  it('renders a recoverable fallback when a child throws', () => {
    // Silence the expected React error log for this test.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
