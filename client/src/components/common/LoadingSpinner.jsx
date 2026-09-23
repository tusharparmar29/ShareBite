import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} border-emerald-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-xs text-gray-500 font-medium">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
