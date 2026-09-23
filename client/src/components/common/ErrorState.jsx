import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-6 sm:p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/50 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white border border-rose-200 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-900">{title}</h3>
      <p className="mt-1 text-xs text-rose-700 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button
            size="sm"
            variant="outline"
            icon={RotateCcw}
            onClick={onRetry}
            className="border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
