import React from 'react';
import { MapPin, Clock, Utensils, Box, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const DonationCard = ({
  donation,
  actions,
  className = ''
}) => {
  if (!donation) return null;

  const {
    foodName,
    foodType,
    quantity,
    quantityUnit,
    pickupLocation,
    pickupDeadline,
    storageMethod,
    status,
    expiryStatus,
    priorityScore,
    donor,
    image
  } = donation;

  // Format readable deadline
  const formatDeadline = (dateString) => {
    if (!dateString) return 'No deadline specified';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${className}`}
    >
      {/* Optional Card Image Banner */}
      {image && (
        <div className="h-36 w-full overflow-hidden bg-gray-100">
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

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Status & Priority Row */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <StatusBadge status={status} type="status" />

            <div className="flex items-center gap-1.5">
              {/* Backend-provided Smart Expiry Status */}
              {expiryStatus && (
                <StatusBadge status={expiryStatus} type="expiry" />
              )}

              {/* Backend-provided Priority Score */}
              {typeof priorityScore === 'number' && (
                <StatusBadge status={priorityScore} type="priority" />
              )}
            </div>
          </div>

          {/* Food Title & Type */}
          <h3 className="text-base font-bold text-gray-900 line-clamp-1">
            {foodName}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
            <Utensils className="w-3.5 h-3.5 text-gray-400" />
            <span>{foodType}</span>
          </p>

          {/* Details Grid */}
          <div className="mt-4 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-gray-400" />
                Quantity:
              </span>
              <span className="font-bold text-gray-900">
                {quantity} {quantityUnit || 'servings'}
              </span>
            </div>

            {storageMethod && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Storage:</span>
                <span className="font-medium text-gray-800">{storageMethod}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-2">
              <span className="text-gray-500 flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Location:
              </span>
              <span className="font-medium text-gray-800 truncate text-right">
                {pickupLocation}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Deadline:
              </span>
              <span className="font-semibold text-gray-900">
                {formatDeadline(pickupDeadline)}
              </span>
            </div>

            {donor?.name && (
              <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-100">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Donor:
                </span>
                <span className="text-[11px] font-medium text-gray-600">
                  {donor.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Slot */}
        {actions && (
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationCard;
