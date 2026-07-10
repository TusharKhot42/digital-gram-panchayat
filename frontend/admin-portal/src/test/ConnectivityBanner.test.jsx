import { render, screen, act } from '@testing-library/react';
import { ConnectivityBanner } from '@/components/ConnectivityBanner';

function setOnline(value) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value });
}

describe('ConnectivityBanner', () => {
  afterEach(() => setOnline(true));

  it('is silent while online', () => {
    setOnline(true);
    render(<ConnectivityBanner />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(document.body.textContent).not.toMatch(/offline/i);
  });

  it('warns when offline', () => {
    setOnline(true);
    render(<ConnectivityBanner />);
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(document.body.textContent).toMatch(/offline/i);
  });
});
