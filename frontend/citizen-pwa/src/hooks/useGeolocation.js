import { useCallback, useState } from 'react';

/**
 * Best-effort reverse geocode via OpenStreetMap Nominatim. Network-guarded and never
 * throws — a failed lookup just leaves the address blank; coordinates are what matter.
 * Only runs when online so it can't stall an offline capture.
 */
async function reverseGeocode(lat, lng) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return '';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

/**
 * Wraps the browser Geolocation API for optional GPS capture on the complaint form.
 * Never auto-fires (blueprint: GPS is optional — a denied/failed lookup must not block
 * submission). Exposes an explicit request() plus granular state so the UI can show loading,
 * the captured coordinates + accuracy, a resolved address, a meaningful error, and a retry.
 * `setManual` lets the citizen correct the location by dragging a map pin.
 *
 * status: idle | loading | granted | denied | unavailable | timeout | error
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy }
  const [status, setStatus] = useState('idle');
  const [address, setAddress] = useState('');

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy, // metres — stored with the complaint
        };
        setCoords(next);
        setStatus('granted');
        // Resolve a human-readable address in the background; UI shows coords immediately.
        reverseGeocode(next.latitude, next.longitude).then(setAddress);
      },
      (err) => {
        setCoords(null);
        // Map the W3C PositionError code to a specific, translatable state.
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
        else if (err.code === err.POSITION_UNAVAILABLE) setStatus('unavailable');
        else if (err.code === err.TIMEOUT) setStatus('timeout');
        else setStatus('error');
      },
      // High accuracy, a generous timeout for weak rural signal, and no cached fix.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  /**
   * Manually set the location (pin drag). Marks accuracy null — it's a human-placed point,
   * not a sensor reading — and refreshes the address for the new spot.
   */
  const setManual = useCallback((latitude, longitude) => {
    setCoords({ latitude, longitude, accuracy: null });
    setStatus('granted');
    reverseGeocode(latitude, longitude).then(setAddress);
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus('idle');
    setAddress('');
  }, []);

  // True whenever the last attempt failed for a reason the citizen can retry.
  const failed = ['denied', 'unavailable', 'timeout', 'error'].includes(status);

  return { coords, status, address, failed, request, setManual, clear };
}
