import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SkeletonRows } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('SkeletonRows', () => {
  it('renders the requested number of placeholder rows', () => {
    const { container } = render(<SkeletonRows count={5} />);
    expect(container.querySelectorAll('[aria-busy="true"] > div')).toHaveLength(5);
  });
});

describe('QueryError', () => {
  it('fires onRetry when clicked', async () => {
    const onRetry = vi.fn();
    render(<QueryError message="Load failed" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Load failed');
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

function Boom() {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  it('shows a fallback when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    spy.mockRestore();
  });
});
