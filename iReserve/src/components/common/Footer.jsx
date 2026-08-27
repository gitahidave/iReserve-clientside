import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xl font-bold text-white">iReserve</span>
            <p className="text-sm mt-1">Enterprise-grade B2B workspace & venue booking engine.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/listings" className="hover:text-slate-200 transition">Workspaces</Link>
            <a href="#terms" className="hover:text-slate-200 transition">Terms of Service</a>
            <a href="#privacy" className="hover:text-slate-200 transition">Privacy Policy</a>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} iReserve Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;