import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getUserBookings,
  cancelBooking,
  initializeMpesaPayment,
  downloadBookingPdf,
} from '../../services/bookingService';
import { formatDate } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/formatCurrency';

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [refreshingBookings, setRefreshingBookings] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [bookingActionError, setBookingActionError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getUserBookings()
      .then((data) => {
        if (isMounted) setBookings(data);
      })
      .catch((err) => {
        console.error('Failed to load user bookings', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshBookings = async () => {
    try {
      setRefreshingBookings(true);
      setBookingActionError('');
      setBookings(await getUserBookings());
    } catch (err) {
      setBookingActionError(err?.response?.data?.message || 'Failed to refresh bookings.');
    } finally {
      setRefreshingBookings(false);
    }
  };

  const handlePay = async (event) => {
    event.preventDefault();
    if (!paymentBooking) return;

    try {
      setPayLoading(paymentBooking._id);
      setPaymentError('');
      const response = await initializeMpesaPayment(paymentBooking._id, phoneNumber);
      setPaymentMessage(
        `${response.message || 'M-Pesa prompt sent.'} Approve the request on your phone. The booking will be confirmed after payment is verified.`
      );
      setPaymentBooking(null);
      setPhoneNumber('');
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message || err.message || 'Failed to initialize M-Pesa payment.'
      );
    } finally {
      setPayLoading(null);
    }
  };

  const handleDownloadPdf = async (bookingId) => {
    try {
      const blob = await downloadBookingPdf(bookingId);
      triggerDownload(blob, `invoice-${bookingId}.pdf`);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to download receipt.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancelLoading(bookingId);
      setBookingActionError('');
      const result = await cancelBooking(bookingId);
      setBookings((current) => current.map((booking) => (
        booking._id === bookingId ? result.booking : booking
      )));
    } catch (err) {
      setBookingActionError(
        err?.response?.data?.message || 'Failed to cancel this booking.'
      );
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
        <p className="text-slate-400 text-sm">Manage your venue reservations and view receipt status.</p>
      </div>

      {paymentMessage && (
        <div role="status" className="mb-6 flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{paymentMessage}</span>
          <button
            type="button"
            onClick={refreshBookings}
            disabled={refreshingBookings}
            className="shrink-0 font-semibold text-emerald-200 underline disabled:opacity-50"
          >
            {refreshingBookings ? 'Refreshing...' : 'Refresh booking status'}
          </button>
        </div>
      )}
      {bookingActionError && (
        <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {bookingActionError}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          You have no active or previous workspace bookings.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left border-collapse">
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
                      {item.listingId?.title || 'Workspace Venue'}
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
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(item._id)}
                          className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Receipt PDF
                        </button>
                        {item.bookingStatus === 'pending' && item.paymentStatus !== 'paid' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentBooking(item);
                                setPhoneNumber('');
                                setPaymentError('');
                              }}
                              disabled={cancelLoading === item._id}
                              className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                            >
                              Pay with M-Pesa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(item._id)}
                              disabled={cancelLoading === item._id || payLoading === item._id}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                            >
                              {cancelLoading === item._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {paymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <form
            onSubmit={handlePay}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            aria-labelledby="mpesa-payment-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="mpesa-payment-title" className="text-xl font-bold">Pay with M-Pesa</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Enter the Kenyan phone number that should receive the payment prompt.
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-200">
                  Booking total: {formatCurrency(paymentBooking.totalPrice)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  M-Pesa charges are rounded to the nearest whole KES.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentBooking(null)}
                disabled={payLoading === paymentBooking._id}
                aria-label="Close payment dialog"
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <div>
              <label htmlFor="mpesa-phone" className="mb-1 block text-sm font-medium text-slate-300">
                M-Pesa phone number
              </label>
              <input
                id="mpesa-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0712345678 or 254712345678"
                required
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            {paymentError && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {paymentError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentBooking(null)}
                disabled={payLoading === paymentBooking._id}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payLoading === paymentBooking._id}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {payLoading === paymentBooking._id ? 'Sending prompt...' : 'Send payment prompt'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;