import { useCallback, useState } from 'react';

/**
 * Wraps the browser Geolocation API. GPS is optional (blueprint: denied -> proceed),
 * so this exposes explicit request() + state rather than auto-firing on mount.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy }
  const [status, setStatus] = useState('idle'); // idle | loading | granted | denied | unavailable

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus('granted');
      },
      () => {
        setCoords(null);
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus('idle');
  }, []);

  return { coords, status, request, clear };
}
