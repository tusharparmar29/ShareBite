import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isNgo, isDonor, isAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getVerificationBadge = () => {
    if (!isNgo) return null;
    const status = user?.verificationStatus;
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          Verified
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
        <ShieldAlert className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
          Admin
        </span>
      );
    }
    if (isDonor) {
      return (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Donor
        </span>
      );
    }
    if (isNgo) {
      return (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          NGO
        </span>
      );
    }
    return null;
  };

  const dashboardPath = isDonor
    ? '/donor/dashboard'
    : isNgo
    ? '/ngo/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : null;

  const dashboardLabel = isDonor
    ? 'Donor Dashboard'
    : isNgo
    ? 'NGO Hub'
    : isAdmin
    ? 'Admin Panel'
    : 'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center">
                Share<span className="text-emerald-600">Bite</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-500 block -mt-1 font-medium">
                Food Redistribution
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            {dashboardPath && (
              <Link
                to={dashboardPath}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith(dashboardPath.split('/')[1])
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                }`}
              >
                {dashboardLabel}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                {/* User Info & Badges */}
                <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-semibold text-gray-900 truncate max-w-[130px]">
                      {user?.name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getRoleBadge()}
                      {getVerificationBadge()}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-700 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 transition-colors"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-1 mr-1">
                {getRoleBadge()}
                {getVerificationBadge()}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {isAuthenticated && (
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-xs">{user?.name}</span>
                  <span className="text-[11px] text-gray-500 block truncate max-w-[200px]">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700'
              }`}
            >
              Home
            </Link>

            {dashboardPath && (
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname.startsWith(dashboardPath.split('/')[1])
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-gray-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{dashboardLabel}</span>
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg text-rose-600 bg-rose-50 border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-3 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
