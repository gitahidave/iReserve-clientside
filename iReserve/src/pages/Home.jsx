import React from 'react';
import { Link } from 'react-router-dom';
import heroWorkspace from '../assets/hero-workspace.jpg';

const Home = () => {
  return (
    <div className="bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.72), rgba(2, 6, 23, 0.86)), url(${heroWorkspace})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              B2B Venue & Workspace Booking Engine
            </span>
            <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Reserve Premium Workspaces with Ease
            </h1>
            <p className="text-base sm:text-xl text-slate-400 mb-8 leading-relaxed">
              Book boardrooms, private offices, and event halls on demand. Real-time availability, and double-booking protection with seamless payments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/listings"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg transition"
              >
                Browse Workspaces
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Collision Lock</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Prevent double-bookings with our real-time availability and collision lock system, ensuring a seamless booking experience.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 bg-emerald-600/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                💳
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Checkout</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pay instantly via M-Pesa or credit card with direct automated payout splits to venue hosts.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 bg-purple-600/10 text-purple-400 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                📄
              </div>
              <h3 className="text-xl font-bold mb-2">Instant PDF Receipts</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Print-friendly PDF receipts generated automatically after each booking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;