import { renderHook, act } from '@testing-library/react';
import { useOnline } from '@/hooks/useOnline';

function setOnline(value) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value });
}

describe('useOnline', () => {
  afterEach(() => setOnline(true));

  it('tracks online/offline transitions', () => {
    setOnline(true);
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
