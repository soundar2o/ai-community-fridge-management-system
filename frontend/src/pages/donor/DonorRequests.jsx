import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingBag, CheckCircle, XCircle, Clock, MapPin, Tag, User, AlertCircle, RefreshCw, Filter } from 'lucide-react';

export const DonorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Confirmation Modal states
  const [activeAction, setActiveAction] = useState(null); // { type: 'APPROVE'|'REJECT', request: req }
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/requests/donor');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load donor requests', err);
      setError(err.response?.data?.message || 'Failed to fetch incoming food requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirmAction = async () => {
    if (!activeAction) return;

    setProcessing(true);
    setError('');

    try {
      const endpoint = `/requests/${activeAction.request.id}/${activeAction.type === 'APPROVE' ? 'approve' : 'reject'}`;
      await api.put(endpoint);
      setActiveAction(null);
      fetchRequests();
    } catch (err) {
      console.error('Action error:', err);
      setError(err.response?.data?.message || `Failed to ${activeAction.type.toLowerCase()} request.`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (selectedFilter === 'ALL') return true;
    return req.status === selectedFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-available" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-expired" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Donor Food Request Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review, approve, or reject incoming receiver requests for your donated food</p>
        </div>
        <button onClick={fetchRequests} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Refresh Requests
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

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '14px 20px', marginBottom: '28px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Status:</span>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-glass)'}`,
                background: isSelected ? 'var(--primary-light)' : 'rgba(15, 23, 42, 0.4)',
                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Content Grid / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          Loading requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h3>No Requests Found</h3>
          <p style={{ marginTop: '8px' }}>
            {selectedFilter === 'ALL'
              ? 'You currently have no incoming receiver food requests.'
              : `No requests found with status ${selectedFilter}.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 220px',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              {/* Info Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'block' }}>REQUESTED QUANTITY</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                      {req.requestedQuantity} {req.unit}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'block' }}>RECEIVER DETAILS</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600 }}>
                      <User size={14} style={{ color: 'var(--primary)' }} />
                      {req.receiverName}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'block' }}>COMMUNITY FRIDGE</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                      {req.fridgeName}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
                  <span>Requested On: {new Date(req.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', justifyContent: 'center' }}>
                {req.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      onClick={() => setActiveAction({ type: 'APPROVE', request: req })}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      onClick={() => setActiveAction({ type: 'REJECT', request: req })}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: req.status === 'APPROVED' ? 'var(--primary)' : 'var(--text-dim)' }}>
                    {req.status === 'APPROVED' ? '✓ Processed & Approved' : '✕ Request Rejected'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {activeAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 29, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: activeAction.type === 'APPROVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: activeAction.type === 'APPROVE' ? 'var(--primary)' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              {activeAction.type === 'APPROVE' ? <CheckCircle size={28} /> : <XCircle size={28} />}
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>
              {activeAction.type === 'APPROVE' ? 'Approve Food Request?' : 'Reject Food Request?'}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {activeAction.type === 'APPROVE'
                ? `Approve request for ${activeAction.request.requestedQuantity} ${activeAction.request.unit} of '${activeAction.request.foodName}' submitted by ${activeAction.request.receiverName}? Stock will be allocated automatically.`
                : `Are you sure you want to reject this request from ${activeAction.request.receiverName}? Food stock will not be affected.`}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setActiveAction(null)}
                className="btn btn-secondary"
                disabled={processing}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`btn ${activeAction.type === 'APPROVE' ? 'btn-primary' : 'btn-secondary'}`}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: activeAction.type === 'REJECT' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                  color: activeAction.type === 'REJECT' ? '#f87171' : undefined,
                  borderColor: activeAction.type === 'REJECT' ? 'rgba(239, 68, 68, 0.4)' : undefined
                }}
              >
                {processing ? 'Processing...' : (activeAction.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
