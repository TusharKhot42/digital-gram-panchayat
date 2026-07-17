import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default marker icon paths under a bundler.
const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/** Reports map taps as a new pin position (used only when the pin is movable). */
function ClickToPlace({ onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * @param {{
 *   latitude: number, longitude: number, height?: number,
 *   interactive?: boolean, onMove?: (lat:number,lng:number)=>void
 * }} props
 *
 * When `onMove` is supplied the marker is draggable and the map accepts a tap to reposition
 * the pin — letting the citizen correct an imprecise GPS fix. Read-only callers pass no
 * `onMove` and behave exactly as before.
 */
export function MapView({ latitude, longitude, height = 180, interactive = false, onMove }) {
  const center = [latitude, longitude];
  const editable = typeof onMove === 'function';

  return (
    <div className="overflow-hidden rounded-md border border-border" style={{ height }}>
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive || editable}
        dragging={interactive || editable}
        doubleClickZoom={interactive || editable}
        zoomControl={interactive || editable}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={center}
          draggable={editable}
          eventHandlers={
            editable
              ? {
                  dragend(e) {
                    const { lat, lng } = e.target.getLatLng();
                    onMove(lat, lng);
                  },
                }
              : undefined
          }
        />
        {editable ? <ClickToPlace onMove={onMove} /> : null}
      </MapContainer>
    </div>
  );
}
