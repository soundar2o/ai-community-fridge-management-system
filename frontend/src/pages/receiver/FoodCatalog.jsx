import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Search, Filter, MapPin, Clock, Refrigerator, ShoppingBag, RefreshCw, Plus, Minus, CheckCircle, AlertCircle, X, HeartHandshake } from 'lucide-react';

export const FoodCatalog = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const fridgeParam = searchParams.get('fridgeId') || '';

  const [foodItems, setFoodItems] = useState([]);
  const [fridges, setFridges] = useState([]);
  const [pendingDonationIds, setPendingDonationIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFridge, setSelectedFridge] = useState(fridgeParam);

  // Request Modal States
  const [activeFood, setActiveFood] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(null);

  const categories = ['All', 'Cooked Meal', 'Bakery', 'Produce', 'Dairy', 'Packaged', 'Beverages'];

  useEffect(() => {
    const fId = searchParams.get('fridgeId') || '';
    setSelectedFridge(fId);
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [
        api.get(`/donations/available?search=${encodeURIComponent(search)}&category=${encodeURIComponent(selectedCategory === 'All' ? '' : selectedCategory)}&fridgeId=${selectedFridge}`),
        api.get('/fridges/active')
      ];

      if (user && (user.role === 'RECEIVER' || user.role === 'ADMIN')) {
        promises.push(api.get('/requests/pending-donation-ids'));
      }

      const results = await Promise.all(promises);
      setFoodItems(results[0].data);
      setFridges(results[1].data);
      if (results[2]) {
        setPendingDonationIds(results[2].data);
      }
    } catch (err) {
      console.error('Failed to load food catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedFridge, user]);

  const handleFridgeChange = (e) => {
    const val = e.target.value;
    setSelectedFridge(val);
    if (val) {
      setSearchParams({ fridgeId: val });
    } else {
      setSearchParams({});
    }
  };

  const getTimeRemaining = (expiryDatetime) => {
    const total = Date.parse(expiryDatetime) - Date.parse(new Date());
    const hours = Math.floor((total / (1000 * 60 * 60)));
    const minutes = Math.floor((total / 1000 / 60) % 60);

    if (total <= 0) return { text: 'Expired', critical: true };
    if (hours < 3) return { text: `${hours}h ${minutes}m left`, critical: true };
    return { text: `${hours}h ${minutes}m left`, critical: false };
  };

  const openRequestModal = (food) => {
    if (user && user.role !== 'RECEIVER' && user.role !== 'ADMIN') {
      setModalError(`You are currently signed in as a ${user.role}. Food requests are reserved for registered Receivers. Please sign in as a Receiver.`);
    } else if (pendingDonationIds.includes(food.id)) {
      setModalError('You already have a pending request for this food.');
    } else {
      setModalError('');
    }
    setActiveFood(food);
    setRequestQty(1);
    setModalSuccess(null);
  };

  const closeRequestModal = () => {
    setActiveFood(null);
    setModalError('');
    setModalSuccess(null);
    setRequestQty(1);
  };

  const handleQtyChange = (val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setRequestQty(1);
      return;
    }
    if (activeFood && parsed > activeFood.quantity) {
      setRequestQty(activeFood.quantity);
      setModalError(`Maximum available quantity is ${activeFood.quantity} ${activeFood.unit}.`);
      return;
    }
    setModalError('');
    setRequestQty(parsed);
  };

  const handleDecreaseQty = () => {
    if (requestQty > 1) {
      setRequestQty(prev => prev - 1);
      setModalError('');
    }
  };

  const handleIncreaseQty = () => {
    if (activeFood && requestQty < activeFood.quantity) {
      setRequestQty(prev => prev + 1);
      setModalError('');
    } else if (activeFood) {
      setModalError(`Cannot request more than maximum available quantity (${activeFood.quantity} ${activeFood.unit}).`);
    }
  };

  const handleSubmittingRequest = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!user) {
      setModalError('Please sign in as a receiver to request food.');
      return;
    }

    if (user.role !== 'RECEIVER' && user.role !== 'ADMIN') {
      setModalError(`You are currently signed in as a ${user.role}. Food requests are reserved for registered Receivers. Please sign in as a Receiver.`);
      return;
    }

    if (requestQty < 1) {
      setModalError('Requested quantity must be at least 1.');
      return;
    }

    if (activeFood && requestQty > activeFood.quantity) {
      setModalError(`Requested quantity (${requestQty}) exceeds available quantity (${activeFood.quantity} ${activeFood.unit}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/requests', {
        donationId: activeFood.id,
        requestedQuantity: requestQty
      });

      setModalSuccess(res.data);
      setPendingDonationIds(prev => [...prev, activeFood.id]);
      fetchData();
    } catch (err) {
      console.error('Food request error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to submit food request.';
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Available Community Food</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse fresh, inspected food available at local community fridges</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search by food name (e.g. Soup, Bread)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>

          {/* Fridge Filter */}
          <div style={{ width: '220px', position: 'relative' }}>
            <select
              className="form-select"
              style={{ paddingLeft: '38px' }}
              value={selectedFridge}
              onChange={handleFridgeChange}
            >
              <option value="">All Fridges</option>
              {fridges.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <Refrigerator size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const isSelected = (cat === 'All' && selectedCategory === '') || selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-glass)'}`,
                  background: isSelected ? 'var(--primary-light)' : 'rgba(15, 23, 42, 0.4)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Food Items */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          Loading food catalog...
        </div>
      ) : foodItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h3>No Available Food Items Found</h3>
          <p style={{ marginTop: '8px' }}>Check back soon as donors add fresh food continuously.</p>
        </div>
      ) : (
        <div className="grid-layout grid-cols-3">
          {foodItems.map((food) => {
            const expiryInfo = getTimeRemaining(food.expiryDatetime);
            const formattedImageUrl = food.imageUrl && !food.imageUrl.startsWith('http') ? food.imageUrl : food.imageUrl;
            const isPending = pendingDonationIds.includes(food.id);

            return (
              <div
                key={food.id}
                className="glass-card glass-card-interactive"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: isPending ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-glass)'
                }}
                onClick={() => openRequestModal(food)}
              >
                {/* Food Image */}
                <div style={{ position: 'relative', height: '160px', background: 'rgba(15, 23, 42, 0.8)' }}>
                  {food.imageUrl ? (
                    <img src={formattedImageUrl} alt={food.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                      <ShoppingBag size={40} />
                    </div>
                  )}
                  {/* Category Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(10, 15, 29, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)'
                  }}>
                    {food.category}
                  </span>
                  {/* Expiry Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: expiryInfo.critical ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} /> {expiryInfo.text}
                  </span>
                </div>

                {/* Info Container */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '4px' }}>{food.foodName}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                      Available: {food.quantity} {food.unit}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                    <span>{food.fridgeName} ({food.fridgeLocation})</span>
                  </div>

                  <button
                    className={`btn ${isPending ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%', marginTop: '8px', padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openRequestModal(food);
                    }}
                  >
                    <HeartHandshake size={16} />
                    {isPending ? 'Request Pending' : 'Request Food'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Food Request Modal */}
      {activeFood && (
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
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '32px', position: 'relative', boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)' }}>
            {/* Close Button */}
            <button
              onClick={closeRequestModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {modalSuccess ? (
              /* Success Confirmation View */
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <CheckCircle size={32} />
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
                  Food Request Submitted Successfully!
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Your request has been registered and is pending verification.
                </p>

                {/* Request Details Breakdown */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>FOOD ITEM</span>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{modalSuccess.foodName}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>REQUESTED QUANTITY</span>
                      <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {modalSuccess.requestedQuantity} {modalSuccess.unit}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>REQUEST STATUS</span>
                      <div>
                        <span className="badge badge-pending" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                          Request Status: {modalSuccess.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>COMMUNITY FRIDGE</span>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      {modalSuccess.fridgeName} ({modalSuccess.fridgeLocation})
                    </div>
                  </div>
                </div>

                <button onClick={closeRequestModal} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Close & Continue Browsing
                </button>
              </div>
            ) : (
              /* Request Form View */
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    {activeFood.category}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '8px', marginBottom: '4px' }}>
                    {activeFood.foodName}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Available at: <strong style={{ color: '#fff' }}>{activeFood.fridgeName}</strong> ({activeFood.fridgeLocation})
                  </p>
                </div>

                {modalError && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f87171',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} /> {modalError}
                  </div>
                )}

                <form onSubmit={handleSubmittingRequest}>
                  {/* Available Stock & Unit Indicator */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Currently Available:</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
                      {activeFood.quantity} {activeFood.unit}
                    </span>
                  </div>

                  {/* Interactive Quantity Selector */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Quantity to Receive ({activeFood.unit}):</label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                        onClick={handleDecreaseQty}
                        disabled={requestQty <= 1 || pendingDonationIds.includes(activeFood.id)}
                      >
                        <Minus size={18} />
                      </button>

                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, flex: 1, padding: '10px' }}
                        value={requestQty}
                        min="1"
                        max={activeFood.quantity}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        disabled={pendingDonationIds.includes(activeFood.id)}
                        required
                      />

                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                        onClick={handleIncreaseQty}
                        disabled={requestQty >= activeFood.quantity || pendingDonationIds.includes(activeFood.id)}
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      <span>Minimum: 1 {activeFood.unit}</span>
                      <span>Maximum: {activeFood.quantity} {activeFood.unit}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={closeRequestModal} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 2, padding: '12px' }}
                      disabled={submitting || pendingDonationIds.includes(activeFood.id)}
                    >
                      {submitting ? 'Submitting Request...' : (pendingDonationIds.includes(activeFood.id) ? 'Already Requested' : 'Submit Food Request')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


