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
  className = ''
}) => {
  if (!status) return null;

  const normalized = String(status).trim();

  // 1. Lifecycle Status
  if (type === 'status') {
    switch (normalized.toUpperCase()) {
      case 'AVAILABLE':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <CheckCircle2 className="w-3 h-3" />
            AVAILABLE
          </span>
        );
      case 'CLAIMED':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
            <Clock className="w-3 h-3" />
            CLAIMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
            <CheckCheck className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300 ${className}`}>
            <AlertTriangle className="w-3 h-3" />
            EXPIRED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            <XCircle className="w-3 h-3" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 ${className}`}>
            {normalized}
          </span>
        );
    }
  }

  // 2. Smart Expiry Status (Directly consumed from backend)
  if (type === 'expiry') {
    switch (normalized) {
      case 'Fresh':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <Sparkles className="w-3 h-3 text-emerald-500" />
            Fresh
          </span>
        );
      case 'Pickup Soon':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${className}`}>
            <Clock className="w-3 h-3 text-amber-600" />
            Pickup Soon
          </span>
        );
      case 'Expired':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            <XCircle className="w-3 h-3 text-rose-500" />
            Expired
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 ${className}`}>
            {normalized}
          </span>
        );
    }
  }

  // 3. Priority Score Label
  if (type === 'priority') {
    const score = Number(normalized);
    let label = 'Normal';
    let style = 'bg-gray-100 text-gray-700 border-gray-200';
    let icon = <Clock className="w-3 h-3 text-gray-500" />;

    if (!isNaN(score)) {
      if (score >= 70) {
        label = `Urgent (${score})`;
        style = 'bg-rose-50 text-rose-800 border-rose-200';
        icon = <Flame className="w-3 h-3 text-rose-500" />;
      } else if (score >= 40) {
        label = `High (${score})`;
        style = 'bg-amber-50 text-amber-800 border-amber-200';
        icon = <AlertTriangle className="w-3 h-3 text-amber-500" />;
      } else {
        label = `Normal (${score})`;
      }
    } else {
      label = normalized;
    }

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${style} ${className}`}>
        {icon}
        {label}
      </span>
    );
  }

  // 4. Verification Status
  if (type === 'verification') {
    switch (normalized.toUpperCase()) {
      case 'VERIFIED':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
            <ShieldAlert className="w-3 h-3" />
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 ${className}`}>
      {normalized}
    </span>
  );
};

export default StatusBadge;
