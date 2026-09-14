import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FridgeCard } from '../../components/FridgeCard';
import { LocationPickerMap } from '../../components/LocationPickerMap';
import { Plus, Refrigerator, RefreshCw, AlertCircle, MapPin } from 'lucide-react';

export const FridgeManagement = () => {
  const [fridges, setFridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFridge, setNewFridge] = useState({
    name: '',
    location: '',
    latitude: null,
    longitude: null,
    capacityKg: 50
  });
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [error, setError] = useState('');

  const fetchFridges = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fridges');
      setFridges(res.data);
    } catch (err) {
      console.error('Failed to fetch fridges', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFridges();
  }, []);

  const handleLocateOnMap = async () => {
    if (!newFridge.location || !newFridge.location.trim()) {
      setGeoError('Please enter a location or address first.');
      return;
    }

    setIsLocating(true);
    setGeoError('');
    setError('');

    try {
      const address = newFridge.location.trim();
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Geocoding service failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(parseFloat(data[0].lat).toFixed(6));
        const lng = parseFloat(parseFloat(data[0].lon).toFixed(6));
        setNewFridge((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      } else {
        setGeoError(`Unable to locate address "${address}". Please verify the location or click on the map to set position manually.`);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setGeoError('Failed to fetch location. Please adjust latitude and longitude or drag the map marker manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCreateFridge = async (e) => {
    e.preventDefault();
    setError('');
    setGeoError('');

    if (newFridge.latitude == null || newFridge.longitude == null || isNaN(newFridge.latitude) || isNaN(newFridge.longitude)) {
      setError('Please click "Locate on Map" or click/drag the marker on the map to set valid latitude and longitude coordinates before saving.');
      return;
    }

    try {
      await api.post('/fridges', newFridge);
      setShowAddModal(false);
      setNewFridge({ name: '', location: '', latitude: null, longitude: null, capacityKg: 50 });
      fetchFridges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fridge.');
    }
  };

  const handleStatusToggle = async (id, newStatus) => {
    try {
      await api.patch(`/fridges/${id}/status?status=${newStatus}`);
      fetchFridges();
    } catch (err) {
      alert('Failed to update fridge status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this community fridge?')) {
      try {
        await api.delete(`/fridges/${id}`);
        fetchFridges();
      } catch (err) {
        alert('Failed to delete fridge.');
      }
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Community Fridges</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage locations, monitoring capacity, map coordinates, and operational status</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchFridges} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} /> Add New Fridge
          </button>
        </div>
      </div>

      {/* Grid of Fridges */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          Loading community fridges...
        </div>
      ) : fridges.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Refrigerator size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h3>No Community Fridges Registered</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>Click below to add your first community fridge location.</p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} /> Add Fridge
          </button>
        </div>
      ) : (
        <div className="grid-layout grid-cols-3">
          {fridges.map((fridge) => (
            <FridgeCard
              key={fridge.id}
              fridge={fridge}
              onStatusToggle={handleStatusToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal for Adding New Fridge */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '560px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Add Community Fridge Location</h2>
            
            {error && (
              <div style={{ color: '#f87171', marginBottom: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleCreateFridge}>
              <div className="form-group">
                <label className="form-label">Fridge Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Central Community Fridge"
                  value={newFridge.name}
                  onChange={(e) => setNewFridge({ ...newFridge, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Address</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Anna Nagar, Chennai"
                    value={newFridge.location}
                    onChange={(e) => setNewFridge({ ...newFridge, location: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleLocateOnMap}
                    disabled={isLocating}
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '135px', justifyContent: 'center' }}
                  >
                    {isLocating ? <RefreshCw size={16} className="spin" /> : <MapPin size={16} />}
                    {isLocating ? 'Locating...' : 'Locate on Map'}
                  </button>
                </div>
                {geoError && (
                  <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '6px' }}>
                    {geoError}
                  </div>
                )}
              </div>

              {/* Interactive Leaflet Map with Marker */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  📍 Interactive Map (Drag marker or click map to adjust exact position)
                </label>
                <LocationPickerMap
                  latitude={newFridge.latitude}
                  longitude={newFridge.longitude}
                  onPositionChange={(lat, lng) => setNewFridge((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="Auto-populated from map"
                    value={newFridge.latitude !== null && newFridge.latitude !== undefined ? newFridge.latitude : ''}
                    onChange={(e) => setNewFridge({ ...newFridge, latitude: parseFloat(e.target.value) || null })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="Auto-populated from map"
                    value={newFridge.longitude !== null && newFridge.longitude !== undefined ? newFridge.longitude : ''}
                    onChange={(e) => setNewFridge({ ...newFridge, longitude: parseFloat(e.target.value) || null })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (in kg)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="1000"
                  value={newFridge.capacityKg}
                  onChange={(e) => setNewFridge({ ...newFridge, capacityKg: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Fridge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
