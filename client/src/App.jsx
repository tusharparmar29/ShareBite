import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import DonorDashboardPage from './pages/donor/DonorDashboardPage';
import NgoDashboardPage from './pages/ngo/NgoDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Donor Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
              <Route path="donor" element={<Navigate to="/donor/dashboard" replace />} />
              <Route path="donor/dashboard" element={<DonorDashboardPage />} />
            </Route>

            {/* NGO Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
              <Route path="ngo" element={<Navigate to="/ngo/dashboard" replace />} />
              <Route path="ngo/dashboard" element={<NgoDashboardPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
