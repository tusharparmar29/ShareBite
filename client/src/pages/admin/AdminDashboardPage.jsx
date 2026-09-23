import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Package,
  CheckCheck,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Eye,
  AlertCircle,
  Building2,
  HeartHandshake,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';

const AdminDashboardPage = () => {
  const { user: currentAdmin } = useAuth();

  // Active Tab: 'ngos' | 'users' | 'donations' | 'impact'
  const [activeTab, setActiveTab] = useState('ngos');

  // Data states
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [errorDonations, setErrorDonations] = useState(null);

  // Filters
  const [ngoStatusFilter, setNgoStatusFilter] = useState('PENDING'); // PENDING | VERIFIED | REJECTED | ALL
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // ALL | donor | ngo
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [donationStatusFilter, setDonationStatusFilter] = useState('ALL');
  const [donationSearchTerm, setDonationSearchTerm] = useState('');

  // Dialog / Action states for Verify / Reject
  const [verificationAction, setVerificationAction] = useState(null); // { ngo, targetStatus: 'VERIFIED' | 'REJECTED' }
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [inspectUser, setInspectUser] = useState(null);
  const [inspectDonation, setInspectDonation] = useState(null);

  // Toast feedback
  const [notification, setNotification] = useState({ text: '', type: 'success' });

  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification({ text: '', type: 'success' });
    }, 4500);
  };

  // 1. Fetch Users List
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const res = await api.get('/admin/users?limit=100');
      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      setErrorUsers(err.message || 'Failed to load users list.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // 2. Fetch All Donations Overview
  const fetchDonations = useCallback(async () => {
    setLoadingDonations(true);
    setErrorDonations(null);
    try {
      const res = await api.get('/donations?limit=100');
      if (res.data.success) {
        setDonations(res.data.data.donations || []);
      }
    } catch (err) {
      setErrorDonations(err.message || 'Failed to load donations overview.');
    } finally {
      setLoadingDonations(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDonations();
  }, [fetchUsers, fetchDonations]);

  // Derived Statistics (Basic platform metrics)
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const donorsCount = users.filter((u) => u.role === 'donor').length;
    const ngos = users.filter((u) => u.role === 'ngo');
    const ngosCount = ngos.length;
    const pendingNgosCount = ngos.filter((u) => u.verificationStatus === 'PENDING').length;
    const verifiedNgosCount = ngos.filter((u) => u.verificationStatus === 'VERIFIED').length;

    const totalDonations = donations.length;
    const availableDonations = donations.filter((d) => d.status === 'AVAILABLE').length;
    const claimedDonations = donations.filter((d) => d.status === 'CLAIMED').length;
    const completedDonations = donations.filter((d) => d.status === 'COMPLETED');
    const completedCount = completedDonations.length;

    // Total quantity rescued (counts numeric values)
    const totalQuantityRescued = completedDonations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

    return {
      totalUsers,
      donorsCount,
      ngosCount,
      pendingNgosCount,
      verifiedNgosCount,
      totalDonations,
      availableDonations,
      claimedDonations,
      completedCount,
      totalQuantityRescued
    };
  }, [users, donations]);

  // Filtered NGOs for Verification Tab
  const filteredNgos = useMemo(() => {
    const allNgos = users.filter((u) => u.role === 'ngo');
    if (ngoStatusFilter === 'ALL') return allNgos;
    return allNgos.filter((u) => u.verificationStatus === ngoStatusFilter);
  }, [users, ngoStatusFilter]);

  // Filtered Users for User Management Tab
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const q = userSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearchTerm]);

  // Filtered Donations for Donations Overview Tab
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchesStatus = donationStatusFilter === 'ALL' || d.status === donationStatusFilter;
      const q = donationSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.foodName?.toLowerCase().includes(q) ||
        d.pickupLocation?.toLowerCase().includes(q) ||
        d.donor?.name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [donations, donationStatusFilter, donationSearchTerm]);

  // Handle Verify / Reject Action
  const handleExecuteVerification = async () => {
    if (!verificationAction || isProcessingAction) return;
    const { ngo, targetStatus } = verificationAction;

    setIsProcessingAction(true);
    try {
      const res = await api.patch(`/admin/ngos/${ngo._id}/verify`, {
        status: targetStatus
      });

      if (res.data.success) {
        showToast(
          `NGO "${ngo.name}" status updated to ${targetStatus}.`,
          targetStatus === 'VERIFIED' ? 'success' : 'error'
        );
        // Update user in local state immediately
        setUsers((prev) =>
          prev.map((u) =>
            u._id === ngo._id ? { ...u, verificationStatus: targetStatus } : u
          )
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update verification status.', 'error');
    } finally {
      setIsProcessingAction(false);
      setVerificationAction(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {notification.text && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-xl text-white shadow-xl flex items-center gap-3 text-xs sm:text-sm animate-in slide-in-from-top-4 duration-200 ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-gray-900'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Admin Control Panel
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Platform Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Platform governance, NGO verification safety checks, and food redistribution oversight.
          </p>
        </div>

        {stats.pendingNgosCount > 0 && (
          <div
            onClick={() => {
              setActiveTab('ngos');
              setNgoStatusFilter('PENDING');
            }}
            className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors animate-pulse"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{stats.pendingNgosCount} Pending NGO Verification{stats.pendingNgosCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Basic Platform Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Platform Users</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-gray-900">{stats.totalUsers}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {stats.donorsCount} Donors • {stats.ngosCount} NGOs
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Pending NGOs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-amber-600">
            {stats.pendingNgosCount}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {stats.verifiedNgosCount} Approved Partner NGOs
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Donations Listed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-blue-600">
            {stats.totalDonations}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {stats.availableDonations} Available • {stats.claimedDonations} In-Transit
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Completed Rescues</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-purple-600">
            {stats.completedCount}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {stats.totalQuantityRescued} Units Rescued
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex items-center border-b border-gray-200 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ngos')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ngos'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>NGO Verifications</span>
            {stats.pendingNgosCount > 0 && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                {stats.pendingNgosCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('donations')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'donations'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Donations Overview</span>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {donations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('impact')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'impact'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Platform Impact</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: NGO VERIFICATION WORKFLOW
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'ngos' && (
          <div className="space-y-4">
            {/* Status Filter Buttons */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'PENDING', label: `Pending (${stats.pendingNgosCount})` },
                  { key: 'VERIFIED', label: `Verified (${stats.verifiedNgosCount})` },
                  { key: 'REJECTED', label: 'Rejected' },
                  { key: 'ALL', label: `All NGOs (${stats.ngosCount})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setNgoStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      ngoStatusFilter === tab.key
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-500">
                Showing {filteredNgos.length} NGO organization{filteredNgos.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loadingUsers ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Loading NGO verification queue..." />
              </div>
            ) : errorUsers ? (
              <ErrorState
                title="Could Not Load NGOs"
                message={errorUsers}
                onRetry={fetchUsers}
              />
            ) : filteredNgos.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title={`No ${ngoStatusFilter.toLowerCase()} NGOs`}
                description={
                  ngoStatusFilter === 'PENDING'
                    ? 'All registered NGOs have been verified. Great job!'
                    : `There are currently no NGOs with status '${ngoStatusFilter}'.`
                }
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200 text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Organization</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Registered On</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredNgos.map((ngo) => (
                        <tr key={ngo._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-900 block text-sm">
                              {ngo.name}
                            </span>
                            <span className="text-gray-400 text-[11px]">ID: {ngo._id}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-gray-800 font-medium block">{ngo.email}</span>
                            <span className="text-gray-500">{ngo.phone || 'No phone'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-gray-800">{ngo.city || 'N/A'}</span>
                            {ngo.address && (
                              <span className="text-gray-400 block truncate max-w-[180px]">
                                {ngo.address}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {formatDate(ngo.createdAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={ngo.verificationStatus} type="verification" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {ngo.verificationStatus !== 'VERIFIED' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={Check}
                                  onClick={() =>
                                    setVerificationAction({ ngo, targetStatus: 'VERIFIED' })
                                  }
                                >
                                  Verify
                                </Button>
                              )}

                              {ngo.verificationStatus !== 'REJECTED' && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={X}
                                  onClick={() =>
                                    setVerificationAction({ ngo, targetStatus: 'REJECTED' })
                                  }
                                >
                                  Reject
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: USER MANAGEMENT
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search user name, email, city..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <span className="text-xs text-gray-500 font-medium">Role:</span>
                {['ALL', 'donor', 'ngo', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      userRoleFilter === role
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {role.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Loading users..." />
              </div>
            ) : errorUsers ? (
              <ErrorState title="Failed to load users" message={errorUsers} onRetry={fetchUsers} />
            ) : filteredUsers.length === 0 ? (
              <EmptyState title="No users found" description="No users match your criteria." />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200 text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">User</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">City</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Joined</th>
                        <th className="py-3.5 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-900 block text-sm">{u.name}</span>
                            <span className="text-gray-500">{u.email}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : u.role === 'ngo'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700">{u.city || 'N/A'}</td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={u.verificationStatus} type="verification" />
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">{formatDate(u.createdAt)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Eye}
                              onClick={() => setInspectUser(u)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: DONATIONS OVERVIEW
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={donationSearchTerm}
                  onChange={(e) => setDonationSearchTerm(e.target.value)}
                  placeholder="Search food item, location, donor..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <span className="text-xs text-gray-500 font-medium">Status:</span>
                {['ALL', 'AVAILABLE', 'CLAIMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDonationStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      donationStatusFilter === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loadingDonations ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Loading donations overview..." />
              </div>
            ) : errorDonations ? (
              <ErrorState
                title="Failed to load donations"
                message={errorDonations}
                onRetry={fetchDonations}
              />
            ) : filteredDonations.length === 0 ? (
              <EmptyState
                title="No donations found"
                description="No food donations match the selected filter."
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200 text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Food Item</th>
                        <th className="py-3.5 px-4">Quantity</th>
                        <th className="py-3.5 px-4">Donor</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Deadline</th>
                        <th className="py-3.5 px-4">Status & Priority</th>
                        <th className="py-3.5 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDonations.map((d) => (
                        <tr key={d._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-900 block text-sm">
                              {d.foodName}
                            </span>
                            <span className="text-gray-500 text-[11px]">{d.foodType}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {d.quantity} {d.quantityUnit}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-gray-900 block">
                              {d.donor?.name || 'Unknown'}
                            </span>
                            <span className="text-gray-400 text-[11px]">{d.donor?.email}</span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700 max-w-[150px] truncate">
                            {d.pickupLocation}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">{formatDate(d.pickupDeadline)}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col items-start gap-1">
                              <StatusBadge status={d.status} type="status" />
                              <div className="flex items-center gap-1">
                                {d.expiryStatus && (
                                  <StatusBadge status={d.expiryStatus} type="expiry" />
                                )}
                                {typeof d.priorityScore === 'number' && (
                                  <StatusBadge status={d.priorityScore} type="priority" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Eye}
                              onClick={() => setInspectDonation(d)}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: BASIC PLATFORM IMPACT
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'impact' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Food Redistribution Summary</span>
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Direct metrics based strictly on confirmed database records (per BUSINESS_RULES.md).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-xs font-semibold text-purple-900 block">Total Food Rescued</span>
                  <span className="text-2xl sm:text-3xl font-black text-purple-700 block mt-2">
                    {stats.totalQuantityRescued} units
                  </span>
                  <span className="text-[11px] text-purple-800 mt-1 block">
                    Across {stats.completedCount} completed pickups
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-semibold text-blue-900 block">Pickups In Progress</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-700 block mt-2">
                    {stats.claimedDonations} active
                  </span>
                  <span className="text-[11px] text-blue-800 mt-1 block">
                    Claimed by partner NGOs
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-900 block">Active Listings</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 block mt-2">
                    {stats.availableDonations} listings
                  </span>
                  <span className="text-[11px] text-emerald-800 mt-1 block">
                    Available for immediate pickup
                  </span>
                </div>
              </div>
            </div>

            {/* Network Participation Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Community Network Participation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">Donors</span>
                    <span className="text-gray-500">Hotels, caterers & individuals</span>
                  </div>
                  <span className="text-xl font-black text-gray-900">{stats.donorsCount}</span>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">Verified NGOs</span>
                    <span className="text-gray-500">Authorized food relief partners</span>
                  </div>
                  <span className="text-xl font-black text-emerald-600">{stats.verifiedNgosCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Verify / Reject */}
      <ConfirmDialog
        isOpen={Boolean(verificationAction)}
        onClose={() => setVerificationAction(null)}
        onConfirm={handleExecuteVerification}
        title={
          verificationAction?.targetStatus === 'VERIFIED'
            ? 'Verify NGO Partner'
            : 'Reject NGO Account'
        }
        message={
          verificationAction?.targetStatus === 'VERIFIED'
            ? `Are you sure you want to verify "${verificationAction?.ngo.name}"? They will immediately receive access to claim surplus food donations across the platform.`
            : `Are you sure you want to reject "${verificationAction?.ngo.name}"? They will NOT be permitted to claim food donations.`
        }
        confirmText={
          verificationAction?.targetStatus === 'VERIFIED'
            ? 'Confirm Verification'
            : 'Reject Account'
        }
        cancelText="Cancel"
        isDestructive={verificationAction?.targetStatus === 'REJECTED'}
        isLoading={isProcessingAction}
      />

      {/* Inspect User Modal */}
      <Modal
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        title="User Record"
        maxWidth="md"
      >
        {inspectUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">{inspectUser.name}</span>
              <StatusBadge status={inspectUser.verificationStatus} type="verification" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Email:</span>
                <span className="font-semibold text-gray-800">{inspectUser.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Role:</span>
                <span className="font-bold uppercase text-gray-900">{inspectUser.role}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Phone:</span>
                <span className="font-medium text-gray-800">{inspectUser.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">City:</span>
                <span className="font-medium text-gray-800">{inspectUser.city || 'N/A'}</span>
              </div>
            </div>

            {inspectUser.address && (
              <div>
                <span className="text-gray-500 block mb-0.5">Address:</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {inspectUser.address}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setInspectUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Inspect Donation Modal */}
      <Modal
        isOpen={Boolean(inspectDonation)}
        onClose={() => setInspectDonation(null)}
        title="Donation Inspection"
        maxWidth="md"
      >
        {inspectDonation && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{inspectDonation.foodName}</span>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={inspectDonation.status} type="status" />
                {inspectDonation.expiryStatus && (
                  <StatusBadge status={inspectDonation.expiryStatus} type="expiry" />
                )}
                {typeof inspectDonation.priorityScore === 'number' && (
                  <StatusBadge status={inspectDonation.priorityScore} type="priority" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Quantity:</span>
                <span className="font-bold text-gray-900">
                  {inspectDonation.quantity} {inspectDonation.quantityUnit}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Food Type:</span>
                <span className="font-medium text-gray-800">{inspectDonation.foodType}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Donor Name:</span>
                <span className="font-semibold text-gray-900">
                  {inspectDonation.donor?.name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Pickup Deadline:</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(inspectDonation.pickupDeadline)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-0.5">Location:</span>
              <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                {inspectDonation.pickupLocation}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setInspectDonation(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
