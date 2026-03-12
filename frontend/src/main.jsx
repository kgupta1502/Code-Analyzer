import { createRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CodeAnalyzer from './CodeAnalyzer.jsx';
import Navbar from './NavBar.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <Navbar />
        <CodeAnalyzer />
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
