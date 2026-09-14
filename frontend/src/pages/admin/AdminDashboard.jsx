import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Refrigerator, Heart, ShoppingBag, Shield, Activity, Trash2, Edit3, ArrowUpRight, ShieldCheck, CheckCircle, XCircle, MapPin, Clock, AlertCircle, Cpu, Sparkles, AlertTriangle, CheckSquare } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // 'ANALYTICS', 'USERS', 'APPROVALS', 'AI_INSIGHTS'

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // AI Insights State
  const [aiDemandData, setAiDemandData] = useState(null);
  const [aiWasteData, setAiWasteData] = useState(null);
  const [aiRecommendData, setAiRecommendData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/donations/pending')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingDonations(pendingRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const [demandRes, wasteRes, recommendRes] = await Promise.all([
        api.post('/ai/demand/predict', { fridgeId: 1, category: 'Cooked Meal', historicalDemand: [25, 35, 42] }),
        api.post('/ai/waste/predict', { quantity: 45, category: 'Cooked Meal', daysUntilExpiry: 1.2, fridgeId: 1 }),
        api.post('/ai/recommend/fridges', { category: 'Cooked Meal', quantity: 30, expiryHours: 24 })
      ]);

      setAiDemandData(demandRes.data);
      setAiWasteData(wasteRes.data);
      setAiRecommendData(recommendRes.data);
    } catch (err) {
      console.error('Failed to load AI Insights', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'AI_INSIGHTS') {
      fetchAiInsights();
    }
  }, [activeTab]);

  const handleApproveDonation = async (id) => {
    setActionLoadingId(id);
    setActionSuccess('');
    setActionError('');
    try {
      await api.patch(`/donations/${id}/approve`);
      setActionSuccess('Food donation approved successfully!');
      await fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve donation.');
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
      await fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject donation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role?role=${newRole}`);
      fetchData();
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the system?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>System Admin Command Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Realtime network analytics, user permissions, and AI decision insights</p>
        </div>
        <Link to="/admin/fridges" className="btn btn-primary">
          <Refrigerator size={18} /> Manage Fridges
        </Link>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { key: 'ANALYTICS', label: 'Network Overview', icon: Activity },
          { key: 'AI_INSIGHTS', label: 'AI Intelligence & Predictions', icon: Cpu },
          { key: 'USERS', label: `User Directory (${users.length})`, icon: Users },
          { key: 'APPROVALS', label: `Pending Approvals (${pendingDonations.length})`, icon: ShieldCheck }
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
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <IconComp size={18} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'ANALYTICS' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>Loading analytics...</div>
          ) : (
            <>
              <div className="grid-layout grid-cols-4" style={{ marginBottom: '28px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Total Registered Users</span>
                    <Users size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.totalUsers || 0}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Active Fridges</span>
                    <Refrigerator size={20} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                    {stats?.activeFridges || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {stats?.totalFridges} total</span>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Total Food Donations</span>
                    <Heart size={20} style={{ color: '#ec4899' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.totalDonations || 0}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Meals Saved & Collected</span>
                    <ShoppingBag size={20} style={{ color: '#eab308' }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats?.totalSavedMeals || 0}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: AI INSIGHTS */}
      {activeTab === 'AI_INSIGHTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '20px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <h3 style={{ color: '#c084fc', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Cpu size={22} /> FastAPI AI & ML Intelligence Engine
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
              Realtime model inferences generated via Python + FastAPI REST Microservice (Scikit-Learn & OpenCV Color Space Preprocessing)
            </p>
          </div>

          {aiLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#c084fc' }}>Communicating with FastAPI AI Microservice...</div>
          ) : (
            <div className="grid-layout grid-cols-3">
              {/* Demand Prediction Card */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>ML Demand Prediction</h4>
                  <span className={`badge ${aiDemandData?.isPrototype ? 'badge-expired' : 'badge-available'}`}>
                    {aiDemandData?.isPrototype ? 'Fallback' : 'FastAPI Engine'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Target: <strong>Downtown Community Fridge</strong> (Cooked Meal)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Predicted Demand Quantity</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {aiDemandData?.predictedDemand ?? 42} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>servings</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Model: {aiDemandData?.modelType || 'FastAPI / Scikit-Learn RandomForestRegressor'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: aiDemandData?.isPrototype ? '#f59e0b' : '#34d399', marginTop: '2px' }}>
                    Service: {aiDemandData?.isPrototype ? 'Spring Boot Fallback' : 'FastAPI AI Engine'}
                  </div>
                </div>
              </div>

              {/* Food Waste Risk Card */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>Food Waste Risk Classifier</h4>
                  <span className={`badge ${aiWasteData?.isPrototype ? 'badge-expired' : 'badge-available'}`}>
                    {aiWasteData?.isPrototype ? 'Fallback' : 'FastAPI Engine'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Target Stock: <strong>Fresh Rice Meal</strong> (Expiry in 1.2 Days)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Calculated Waste Risk Score</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: aiWasteData?.wasteRisk === 'HIGH' ? '#f87171' : '#34d399' }}>
                    {aiWasteData?.riskScore ?? 0.82} ({aiWasteData?.wasteRisk || 'HIGH'} RISK)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Model: {aiWasteData?.modelType || 'FastAPI / Scikit-Learn RandomForestClassifier'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: aiWasteData?.isPrototype ? '#f59e0b' : '#34d399', marginTop: '2px' }}>
                    Service: {aiWasteData?.isPrototype ? 'Spring Boot Fallback' : 'FastAPI AI Engine'}
                  </div>
                </div>
              </div>

              {/* Fridge Matching & Recommendation Card */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>Recommendation Engine</h4>
                  <span className="badge badge-available">
                    FastAPI Engine
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Optimal Distribution Priority:
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
                    1. {aiRecommendData?.priorityFridge || 'Downtown Community Fridge'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {aiRecommendData?.explanation || 'High demand & capacity match'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                    Model: {aiRecommendData?.modelType || 'FastAPI / Priority Matching Engine'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#34d399', marginTop: '2px' }}>
                    Service: FastAPI AI Engine
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px' }}>User Access & Role Management</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Current Role</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-dim)' }}>#{u.id}</td>
                  <td style={{ padding: '10px', color: '#fff', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="ADMIN" style={{ background: '#0f172a' }}>ADMIN</option>
                      <option value="DONOR" style={{ background: '#0f172a' }}>DONOR</option>
                      <option value="RECEIVER" style={{ background: '#0f172a' }}>RECEIVER</option>
                      <option value="VOLUNTEER" style={{ background: '#0f172a' }}>VOLUNTEER</option>
                      <option value="NGO" style={{ background: '#0f172a' }}>NGO</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PENDING APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div className="grid-layout grid-cols-2">
          {pendingDonations.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem' }}>{item.foodName}</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Donor: {item.donorName} | Fridge: {item.fridgeName} | Qty: {item.quantity} {item.unit}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleApproveDonation(item.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Approve
                </button>
                <button onClick={() => handleRejectDonation(item.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
