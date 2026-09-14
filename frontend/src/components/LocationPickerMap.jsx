import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically re-center map view when coordinates update
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
}

// Component to listen for direct map click events to place marker
function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      if (onPositionChange) {
        onPositionChange(
          parseFloat(e.latlng.lat.toFixed(6)),
          parseFloat(e.latlng.lng.toFixed(6))
        );
      }
    },
  });
  return null;
}

export const LocationPickerMap = ({ latitude, longitude, onPositionChange }) => {
  const markerRef = useRef(null);

  const validLat = latitude != null && !isNaN(latitude) ? latitude : 13.0827;
  const validLng = longitude != null && !isNaN(longitude) ? longitude : 80.2707;
  const position = [validLat, validLng];

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onPositionChange(
            parseFloat(latLng.lat.toFixed(6)),
            parseFloat(latLng.lng.toFixed(6))
          );
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <div style={{
      height: '240px',
      width: '100%',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--border-glass)',
      margin: '12px 0 16px 0',
      position: 'relative'
    }}>
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={validLat} lng={validLng} />
        <MapClickHandler onPositionChange={onPositionChange} />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
          icon={defaultIcon}
        />
      </MapContainer>
    </div>
  );
};
