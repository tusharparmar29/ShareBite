import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Award } from 'lucide-react';
import api from '../services/api';

const HomePage = () => {
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
      .catch((err) => {
        if (isMounted) {
          setHealthStatus('offline');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto">
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

        {/* Backend API Connectivity Status Card */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors bg-gray-50 border-gray-200">
          <Activity className={`w-4 h-4 ${healthStatus === 'connected' ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
          <span>Backend API Status:</span>
          {healthStatus === 'checking' && (
            <span className="text-amber-600 font-semibold">Connecting...</span>
          )}
          {healthStatus === 'connected' && (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              Online ({healthData?.status})
            </span>
          )}
          {healthStatus === 'offline' && (
            <span className="text-rose-600 font-semibold">Offline (Start server on port 5000)</span>
          )}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Verified NGO Network</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Admin verification safeguards food safety. Only approved NGOs can claim donations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Dynamic Smart Expiry</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Real-time freshness indicators calculated by the backend without stale database updates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Rule-based Priority</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Deterministic 0–100 priority scoring to surface urgent, high-volume food pickups first.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
