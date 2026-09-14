import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Refrigerator, MapPin, Navigation, Package, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet with Vite/Webpack
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center: Chennai, Tamil Nadu (Anna Nagar)
const DEFAULT_CENTER = [13.0827, 80.2707];
const DEFAULT_ZOOM = 12;

export const FridgeMap = ({ fridges = [], height = '500px', selectedFridgeId = null, onSelectFridge }) => {
  // Determine center coordinates based on valid fridges
  const validFridges = fridges.filter(f => f.latitude != null && f.longitude != null);
  
  const mapCenter = validFridges.length > 0
    ? [validFridges[0].latitude, validFridges[0].longitude]
    : DEFAULT_CENTER;

  return (
    <div style={{
      height,
      width: '100%',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-glass)',
      boxShadow: 'var(--shadow-card)',
      position: 'relative'
    }}>
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validFridges.map((fridge) => {
          const isSelected = selectedFridgeId === fridge.id;
          const statusColor = fridge.status === 'ACTIVE' ? '#10b981' : '#f59e0b';
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fridge.latitude},${fridge.longitude}`;

          return (
            <Marker
              key={fridge.id}
              position={[fridge.latitude, fridge.longitude]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectFridge) onSelectFridge(fridge);
                }
              }}
            >
              <Popup className="custom-fridge-popup">
                <div style={{ padding: '8px 4px', minWidth: '220px', fontFamily: 'system-ui, sans-serif' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)', color: '#059669',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Refrigerator size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>
                        {fridge.name}
                      </h4>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: fridge.status === 'ACTIVE' ? '#d1fae5' : '#fef3c7',
                        color: fridge.status === 'ACTIVE' ? '#065f46' : '#92400e'
                      }}>
                        {fridge.status}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '6px 0', fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} style={{ color: '#64748b' }} /> {fridge.location}
                  </p>

                  <div style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    marginBottom: '8px',
                    padding: '4px 8px',
                    background: '#f8fafc',
                    borderRadius: '4px'
                  }}>
                    <strong>Coordinates:</strong> {fridge.latitude.toFixed(4)}, {fridge.longitude.toFixed(4)}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: '#059669',
                    fontWeight: 600,
                    marginBottom: '12px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Package size={14} /> Available Food:
                    </span>
                    <span style={{ background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', color: '#047857' }}>
                      {fridge.availableFoodCount != null ? fridge.availableFoodCount : 0} items
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link
                      to={`/browse?fridgeId=${fridge.id}`}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#10b981',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                    >
                      <Package size={13} /> View Food
                    </Link>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#3b82f6',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                    >
                      <Navigation size={13} /> Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
