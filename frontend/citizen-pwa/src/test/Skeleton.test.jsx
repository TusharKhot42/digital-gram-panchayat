import { render, screen } from '@testing-library/react';
import { SkeletonList } from '@/components/Skeleton';

describe('SkeletonList', () => {
  it('renders the requested number of placeholder items and marks itself busy', () => {
    render(<SkeletonList count={3} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-busy', 'true');
    expect(list.querySelectorAll('li')).toHaveLength(3);
  });
});
