import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              ShareBite – Smart Food Redistribution Platform
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Connecting food donors with verified NGOs to eliminate hunger and reduce food waste.
            </p>
          </div>
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <span>Built with care</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for community impact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
