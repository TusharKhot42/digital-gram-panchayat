import { useCallback, useState } from 'react';

/**
 * Wraps the browser Geolocation API for optional GPS capture on the complaint form.
 * Never auto-fires (blueprint: GPS is optional — a denied/failed lookup must not block
 * submission). Exposes an explicit request() plus granular state so the UI can show loading,
 * the captured coordinates + accuracy, a meaningful error, and a retry.
 *
 * status: idle | loading | granted | denied | unavailable | timeout | error
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy }
  const [status, setStatus] = useState('idle');

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy, // metres — stored with the complaint
        });
        setStatus('granted');
      },
      (err) => {
        setCoords(null);
        // Map the W3C PositionError code to a specific, translatable state.
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
        else if (err.code === err.POSITION_UNAVAILABLE) setStatus('unavailable');
        else if (err.code === err.TIMEOUT) setStatus('timeout');
        else setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus('idle');
  }, []);

  // True whenever the last attempt failed for a reason the citizen can retry.
  const failed = ['denied', 'unavailable', 'timeout', 'error'].includes(status);

  return { coords, status, failed, request, clear };
}
