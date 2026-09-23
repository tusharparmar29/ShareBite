import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CheckCheck,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import DonationCard from '../../components/common/DonationCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DonationDetailModal from '../../components/ngo/DonationDetailModal';

const NgoDashboardPage = () => {
  const { user, isVerifiedNgo, isPendingNgo, isRejectedNgo } = useAuth();

  // Tab State: 'available' | 'claimed' | 'completed'
  const [activeTab, setActiveTab] = useState('available');

  // Data states
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [errorAvailable, setErrorAvailable] = useState(null);
  const [errorClaims, setErrorClaims] = useState(null);

  // Search & Filter controls for Available Food
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'deadline' | 'quantity'

  // Modal & Dialog states
  const [detailDonation, setDetailDonation] = useState(null);
  const [claimingDonation, setClaimingDonation] = useState(null);
  const [completingDonation, setCompletingDonation] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Feedback notifications
  const [notification, setNotification] = useState({ text: '', type: 'success' });

  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification({ text: '', type: 'success' });
    }, 4500);
  };

  // 1. Fetch available donations feed
  const fetchAvailableDonations = useCallback(async () => {
    setLoadingAvailable(true);
    setErrorAvailable(null);
    try {
      const res = await api.get('/donations?status=AVAILABLE');
      if (res.data.success) {
        setAvailableDonations(res.data.data.donations || []);
      }
    } catch (err) {
      setErrorAvailable(err.message || 'Failed to load available donations.');
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  // 2. Fetch NGO's claimed & completed donations
  const fetchMyClaims = useCallback(async () => {
    setLoadingClaims(true);
    setErrorClaims(null);
    try {
      const res = await api.get('/donations/my');
      if (res.data.success) {
        setMyClaims(res.data.data.donations || []);
      }
    } catch (err) {
      setErrorClaims(err.message || 'Failed to load your claimed donations.');
    } finally {
      setLoadingClaims(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableDonations();
    fetchMyClaims();
  }, [fetchAvailableDonations, fetchMyClaims]);

  // Split claims into Active Pickups (CLAIMED) and Rescued History (COMPLETED)
  const activePickups = useMemo(() => {
    return myClaims.filter((d) => d.status === 'CLAIMED');
  }, [myClaims]);

  const completedRescues = useMemo(() => {
    return myClaims.filter((d) => d.status === 'COMPLETED');
  }, [myClaims]);

  // Filter & sort available donations (pure display sorting, no recalculated math)
  const processedAvailableDonations = useMemo(() => {
    let list = [...availableDonations];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.foodName?.toLowerCase().includes(q) ||
          d.pickupLocation?.toLowerCase().includes(q) ||
          d.foodType?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((d) =>
        d.foodType?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Sorting: orders using backend-delivered numbers
    list.sort((a, b) => {
      if (sortBy === 'priority') {
        // Highest priority score first
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sortBy === 'deadline') {
        // Soonest deadline first
        return new Date(a.pickupDeadline || 0) - new Date(b.pickupDeadline || 0);
      }
      if (sortBy === 'quantity') {
        // Largest quantity first
        return (b.quantity || 0) - (a.quantity || 0);
      }
      return 0;
    });

    return list;
  }, [availableDonations, searchTerm, selectedCategory, sortBy]);

  // --- Handlers ---
  const handleOpenClaimConfirm = (donation) => {
    if (!isVerifiedNgo) {
      showToast('Only VERIFIED NGOs can claim donations. Please await admin verification.', 'error');
      return;
    }
    setClaimingDonation(donation);
  };

  const handleConfirmClaim = async () => {
    if (!claimingDonation || isClaiming) return;

    setIsClaiming(true);
    try {
      const res = await api.post(`/donations/${claimingDonation._id}/claim`);
      if (res.data.success) {
        showToast('Donation claimed successfully! Moved to Active Pickups.', 'success');
        // Refresh feeds
        fetchAvailableDonations();
        fetchMyClaims();
        setActiveTab('claimed');
      }
    } catch (err) {
      // Handle 409 Conflict gracefully
      if (err.status === 409) {
        showToast('Donation is no longer available. Another organization may have just claimed it.', 'error');
      } else {
        showToast(err.message || 'Failed to claim donation.', 'error');
      }
      fetchAvailableDonations();
    } finally {
      setIsClaiming(false);
      setClaimingDonation(null);
      if (detailDonation?._id === claimingDonation._id) {
        setDetailDonation(null);
      }
    }
  };

  const handleConfirmComplete = async () => {
    if (!completingDonation || isCompleting) return;

    setIsCompleting(true);
    try {
      const res = await api.post(`/donations/${completingDonation._id}/complete`);
      if (res.data.success) {
        showToast('Pickup completed successfully! Food rescue recorded.', 'success');
        fetchMyClaims();
        setActiveTab('completed');
      }
    } catch (err) {
      showToast(err.message || 'Failed to complete pickup.', 'error');
    } finally {
      setIsCompleting(false);
      setCompletingDonation(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
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
              NGO Redistribution Hub
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Verified NGO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Logged in as <span className="font-semibold text-gray-800">{user?.name}</span> ({user?.city || 'India'})
          </p>
        </div>

        {/* Verification Status Banner Pill */}
        {isVerifiedNgo ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified NGO Partner</span>
          </div>
        ) : isPendingNgo ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Pending Admin Verification</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Verification Rejected</span>
          </div>
        )}
      </div>

      {/* Verification Notice Banner if not VERIFIED */}
      {!isVerifiedNgo && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          isPendingNgo ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h4 className="font-bold">
              {isPendingNgo ? 'Verification in Progress' : 'Verification Rejected'}
            </h4>
            <p className="mt-0.5 leading-relaxed">
              {isPendingNgo
                ? 'Your organization is registered but awaiting admin verification. You can browse available donations, but claiming items requires an approved VERIFIED status.'
                : 'Your organization account verification was rejected. You cannot claim food donations. Please reach out to the platform administrator.'}
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('available')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'available'
              ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-500 shadow-xs'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Available Feed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-gray-900">
            {availableDonations.length}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Active surplus food offerings</span>
        </div>

        <div
          onClick={() => setActiveTab('claimed')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'claimed'
              ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-500 shadow-xs'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Pickups</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-blue-600">
            {activePickups.length}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Claimed & pending collection</span>
        </div>

        <div
          onClick={() => setActiveTab('completed')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'completed'
              ? 'bg-purple-50/50 border-purple-300 ring-1 ring-purple-500 shadow-xs'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Completed Rescues</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-purple-600">
            {completedRescues.length}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Successfully rescued & distributed</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="space-y-6">
        <div className="flex items-center border-b border-gray-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'available'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Available Food Feed</span>
            <span className="text-[11px] font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
              {availableDonations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claimed')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'claimed'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>My Active Pickups</span>
            <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {activePickups.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Rescued History</span>
            <span className="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              {completedRescues.length}
            </span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: AVAILABLE FOOD FEED
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {/* Search & Sort Tool Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search food item or address..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter & Sort Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs rounded-lg border border-gray-300 py-1.5 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Cooked">Cooked Meals</option>
                    <option value="Bakery">Bakery Items</option>
                    <option value="Produce">Fresh Produce</option>
                    <option value="Packaged">Packaged Goods</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold text-gray-800 rounded-lg border border-gray-300 py-1.5 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="priority">Priority Score (Highest)</option>
                    <option value="deadline">Pickup Deadline (Soonest)</option>
                    <option value="quantity">Quantity (Largest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Handling */}
            {loadingAvailable ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Finding surplus food donations..." />
              </div>
            ) : errorAvailable ? (
              <ErrorState
                title="Could Not Load Available Food"
                message={errorAvailable}
                onRetry={fetchAvailableDonations}
              />
            ) : processedAvailableDonations.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No available donations found"
                description={
                  searchTerm || selectedCategory !== 'ALL'
                    ? 'No donations match your current search or category filters.'
                    : 'There are currently no surplus food donations waiting for pickup. Check back soon!'
                }
                action={
                  searchTerm || selectedCategory !== 'ALL' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('ALL');
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedAvailableDonations.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    actions={
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setDetailDonation(donation)}
                        >
                          Details
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          disabled={!isVerifiedNgo}
                          title={!isVerifiedNgo ? 'Account must be verified by Admin to claim' : 'Claim this food'}
                          onClick={() => handleOpenClaimConfirm(donation)}
                        >
                          {isVerifiedNgo ? 'Claim' : 'Verify to Claim'}
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: ACTIVE PICKUPS (In-Transit)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'claimed' && (
          <div className="space-y-4">
            {loadingClaims ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Loading active pickups..." />
              </div>
            ) : errorClaims ? (
              <ErrorState
                title="Could Not Load Pickups"
                message={errorClaims}
                onRetry={fetchMyClaims}
              />
            ) : activePickups.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No active pickups"
                description="Your organization has not claimed any active donations. Browse the available feed to claim food."
                action={
                  <Button variant="primary" size="sm" onClick={() => setActiveTab('available')}>
                    Browse Available Food
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePickups.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    actions={
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setDetailDonation(donation)}
                        >
                          Details
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCheck}
                          onClick={() => setCompletingDonation(donation)}
                        >
                          Complete Pickup
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: RESCUED HISTORY (Completed)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {loadingClaims ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Loading rescue history..." />
              </div>
            ) : errorClaims ? (
              <ErrorState
                title="Could Not Load History"
                message={errorClaims}
                onRetry={fetchMyClaims}
              />
            ) : completedRescues.length === 0 ? (
              <EmptyState
                icon={CheckCheck}
                title="No completed pickups yet"
                description="Once you complete pickups for claimed food donations, your impact history will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRescues.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    actions={
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setDetailDonation(donation)}
                      >
                        View Record
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Donation Detail Modal */}
      <DonationDetailModal
        isOpen={Boolean(detailDonation)}
        onClose={() => setDetailDonation(null)}
        donation={detailDonation}
        canClaim={isVerifiedNgo}
        onClaim={(donation) => {
          setDetailDonation(null);
          handleOpenClaimConfirm(donation);
        }}
      />

      {/* Claim Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(claimingDonation)}
        onClose={() => setClaimingDonation(null)}
        onConfirm={handleConfirmClaim}
        title="Confirm Food Claim"
        message={`Are you sure your organization will collect "${claimingDonation?.foodName}" from "${claimingDonation?.pickupLocation}"? Once claimed, it is reserved exclusively for your NGO.`}
        confirmText="Claim Donation"
        cancelText="Cancel"
        isLoading={isClaiming}
      />

      {/* Complete Pickup Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(completingDonation)}
        onClose={() => setCompletingDonation(null)}
        onConfirm={handleConfirmComplete}
        title="Complete Food Pickup"
        message={`Confirm that your NGO has physically picked up "${completingDonation?.foodName}" and successfully collected the surplus food?`}
        confirmText="Mark Pickup Completed"
        cancelText="Cancel"
        isLoading={isCompleting}
      />
    </div>
  );
};

export default NgoDashboardPage;
