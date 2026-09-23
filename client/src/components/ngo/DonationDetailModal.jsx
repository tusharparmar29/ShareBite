import React from 'react';
import {
  MapPin,
  Clock,
  Utensils,
  Box,
  User,
  Phone,
  Mail,
  Calendar,
  Info,
  CheckCircle2
} from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const DonationDetailModal = ({
  isOpen,
  onClose,
  donation,
  onClaim,
  canClaim = false,
  isClaiming = false
}) => {
  if (!donation) return null;

  const {
    _id,
    foodName,
    foodType,
    quantity,
    quantityUnit,
    pickupLocation,
    pickupDeadline,
    preparationTime,
    storageMethod,
    description,
    image,
    status,
    expiryStatus,
    priorityScore,
    donor,
    claimedAt,
    completedAt
  } = donation;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Food Donation Details" maxWidth="lg">
      <div className="space-y-5">
        {/* Optional Image Banner */}
        {image && (
          <div className="h-44 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={image}
              alt={foodName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Title & Badges Header */}
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <StatusBadge status={status} type="status" />

            <div className="flex items-center gap-1.5">
              {expiryStatus && <StatusBadge status={expiryStatus} type="expiry" />}
              {typeof priorityScore === 'number' && (
                <StatusBadge status={priorityScore} type="priority" />
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{foodName}</h2>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
            <Utensils className="w-3.5 h-3.5 text-gray-400" />
            <span>Category: {foodType}</span>
          </p>
        </div>

        {/* Food & Storage Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 block font-medium">Quantity Available</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
              {quantity} {quantityUnit || 'servings'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block font-medium">Storage Method</span>
            <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
              {storageMethod || 'Standard'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block font-medium">Prepared On</span>
            <span className="font-medium text-gray-800 mt-0.5 block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              {formatDate(preparationTime)}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block font-medium">Pickup Deadline</span>
            <span className="font-semibold text-gray-900 mt-0.5 block flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              {formatDate(pickupDeadline)}
            </span>
          </div>
        </div>

        {/* Pickup Location & Instructions */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Pickup Address</span>
              <p className="text-gray-700 mt-0.5 leading-relaxed">{pickupLocation}</p>
            </div>
          </div>

          {description && (
            <div className="pt-2 border-t border-gray-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-gray-900 block">Special Instructions</span>
                <p className="text-gray-600 mt-0.5 leading-relaxed">{description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Donor Contact Section */}
        {donor && (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-950 block mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Donor Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold text-gray-900">{donor.name}</span>
              </div>
              {donor.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="font-medium text-gray-900">{donor.phone}</span>
                </div>
              )}
              {donor.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-700">{donor.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {status === 'AVAILABLE' && canClaim && onClaim && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              isLoading={isClaiming}
              onClick={() => onClaim(donation)}
            >
              Claim This Food
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DonationDetailModal;
