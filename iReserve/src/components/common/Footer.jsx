import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/Ireserve-logo-design.png';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Ireserve logo" className="h-10 w-auto object-contain" />
            <p className="text-sm mt-1">Enterprise-grade B2B workspace & venue booking engine.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
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