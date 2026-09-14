import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FridgeManagement } from './pages/admin/FridgeManagement';
import { FoodDonationForm } from './pages/donor/FoodDonationForm';
import { DonationHistory } from './pages/donor/DonationHistory';
import { FoodCatalog } from './pages/receiver/FoodCatalog';
import { DonorRequests } from './pages/donor/DonorRequests';
import { ReceiverRequests } from './pages/receiver/ReceiverRequests';
import { VolunteerQueue } from './pages/volunteer/VolunteerQueue';
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { CommunityFridgeMapPage } from './pages/map/CommunityFridgeMapPage';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/browse" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'DONOR') return <Navigate to="/donate" replace />;
  if (user.role === 'RECEIVER') return <Navigate to="/browse" replace />;
  if (user.role === 'VOLUNTEER') return <Navigate to="/volunteer" replace />;
  if (user.role === 'NGO') return <Navigate to="/ngo" replace />;
  return <Navigate to="/browse" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              {/* Home Redirect */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Food Discovery & Map */}
              <Route path="/browse" element={<FoodCatalog />} />
              <Route path="/map" element={<CommunityFridgeMapPage />} />

              {/* Receiver Routes */}
              <Route
                path="/receiver/requests"
                element={
                  <ProtectedRoute allowedRoles={['RECEIVER', 'ADMIN']}>
                    <ReceiverRequests />
                  </ProtectedRoute>
                }
              />

              {/* NGO Routes */}
              <Route
                path="/ngo"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <NgoDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fridges"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FridgeManagement />
                  </ProtectedRoute>
                }
              />

              {/* Donor Routes */}
              <Route
                path="/donate"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <FoodDonationForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/requests"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <DonorRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donations/history"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <DonationHistory />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer Routes */}
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <VolunteerQueue />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
