import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import LoanApplication from './pages/LoanApplication';
import CreditScore from './pages/CreditScore';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/apply" element={<ProtectedRoute><LoanApplication /></ProtectedRoute>} />
        <Route path="/credit-score" element={<ProtectedRoute><CreditScore /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141B22',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#00FFA3', secondary: '#0B0F14' } },
            error: { iconTheme: { primary: '#FF4D6A', secondary: '#0B0F14' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
