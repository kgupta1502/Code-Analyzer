import React from 'react';
import logo from './image.png';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img 
                src={logo} 
                alt="Code Analyzer Logo" 
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Code Analyzer
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
