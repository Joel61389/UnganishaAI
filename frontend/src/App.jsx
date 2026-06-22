import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Pages
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Matches from './pages/Matches';
import Introductions from './pages/Introductions';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Guard
const ProtectedLayout = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Validating session credentials...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="pl-64 min-h-screen">
        <div className="px-8 py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Routes */}
          <Route path="/" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          <Route path="/chat" element={
            <ProtectedLayout>
              <Chatbot />
            </ProtectedLayout>
          } />
          <Route path="/matches" element={
            <ProtectedLayout>
              <Matches />
            </ProtectedLayout>
          } />
          <Route path="/introductions" element={
            <ProtectedLayout>
              <Introductions />
            </ProtectedLayout>
          } />
          <Route path="/analytics" element={
            <ProtectedLayout>
              <Analytics />
            </ProtectedLayout>
          } />
          <Route path="/profile" element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
