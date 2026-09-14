import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, CheckCircle, XCircle, Trash2, Clock, MapPin, RefreshCw, AlertCircle, Refrigerator, Package, Activity, Info } from 'lucide-react';

export const VolunteerQueue = () => {
  const [activeTab, setActiveTab] = useState('VERIFY'); // 'VERIFY', 'EXPIRING', 'FRIDGES', 'INVENTORY', 'ACTIVITY'
  const [pendingDonations, setPendingDonations] = useState([]);
  const [expiredDonations, setExpiredDonations] = useState([]);
  const [nearingExpiryDonations, setNearingExpiryDonations] = useState([]);
  const [fridges, setFridges] = useState([]);
  const [availableFood, setAvailableFood] = useState([]);
  const [distributionActivity, setDistributionActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      const [pendingRes, expiredRes, nearingRes, fridgesRes, availableRes, activityRes] = await Promise.all([
        api.get('/donations/pending'),
        api.get('/donations/expired'),
        api.get('/donations/nearing-expiry').catch(() => ({ data: [] })),
        api.get('/fridges').catch(() => ({ data: [] })),
        api.get('/donations/available').catch(() => ({ data: [] })),
        api.get('/requests/activity').catch(() => ({ data: [] }))
      ]);

      setPendingDonations(pendingRes.data || []);
      setExpiredDonations(expiredRes.data || []);
      setNearingExpiryDonations(nearingRes.data || []);
      setFridges(fridgesRes.data || []);
      setAvailableFood(availableRes.data || []);
      setDistributionActivity(activityRes.data || []);
    } catch (err) {
      console.error('Failed to load volunteer queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const handleApproveDonation = async (id) => {
    setActionLoadingId(id);
    setActionSuccess('');
    setActionError('');
    try {
      await api.patch(`/donations/${id}/approve`);
      setActionSuccess('Food donation verified & approved! It is now available in the community fridge.');
      await fetchVolunteerData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to verify food donation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectDonation = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    setActionLoadingId(id);
    setActionSuccess('');
    setActionError('');
    try {
      await api.patch(`/donations/${id}/reject?reason=${encodeURIComponent(reason)}`);
      setActionSuccess('Food donation rejected.');
      await fetchVolunteerData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject food donation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDiscardExpired = async (id) => {
    try {
      await api.patch(`/donations/${id}/status?status=DISCARDED`);
      setActionSuccess('Item cleared from fridge inventory.');
      fetchVolunteerData();
    } catch (err) {
      alert('Failed to discard item');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Volunteer Caretaker Station</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor fridge capacity, verify incoming food, clear expired stock, and assist collection</p>
        </div>
        <button onClick={fetchVolunteerData} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Station
        </button>
      </div>

      {/* Physical Workflow Banner */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa', fontWeight: 600, fontSize: '0.92rem', marginBottom: '8px' }}>
          <Info size={18} /> Physical Distribution Model
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.84rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>1. Donor deposits food at Community Fridge</span> →
          <span>2. Volunteer verifies food safety & stock</span> →
          <span>3. Receiver requests food in App</span> →
          <span>4. Approved receiver collects food directly from Community Fridge</span>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {actionError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'VERIFY', label: `Pending Verification (${pendingDonations.length})`, icon: ShieldCheck },
          { key: 'EXPIRING', label: `Expiring & Expired (${nearingExpiryDonations.length + expiredDonations.length})`, icon: Trash2 },
          { key: 'FRIDGES', label: `Fridges (${fridges.length})`, icon: Refrigerator },
          { key: 'INVENTORY', label: `Available Stock (${availableFood.length})`, icon: Package },
          { key: 'ACTIVITY', label: `Collection Activity (${distributionActivity.length})`, icon: Activity }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="btn"
              style={{
                background: isActive ? 'var(--primary-light)' : 'rgba(18, 26, 44, 0.7)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-glass)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
            >
              <IconComp size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pending Verification Queue */}
      {activeTab === 'VERIFY' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>Loading pending verification queue...</div>
          ) : pendingDonations.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ opacity: 0.4, marginBottom: '12px', color: 'var(--primary)' }} />
              <h3>All Incoming Donations Verified!</h3>
              <p style={{ marginTop: '8px' }}>There are currently no unverified food donations waiting in the queue.</p>
            </div>
          ) : (
            <div className="grid-layout grid-cols-2">
              {pendingDonations.map((item) => {
                const isItemLoading = actionLoadingId === item.id;
                return (
                  <div key={item.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {item.imageUrl && (
                      <div style={{ height: '140px', width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '4px' }}>
                        <img src={`http://localhost:8080${item.imageUrl}`} alt={item.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '2px' }}>{item.foodName}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Category: {item.category} • Quantity: {item.quantity} {item.unit}</span>
                      </div>
                      <span className="badge badge-pending">{item.status || 'PENDING'}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>Target Fridge: <strong>{item.fridgeName}</strong> ({item.fridgeLocation})</span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>Uploaded: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                        <Clock size={14} />
                        <span>Expiry Date: {new Date(item.expiryDatetime).toLocaleString()}</span>
                      </div>
                      <div>Donor: <strong>{item.donorName}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                      <button
                        onClick={() => handleApproveDonation(item.id)}
                        className="btn btn-primary"
                        disabled={isItemLoading}
                        style={{ flex: 1, padding: '8px' }}
                      >
                        <CheckCircle size={16} /> {isItemLoading ? 'Verifying...' : 'Approve & Stock'}
                      </button>
                      <button
                        onClick={() => handleRejectDonation(item.id)}
                        className="btn btn-danger"
                        disabled={isItemLoading}
                        style={{ padding: '8px 14px' }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Expiring & Expired Inventory */}
      {activeTab === 'EXPIRING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Nearing Expiry (&lt; 48 Hours)
            </h3>
            {nearingExpiryDonations.length === 0 ? (
              <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No items expiring in the next 48 hours.</div>
            ) : (
              <div className="grid-layout grid-cols-2">
                {nearingExpiryDonations.map((item) => (
                  <div key={item.id} className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #fbbf24' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '1rem' }}>{item.foodName}</h4>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Fridge: {item.fridgeName} • Qty: {item.quantity} {item.unit}</span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)' }}>EXPIRING SOON</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '8px' }}>
                      Expires: {new Date(item.expiryDatetime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} /> Expired Inventory (Requires Clearance)
            </h3>
            {expiredDonations.length === 0 ? (
              <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No expired items requiring disposal.</div>
            ) : (
              <div className="grid-layout grid-cols-2">
                {expiredDonations.map((item) => (
                  <div key={item.id} className="glass-card" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #ef4444' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1rem' }}>{item.foodName}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Location: <strong>{item.fridgeName}</strong> • Quantity: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <button onClick={() => handleDiscardExpired(item.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      <Trash2 size={14} /> Clear & Discard
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Community Fridges Overview */}
      {activeTab === 'FRIDGES' && (
        <div className="grid-layout grid-cols-3">
          {fridges.map((f) => {
            const occupancyPct = f.capacityKg > 0 ? Math.min(100, Math.round((f.currentOccupancyKg / f.capacityKg) * 100)) : 0;
            return (
              <div key={f.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Refrigerator size={24} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>{f.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.location}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Occupancy: <strong>{f.currentOccupancyKg || 0} / {f.capacityKg} kg</strong> ({occupancyPct}%)
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${occupancyPct}%`, height: '100%', background: occupancyPct > 85 ? '#f87171' : 'var(--primary)' }} />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${f.status === 'ACTIVE' ? 'badge-available' : 'badge-expired'}`}>{f.status}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>ID: #{f.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Available Stock */}
      {activeTab === 'INVENTORY' && (
        <div className="grid-layout grid-cols-3">
          {availableFood.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '18px' }}>
              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>{item.foodName}</h4>
              <span className="badge badge-available" style={{ marginBottom: '8px' }}>{item.category}</span>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Available Qty: <strong>{item.quantity} {item.unit}</strong>
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Fridge: {item.fridgeName}
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                Expires: {new Date(item.expiryDatetime).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Distribution & Collection Activity */}
      {activeTab === 'ACTIVITY' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>Recent Food Requests & Collection Log</h3>
          {distributionActivity.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No request/collection activity recorded yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Request ID</th>
                  <th style={{ padding: '10px' }}>Food Item</th>
                  <th style={{ padding: '10px' }}>Receiver</th>
                  <th style={{ padding: '10px' }}>Fridge Location</th>
                  <th style={{ padding: '10px' }}>Qty</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {distributionActivity.map((act) => (
                  <tr key={act.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px', color: 'var(--text-dim)' }}>#{act.id}</td>
                    <td style={{ padding: '10px', color: '#fff', fontWeight: 500 }}>{act.foodName}</td>
                    <td style={{ padding: '10px', color: 'var(--accent-cyan)' }}>{act.receiverName}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{act.fridgeName}</td>
                    <td style={{ padding: '10px', color: '#fff' }}>{act.requestedQuantity} {act.unit}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${act.status === 'APPROVED' ? 'badge-available' : act.status === 'REJECTED' ? 'badge-expired' : 'badge-pending'}`}>
                        {act.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-dim)' }}>
                      {act.createdAt ? new Date(act.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
