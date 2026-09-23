import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlusCircle,
  Package,
  CheckCircle2,
  Clock,
  CheckCheck,
  Edit,
  Trash2,
  HeartHandshake,
  Check
} from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import DonationCard from '../../components/common/DonationCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DonationFormModal from '../../components/donor/DonationFormModal';

const DonorDashboardPage = () => {
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [cancellingDonation, setCancellingDonation] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Success notification message
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  // Fetch donor's own donations
  const fetchMyDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/donations/my');
      if (res.data.success) {
        setDonations(res.data.data.donations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your donations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

  // Metric summaries
  const metrics = useMemo(() => {
    const total = donations.length;
    const available = donations.filter((d) => d.status === 'AVAILABLE').length;
    const claimed = donations.filter((d) => d.status === 'CLAIMED').length;
    const completed = donations.filter((d) => d.status === 'COMPLETED').length;
    return { total, available, claimed, completed };
  }, [donations]);

  // Filtered donations list
  const filteredDonations = useMemo(() => {
    if (activeFilter === 'ALL') return donations;
    return donations.filter((d) => d.status === activeFilter);
  }, [donations, activeFilter]);

  // Handle Edit Action
  const handleOpenEdit = (donation) => {
    setEditingDonation(donation);
    setIsFormOpen(true);
  };

  // Handle Create Action
  const handleOpenCreate = () => {
    setEditingDonation(null);
    setIsFormOpen(true);
  };

  // Form Success Callback
  const handleFormSuccess = (savedDonation) => {
    if (editingDonation) {
      setDonations((prev) =>
        prev.map((d) => (d._id === savedDonation._id ? savedDonation : d))
      );
      showNotification('Donation updated successfully!');
    } else {
      setDonations((prev) => [savedDonation, ...prev]);
      showNotification('Food donation published successfully!');
    }
    fetchMyDonations();
  };

  // Handle Cancel Action
  const handleConfirmCancel = async () => {
    if (!cancellingDonation) return;

    setIsCancelling(true);
    try {
      const res = await api.delete(`/donations/${cancellingDonation._id}`);
      if (res.data.success) {
        setDonations((prev) =>
          prev.map((d) =>
            d._id === cancellingDonation._id ? { ...d, status: 'CANCELLED' } : d
          )
        );
        showNotification('Donation cancelled successfully.');
      }
    } catch (err) {
      showNotification(`Error: ${err.message || 'Could not cancel donation.'}`);
    } finally {
      setIsCancelling(false);
      setCancellingDonation(null);
      fetchMyDonations();
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-gray-900 text-white shadow-xl flex items-center gap-3 text-xs sm:text-sm animate-in slide-in-from-top-4 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Donor Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Food Donor
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span>. Manage your surplus food offerings here.
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={handleOpenCreate}
          className="shadow-sm"
        >
          Create Donation
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Listed</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-gray-900">{metrics.total}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Lifetime listings</span>
        </div>

        {/* Available */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Available</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-emerald-600">{metrics.available}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Ready for NGO pickup</span>
        </div>

        {/* Claimed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Claimed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-blue-600">{metrics.claimed}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Pickup in progress</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-purple-600">{metrics.completed}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Food rescued & delivered</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Filter Navigation */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-gray-200 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { key: 'ALL', label: 'All Donations' },
              { key: 'AVAILABLE', label: `Available (${metrics.available})` },
              { key: 'CLAIMED', label: `Claimed (${metrics.claimed})` },
              { key: 'COMPLETED', label: `Completed (${metrics.completed})` },
              { key: 'CANCELLED', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Showing {filteredDonations.length} of {donations.length}
          </span>
        </div>

        {/* Status Handling: Loading, Error, Empty, or List */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading your donation history..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load Donations"
            message={error}
            onRetry={fetchMyDonations}
          />
        ) : filteredDonations.length === 0 ? (
          <EmptyState
            icon={Package}
            title={activeFilter === 'ALL' ? 'No food donations yet' : `No ${activeFilter.toLowerCase()} donations`}
            description={
              activeFilter === 'ALL'
                ? 'You have not created any food donations yet. List your surplus food to connect with verified NGOs.'
                : `There are currently no donations with status '${activeFilter}'.`
            }
            action={
              activeFilter === 'ALL' ? (
                <Button variant="primary" icon={PlusCircle} onClick={handleOpenCreate} size="sm">
                  Create First Donation
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setActiveFilter('ALL')}>
                  View All Donations
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                actions={
                  donation.status === 'AVAILABLE' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleOpenEdit(donation)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setCancellingDonation(donation)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : donation.status === 'CLAIMED' ? (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      Claimed by NGO • Pickup Pending
                    </span>
                  ) : donation.status === 'COMPLETED' ? (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                      Pickup Completed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      Donation Cancelled
                    </span>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Donation Modal */}
      <DonationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDonation(null);
        }}
        onSuccess={handleFormSuccess}
        initialData={editingDonation}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancellingDonation)}
        onClose={() => setCancellingDonation(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Food Donation"
        message={`Are you sure you want to cancel the donation for "${cancellingDonation?.foodName}"? Once cancelled, verified NGOs will no longer be able to claim it.`}
        confirmText="Cancel Donation"
        cancelText="Keep Active"
        isDestructive={true}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default DonorDashboardPage;
