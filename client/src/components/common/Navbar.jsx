import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
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

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <span className="text-xs text-emerald-800 bg-emerald-100 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              API Ready
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
