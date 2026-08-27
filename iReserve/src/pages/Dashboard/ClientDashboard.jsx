import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getUserBookings, initializePaystackPayment } from '../../services/bookingService';
import { formatDate } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/formatCurrency';

const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load user bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (bookingId) => {
    try {
      setPayLoading(bookingId);
      const res = await initializePaystackPayment(bookingId);
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err) {
      alert('Failed to initialize payment processing.');
    } finally {
      setPayLoading(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your venue reservations and view receipt status.</p>

      {bookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          You have no active or previous workspace bookings.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Workspace</th>
                  <th className="py-4 px-6">Start Time</th>
                  <th className="py-4 px-6">End Time</th>
                  <th className="py-4 px-6">Total Cost</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {bookings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6 font-medium text-white">
                      {item.listing?.title || 'Workspace Venue'}
                    </td>
                    <td className="py-4 px-6 text-slate-300">{formatDate(item.startTime)}</td>
                    <td className="py-4 px-6 text-slate-300">{formatDate(item.endTime)}</td>
                    <td className="py-4 px-6 text-white font-semibold">
                      {formatCurrency(item.totalPrice)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          item.bookingStatus === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.bookingStatus === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {item.bookingStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.bookingStatus === 'pending' && (
                        <button
                          onClick={() => handlePay(item._id)}
                          disabled={payLoading === item._id}
                          className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {payLoading === item._id ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;