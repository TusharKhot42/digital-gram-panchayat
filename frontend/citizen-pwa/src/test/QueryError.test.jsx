import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QueryError } from '@/components/QueryError';

describe('QueryError', () => {
  it('shows the message and calls onRetry when the button is clicked', async () => {
    const onRetry = vi.fn();
    render(<QueryError message="Could not load notices" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load notices');
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when no handler is given', () => {
    render(<QueryError message="No retry here" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
