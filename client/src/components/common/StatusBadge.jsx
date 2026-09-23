import React from 'react';
import {
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const StatusBadge = ({
  status,
  type = 'status', // 'status' | 'expiry' | 'priority' | 'verification'
  showScore = true, // Whether to show numeric score in priority badge
  className = ''
}) => {
  if (status === undefined || status === null || status === '') return null;

  const normalized = String(status).trim();

  // 1. Donation Lifecycle Status (Preserves backend lifecycle strictly)
  if (type === 'status') {
    switch (normalized.toUpperCase()) {
      case 'AVAILABLE':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs select-none ${className}`}
            title="Donation is currently available for verified NGOs to claim"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            AVAILABLE
          </span>
        );
      case 'CLAIMED':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-300 shadow-2xs select-none ${className}`}
            title="Claimed by verified NGO — awaiting collection"
          >
            <Clock className="w-3 h-3 text-blue-600" />
            CLAIMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-900 border border-purple-300 shadow-2xs select-none ${className}`}
            title="Pickup completed — food successfully rescued"
          >
            <CheckCheck className="w-3 h-3 text-purple-600" />
            COMPLETED
          </span>
        );
      case 'EXPIRED':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300 shadow-2xs select-none ${className}`}
            title="Past pickup deadline"
          >
            <AlertTriangle className="w-3 h-3 text-gray-600" />
            EXPIRED
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs select-none ${className}`}
            title="Donation cancelled by donor"
          >
            <XCircle className="w-3 h-3 text-rose-600" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 select-none ${className}`}
          >
            {normalized}
          </span>
        );
    }
  }

  // 2. Smart Expiry Status (Directly consumed from backend expiryService)
  if (type === 'expiry') {
    switch (normalized) {
      case 'Fresh':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs select-none ${className}`}
            title="Smart Expiry: Plenty of time remaining before pickup deadline"
          >
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            Fresh
          </span>
        );
      case 'Pickup Soon':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs select-none ${className}`}
            title="Smart Expiry: Time is running short for collection"
          >
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            Pickup Soon
          </span>
        );
      case 'Expired':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs select-none ${className}`}
            title="Smart Expiry: Past pickup deadline"
          >
            <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
            Expired
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 select-none ${className}`}
          >
            {normalized}
          </span>
        );
    }
  }

  // 3. Priority Score Label (Consumes backend numeric priorityScore: 0–100)
  if (type === 'priority') {
    const score = Number(normalized);
    let label = 'Normal';
    let style = 'bg-slate-50 text-slate-800 border-slate-300';
    let icon = <Clock className="w-3 h-3 text-slate-500 shrink-0" />;
    let tooltip = 'Standard priority';

    if (!isNaN(score)) {
      if (score >= 70) {
        label = showScore ? `Urgent (${score})` : 'Urgent';
        style = 'bg-rose-50 text-rose-900 border-rose-300';
        icon = <Flame className="w-3 h-3 text-rose-600 shrink-0" />;
        tooltip = `Urgent Priority (${score}/100) — immediate pickup recommended`;
      } else if (score >= 40) {
        label = showScore ? `High (${score})` : 'High';
        style = 'bg-amber-50 text-amber-900 border-amber-300';
        icon = <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />;
        tooltip = `High Priority (${score}/100) — approaching deadline or high quantity`;
      } else {
        label = showScore ? `Normal (${score})` : 'Normal';
        tooltip = `Normal Priority (${score}/100)`;
      }
    } else {
      label = normalized;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs select-none ${style} ${className}`}
        title={tooltip}
      >
        {icon}
        {label}
      </span>
    );
  }

  // 4. Verification Status (NGO verification workflow)
  if (type === 'verification') {
    switch (normalized.toUpperCase()) {
      case 'VERIFIED':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs select-none ${className}`}
            title="Verified by Admin"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            Verified
          </span>
        );
      case 'PENDING':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs select-none ${className}`}
            title="Awaiting Admin Review"
          >
            <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs select-none ${className}`}
            title="Verification Rejected by Admin"
          >
            <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <span
      className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 select-none ${className}`}
    >
      {normalized}
    </span>
  );
};

export default StatusBadge;
