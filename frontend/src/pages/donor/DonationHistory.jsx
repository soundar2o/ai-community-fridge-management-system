import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Package, Calendar, Clock, MapPin, Refrigerator, CheckCircle, AlertTriangle, Edit3 } from 'lucide-react';

export const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await api.get('/donations/my-history');
      setDonations(res.data);
    } catch (err) {
      console.error('Failed to load donation history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleEdit = (donation) => {
    navigate('/donate', { state: { editDonation: donation } });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'AVAILABLE': return <span className="badge badge-available">AVAILABLE IN FRIDGE</span>;
      case 'PENDING':
      case 'PENDING_VERIFICATION': return <span className="badge badge-pending">PENDING VERIFICATION</span>;
      case 'RESERVED': return <span className="badge badge-reserved">RESERVED</span>;
      case 'COLLECTED': return <span className="badge badge-collected">COLLECTED</span>;
      case 'EXPIRED': return <span className="badge badge-expired">EXPIRED</span>;
      case 'REJECTED': return <span className="badge badge-expired">REJECTED</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>My Donation History</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track the lifecycle and status of your food contributions</p>
        </div>
        <button onClick={() => navigate('/donate')} className="btn btn-primary">
          + Donate Food
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          Loading your donation records...
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h3>No Donations Yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '16px' }}>You haven't made any food donations yet. Share surplus food to help your community!</p>
          <button onClick={() => navigate('/donate')} className="btn btn-primary">
            Donate Food Now
          </button>
        </div>
      ) : (
        <div className="grid-layout grid-cols-2">
          {donations.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px' }}>
              {/* Food Image */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:8080${item.imageUrl}`}
                  alt={item.foodName}
                  style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-dim)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <Package size={32} />
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{item.foodName}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{item.category}</span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Refrigerator size={15} style={{ color: 'var(--primary)' }} />
                  <span>{item.fridgeName} ({item.quantity} {item.unit})</span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>Expires: <strong style={{ color: 'var(--text-muted)' }}>{formatDate(item.expiryDatetime)}</strong></span>
                </div>

                {/* Edit Action Button */}
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={14} /> Edit Donation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
