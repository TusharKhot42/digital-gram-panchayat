import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from '@/components/OfflineBanner';

function setOnline(value) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value });
}

describe('OfflineBanner', () => {
  afterEach(() => setOnline(true));

  it('is hidden while online', () => {
    setOnline(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(document.body.textContent).not.toMatch(/offline/i);
  });

  it('appears when the browser goes offline', () => {
    setOnline(true);
    render(<OfflineBanner />);
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(document.body.textContent).toMatch(/offline/i);
  });
});
