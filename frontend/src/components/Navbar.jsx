import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Refrigerator, LogOut, User, Heart, Search, ShieldCheck, LayoutDashboard, MapPin, ListOrdered, ShoppingBag, Bell, Building2, Check } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-expired';
      case 'DONOR': return 'badge-available';
      case 'RECEIVER': return 'badge-reserved';
      case 'VOLUNTEER': return 'badge-pending';
      case 'NGO': return 'badge-available';
      default: return 'badge-secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="glass-card" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      padding: '14px 28px',
      margin: '0 0 24px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
        }}>
          <Refrigerator size={22} />
        </div>
        <span style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Community<span style={{ color: 'var(--primary)' }}>Fridge</span>
        </span>
      </Link>

      {/* Dynamic Navigation Links based on User Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/map" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          <MapPin size={16} /> Fridge Map
        </Link>

        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <LayoutDashboard size={16} /> Admin Dashboard
              </Link>
            )}

            {(user.role === 'DONOR' || user.role === 'ADMIN') && (
              <>
                <Link to="/donate" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Heart size={16} /> Donate Food
                </Link>
                <Link to="/donor/requests" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <ListOrdered size={16} /> Manage Requests
                </Link>
              </>
            )}

            {(user.role === 'RECEIVER' || user.role === 'ADMIN') && (
              <>
                <Link to="/browse" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Search size={16} /> Find Food
                </Link>
                <Link to="/receiver/requests" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <ShoppingBag size={16} /> My Requests
                </Link>
              </>
            )}

            {(user.role === 'NGO' || user.role === 'ADMIN') && (
              <Link to="/ngo" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <Building2 size={16} /> NGO Distribution
              </Link>
            )}

            {(user.role === 'VOLUNTEER' || user.role === 'ADMIN') && (
              <Link to="/volunteer" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} /> Volunteer Station
              </Link>
            )}

            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '45px',
                  width: '320px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  zIndex: 200,
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  background: '#0d1322',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', padding: '16px 0' }}>No notifications yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: n.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(16, 185, 129, 0.1)',
                          borderLeft: `3px solid ${n.isRead ? 'var(--border-glass)' : 'var(--primary)'}`
                        }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{n.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

            {/* User Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <User size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</span>
                <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
