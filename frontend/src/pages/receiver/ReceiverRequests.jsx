import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingBag, Clock, CheckCircle, XCircle, MapPin, Tag, RefreshCw, AlertCircle } from 'lucide-react';

export const ReceiverRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load my requests', err);
      setError(err.response?.data?.message || 'Failed to fetch your food requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-available" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-expired" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending Verification</span>;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>My Food Requests</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track the status of your requested community food items</p>
        </div>
        <button onClick={fetchMyRequests} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Refresh Status
        </button>
      </div>

      {error && (
        <div style={{
          padding: '14px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#f87171',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          Loading your food requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h3>No Food Requests Submitted</h3>
          <p style={{ marginTop: '8px' }}>You haven't requested any community food items yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>{req.foodName}</h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)'
                  }}>
                    {req.category}
                  </span>
                  {getStatusBadge(req.status)}
                </div>

                <div style={{ display: 'flex', gap: '24px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'block' }}>REQUESTED QUANTITY</span>
                    <strong style={{ color: 'var(--primary)' }}>
                      {req.requestedQuantity} {req.unit}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'block' }}>COMMUNITY FRIDGE</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                      <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                      {req.fridgeName} ({req.fridgeLocation})
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Requested On: {new Date(req.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                {req.status === 'APPROVED' && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    ✓ Approved — Ready for Pickup
                  </div>
                )}
                {req.status === 'REJECTED' && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    ✕ Request Rejected by Donor
                  </div>
                )}
                {req.status === 'PENDING' && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fbbf24',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    ⏳ Awaiting Donor Verification
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
