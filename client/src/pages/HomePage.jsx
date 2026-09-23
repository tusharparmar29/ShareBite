import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Clock,
  Award,
  ArrowRight,
  HeartHandshake,
  Building2,
  LogIn
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

const HomePage = () => {
  const { isAuthenticated, isDonor, isNgo, isAdmin } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking');
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/health')
      .then((res) => {
        if (isMounted) {
          setHealthStatus('connected');
          setHealthData(res.data.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus('offline');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getDashboardLink = () => {
    if (isDonor) return { path: '/donor/dashboard', label: 'Go to Donor Dashboard' };
    if (isNgo) return { path: '/ngo/dashboard', label: 'Go to NGO Food Hub' };
    if (isAdmin) return { path: '/admin/dashboard', label: 'Open Admin Panel' };
    return null;
  };

  const dashboardTarget = getDashboardLink();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-xs text-center max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          MERN Food Redistribution Platform
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Connecting Food Donors with <span className="text-emerald-600">Verified NGOs</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          ShareBite enables hotels, restaurants, and individuals to donate surplus edible food directly to authenticated NGOs before it goes to waste.
        </p>

        {/* Action Buttons based on Auth state */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {isAuthenticated && dashboardTarget ? (
            <Link
              to={dashboardTarget.path}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm"
            >
              <span>{dashboardTarget.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm"
              >
                <span>Get Started (Register)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm bg-white hover:bg-gray-50 transition-all shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Backend API Connectivity Status Card */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-lg border text-xs font-medium transition-colors bg-gray-50 border-gray-200">
          <Activity
            className={`w-3.5 h-3.5 ${
              healthStatus === 'connected'
                ? 'text-emerald-600 animate-pulse'
                : 'text-gray-400'
            }`}
          />
          <span className="text-gray-600">Backend API Status:</span>
          {healthStatus === 'checking' && (
            <span className="text-amber-600 font-semibold">Connecting...</span>
          )}
          {healthStatus === 'connected' && (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              Online ({healthData?.status})
            </span>
          )}
          {healthStatus === 'offline' && (
            <span className="text-rose-600 font-semibold">
              Offline (Start server on port 5000)
            </span>
          )}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Verified NGO Network</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Admin verification safeguards food safety. Only approved NGOs can claim donations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Dynamic Smart Expiry</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Real-time freshness indicators calculated by the backend without stale database updates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Rule-based Priority</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Deterministic 0–100 priority scoring to surface urgent, high-volume food pickups first.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
