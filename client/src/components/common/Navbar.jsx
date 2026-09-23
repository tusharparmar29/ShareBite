import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogIn, LogOut, User, ShieldAlert, ShieldCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isNgo, isDonor, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
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
        Pending Verification
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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight flex items-center">
                Share<span className="text-emerald-600">Bite</span>
              </span>
              <span className="text-[10px] text-gray-500 block -mt-1 font-medium">Smart Food Redistribution</span>
            </div>
          </Link>

          {/* Navigation Links & Auth Actions */}
          <nav className="flex items-center gap-2 sm:gap-4">
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

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
                {/* User Info & Badges */}
                <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="font-semibold text-gray-900 truncate max-w-[140px]">{user?.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getRoleBadge()}
                      {getVerificationBadge()}
                    </div>
                  </div>
                  {/* Mobile badges */}
                  <div className="flex md:hidden items-center gap-1">
                    {getRoleBadge()}
                    {getVerificationBadge()}
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
                  <span className="hidden sm:inline">Logout</span>
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
