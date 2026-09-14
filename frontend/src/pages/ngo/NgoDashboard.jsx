import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Search, ShoppingBag, MapPin, RefreshCw, CheckCircle, Clock, AlertCircle, Refrigerator, Package } from 'lucide-react';

export const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState('BROWSE'); // 'BROWSE', 'MY_REQUESTS', 'FRIDGES'
  const [foodItems, setFoodItems] = useState([]);
  const [fridges, setFridges] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingDonationIds, setPendingDonationIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [requestQty, setRequestQty] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['All', 'Cooked Meal', 'Groceries', 'Fruits & Vegetables', 'Bakery', 'Dairy', 'Beverages', 'Other'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodRes, fridgesRes, requestsRes, pendingIdsRes] = await Promise.all([
        api.get('/donations/available', {
          params: { category: selectedCategory === 'All' ? '' : selectedCategory, search }
        }),
        api.get('/fridges'),
        api.get('/requests/my-requests').catch(() => ({ data: [] })),
        api.get('/requests/pending-donation-ids').catch(() => ({ data: [] }))
      ]);

      setFoodItems(foodRes.data || []);
      setFridges(fridgesRes.data || []);
      setMyRequests(requestsRes.data || []);
      setPendingDonationIds(pendingIdsRes.data || []);
    } catch (err) {
      console.error('Failed to load NGO dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleQuantityChange = (donationId, val) => {
    setRequestQty({ ...requestQty, [donationId]: val });
  };

  const handleRequestFood = async (donation) => {
    const qty = parseInt(requestQty[donation.id] || 1, 10);
    if (qty <= 0 || qty > donation.quantity) {
      setErrorMsg(`Invalid quantity. Please select between 1 and ${donation.quantity}.`);
      return;
    }

    setRequestingId(donation.id);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.post('/requests', {
        donationId: donation.id,
        requestedQuantity: qty
      });

      setSuccessMsg(`Successfully requested ${qty} ${donation.unit} of '${donation.foodName}' for community distribution!`);
      await fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit food request.');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 style={{ color: 'var(--primary)' }} /> NGO Distribution Portal
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Bulk request food items for community feeding and track allocated distributions</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Portal
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('BROWSE')}
          className="btn"
          style={{
            background: activeTab === 'BROWSE' ? 'var(--primary-light)' : 'rgba(18, 26, 44, 0.7)',
            color: activeTab === 'BROWSE' ? 'var(--primary)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'BROWSE' ? 'var(--primary)' : 'var(--border-glass)'}`
          }}
        >
          <Package size={16} /> Available Food ({foodItems.length})
        </button>
        <button
          onClick={() => setActiveTab('MY_REQUESTS')}
          className="btn"
          style={{
            background: activeTab === 'MY_REQUESTS' ? 'var(--primary-light)' : 'rgba(18, 26, 44, 0.7)',
            color: activeTab === 'MY_REQUESTS' ? 'var(--primary)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'MY_REQUESTS' ? 'var(--primary)' : 'var(--border-glass)'}`
          }}
        >
          <ShoppingBag size={16} /> Community Requests ({myRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('FRIDGES')}
          className="btn"
          style={{
            background: activeTab === 'FRIDGES' ? 'var(--primary-light)' : 'rgba(18, 26, 44, 0.7)',
            color: activeTab === 'FRIDGES' ? 'var(--primary)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'FRIDGES' ? 'var(--primary)' : 'var(--border-glass)'}`
          }}
        >
          <Refrigerator size={16} /> Community Fridges ({fridges.length})
        </button>
      </div>

      {/* Tab 1: Browse Available Food */}
      {activeTab === 'BROWSE' && (
        <div>
          {/* Filter Bar */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search food by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                <Search size={16} /> Search
              </button>
            </form>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    background: (selectedCategory === cat || (cat === 'All' && !selectedCategory)) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: '#fff'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>Loading available inventory...</div>
          ) : foodItems.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No Food Available</h3>
              <p style={{ marginTop: '8px' }}>There are currently no food items matching your filter criteria.</p>
            </div>
          ) : (
            <div className="grid-layout grid-cols-3">
              {foodItems.map((item) => {
                const hasPending = pendingDonationIds.includes(item.id);
                const currentQty = requestQty[item.id] !== undefined ? requestQty[item.id] : 1;
                return (
                  <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    {item.imageUrl && (
                      <div style={{ height: '140px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px' }}>
                        <img src={`http://localhost:8080${item.imageUrl}`} alt={item.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{item.foodName}</h3>
                      <span className="badge badge-available">{item.category}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Fridge: <strong>{item.fridgeName}</strong>
                    </p>

                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                      Available Qty: <strong>{item.quantity} {item.unit}</strong>
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                      {hasPending ? (
                        <span className="badge badge-pending" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                          Request Pending
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={currentQty}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="form-input"
                            style={{ width: '70px', padding: '6px', textAlign: 'center' }}
                          />
                          <button
                            onClick={() => handleRequestFood(item)}
                            disabled={requestingId === item.id}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                          >
                            {requestingId === item.id ? 'Submitting...' : 'Request for Distribution'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Community Requests */}
      {activeTab === 'MY_REQUESTS' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px' }}>NGO Request & Allocation History</h3>
          {myRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any distribution requests yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Request ID</th>
                  <th style={{ padding: '10px' }}>Food Name</th>
                  <th style={{ padding: '10px' }}>Fridge Location</th>
                  <th style={{ padding: '10px' }}>Requested Qty</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', color: 'var(--text-dim)' }}>#{req.id}</td>
                    <td style={{ padding: '10px', color: '#fff', fontWeight: 500 }}>{req.foodName}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{req.fridgeName} ({req.fridgeLocation})</td>
                    <td style={{ padding: '10px', color: '#fff' }}>{req.requestedQuantity} {req.unit}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${req.status === 'APPROVED' ? 'badge-available' : req.status === 'REJECTED' ? 'badge-expired' : 'badge-pending'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-dim)' }}>
                      {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Community Fridges Overview */}
      {activeTab === 'FRIDGES' && (
        <div className="grid-layout grid-cols-3">
          {fridges.map((f) => (
            <div key={f.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Refrigerator size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>{f.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.location}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Capacity: <strong>{f.capacityKg} kg</strong> | Current Occupancy: <strong>{f.currentOccupancyKg || 0} kg</strong>
              </p>
              <div style={{ marginTop: '12px' }}>
                <span className={`badge ${f.status === 'ACTIVE' ? 'badge-available' : 'badge-expired'}`}>{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
