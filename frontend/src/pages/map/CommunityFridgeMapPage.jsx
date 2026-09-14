import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FridgeMap } from '../../components/FridgeMap';
import { Search, MapPin, Refrigerator, Package, Navigation, RefreshCw, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommunityFridgeMapPage = () => {
  const [fridges, setFridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFridge, setSelectedFridge] = useState(null);

  const fetchFridges = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fridges');
      setFridges(res.data);
    } catch (err) {
      console.error('Failed to load fridges for map', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFridges();
  }, []);

  const filteredFridges = fridges.filter((f) => {
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q);
  });

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Community Fridges Map</h1>
          <p style={{ color: 'var(--text-muted)' }}>Locate active community fridges, check food availability, and get directions</p>
        </div>
        <button onClick={fetchFridges} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Map
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px' }}
            placeholder="Search fridge by name, address, or location (e.g. Anna Nagar, T. Nagar)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>
      </div>

      {/* Main Grid: Map + Side List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Interactive OpenStreetMap */}
        <div>
          {loading ? (
            <div className="glass-card" style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              Loading interactive map...
            </div>
          ) : (
            <FridgeMap
              fridges={filteredFridges}
              height="520px"
              selectedFridgeId={selectedFridge?.id}
              onSelectFridge={(fridge) => setSelectedFridge(fridge)}
            />
          )}
        </div>

        {/* Fridges List Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Refrigerator size={18} style={{ color: 'var(--primary)' }} />
            Fridges ({filteredFridges.length})
          </h3>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : filteredFridges.length === 0 ? (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No fridges found matching "{search}".
            </div>
          ) : (
            filteredFridges.map((fridge) => {
              const isSelected = selectedFridge?.id === fridge.id;
              const hasCoords = fridge.latitude != null && fridge.longitude != null;
              const directionsUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${fridge.latitude},${fridge.longitude}` : '#';

              return (
                <div
                  key={fridge.id}
                  className="glass-card"
                  onClick={() => setSelectedFridge(fridge)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-glass)',
                    boxShadow: isSelected ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>{fridge.name}</h4>
                    <span className={`badge ${fridge.status === 'ACTIVE' ? 'badge-available' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                      {fridge.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    {fridge.location}
                  </p>

                  {hasCoords && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                      Lat: {fridge.latitude.toFixed(4)}, Lng: {fridge.longitude.toFixed(4)}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Package size={15} /> {fridge.availableFoodCount != null ? fridge.availableFoodCount : 0} Available Food
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/browse?fridgeId=${fridge.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Food
                      </Link>
                      {hasCoords && (
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Navigation size={13} /> Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
