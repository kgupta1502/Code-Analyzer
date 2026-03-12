import React, { useEffect, useState } from 'react';

export const Loading = ({ size = 48 }) => {
  const quotes = [
    'Analyzing loops and recursion...',
    'Measuring time and space complexity...',
    'Estimating performance curves...',
    'Scanning for nested iterations...',
    'Calculating Big O notation...',
    'Optimizing algorithm analysis...'
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % quotes.length), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-6 p-8 text-slate-300">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1">
          <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin text-white">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <span className="text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {quotes[i]}
        </span>
        <div className="mt-3 flex gap-1 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};
export default Loading;
