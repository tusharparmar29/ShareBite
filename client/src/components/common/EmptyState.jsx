import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There is currently no data to display.',
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
