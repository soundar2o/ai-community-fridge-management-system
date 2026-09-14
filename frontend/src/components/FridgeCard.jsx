import React from 'react';
import { Refrigerator, MapPin, User, Gauge } from 'lucide-react';

export const FridgeCard = ({ fridge, onStatusToggle, onDelete }) => {
  const percentage = Math.min(100, Math.round((fridge.currentOccupancyKg / fridge.capacityKg) * 100)) || 0;
  
  const getCapacityColor = (pct) => {
    if (pct > 85) return 'var(--accent-rose)';
    if (pct > 60) return 'var(--accent-amber)';
    return 'var(--primary)';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <span className="badge badge-available">ACTIVE</span>;
      case 'MAINTENANCE': return <span className="badge badge-pending">MAINTENANCE</span>;
      case 'INACTIVE': return <span className="badge badge-expired">INACTIVE</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="glass-card glass-card-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Refrigerator size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{fridge.name}</h3>
            {getStatusBadge(fridge.status)}
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <MapPin size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>{fridge.location}</span>
        </div>
        {fridge.latitude != null && fridge.longitude != null && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: '24px' }}>
            Lat: {fridge.latitude.toFixed(4)}, Lng: {fridge.longitude.toFixed(4)}
          </div>
        )}
      </div>

      {/* Manager */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <User size={14} />
        <span>Managed by: {fridge.managedByUserName || 'Community Team'}</span>
      </div>

      {/* Capacity Progress Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Gauge size={14} /> Occupancy
          </span>
          <span style={{ fontWeight: 700, color: getCapacityColor(percentage) }}>
            {fridge.currentOccupancyKg} / {fridge.capacityKg} kg ({percentage}%)
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: getCapacityColor(percentage),
            borderRadius: '4px',
            transition: 'width 0.5s ease-in-out'
          }}></div>
        </div>
      </div>

      {/* Action Buttons if callbacks provided */}
      {(onStatusToggle || onDelete) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
          {onStatusToggle && (
            <button
              onClick={() => onStatusToggle(fridge.id, fridge.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
            >
              Toggle Status
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(fridge.id)}
              className="btn btn-danger"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};
