import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, LogOut, Menu, X, LayoutDashboard, FileText, BarChart3, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card-static border-b border-white/5"
      style={{ borderRadius: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-green to-neon-green-dim flex items-center justify-center group-hover:shadow-glow-green transition-shadow">
              <Zap className="w-5 h-5 text-dark-900" />
            </div>
            <span className="text-lg font-bold">
              Smart<span className="text-neon-green">Loan</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <NavLink to="/" active={isActive('/')}>Home</NavLink>
                <NavLink to="/login" active={isActive('/login')}>Login</NavLink>
                <Link to="/signup" className="btn-neon ml-3 !py-2 !px-6 text-sm">Get Started</Link>
              </>
            ) : user.role === 'admin' ? (
              <>
                <NavLink to="/admin" active={isActive('/admin')} icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavLink>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavLink>
                <NavLink to="/apply" active={isActive('/apply')} icon={<FileText className="w-4 h-4" />}>Apply</NavLink>
                <NavLink to="/credit-score" active={isActive('/credit-score')} icon={<BarChart3 className="w-4 h-4" />}>Credit Score</NavLink>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all ml-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-card-static border-t border-white/5 px-4 py-4 space-y-2"
          style={{ borderRadius: 0 }}
        >
          {!user ? (
            <>
              <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
              <MobileLink to="/login" onClick={() => setMobileOpen(false)}>Login</MobileLink>
              <MobileLink to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</MobileLink>
            </>
          ) : user.role === 'admin' ? (
            <>
              <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-red-400 rounded-lg hover:bg-red-500/10">Logout</button>
            </>
          ) : (
            <>
              <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/apply" onClick={() => setMobileOpen(false)}>Apply for Loan</MobileLink>
              <MobileLink to="/credit-score" onClick={() => setMobileOpen(false)}>Credit Score</MobileLink>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-red-400 rounded-lg hover:bg-red-500/10">Logout</button>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

function NavLink({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all ${
        active
          ? 'text-neon-green bg-neon-green/10'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
      {children}
    </Link>
  );
}
