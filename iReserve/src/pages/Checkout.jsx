import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { createBooking } from '../services/bookingService';
import { getListingById } from '../services/listingService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, calculateHours } from '../utils/dateHelpers';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { listingId, startTime, endTime } = location.state || {};
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!listingId || !startTime || !endTime) {
      navigate('/listings', { replace: true });
      return;
    }

    const loadListing = async () => {
      try {
        setListing(await getListingById(listingId));
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load this workspace.');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [endTime, listingId, navigate, startTime]);

  const hours = calculateHours(startTime, endTime);
  const totalPrice = listing ? hours * listing.hourlyRate : 0;

  const handleConfirm = async () => {
    if (!listingId || hours <= 0) {
      setError('Choose a valid end time after the start time.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await createBooking({
        listingId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      navigate('/dashboard/client', { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to create this booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">Booking confirmation</p>
        <h1 className="text-3xl font-bold mt-2">Review your reservation</h1>
        <p className="text-slate-400 mt-2">The workspace remains pending until payment is completed.</p>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {listing && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {listing.images?.[0] && (
            <img src={listing.images[0]} alt={listing.title} className="h-56 w-full object-cover" />
          )}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{listing.title}</h2>
              <p className="text-slate-400 mt-1">{listing.location?.address}, {listing.location?.city}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-slate-500">Starts</dt>
                <dd className="mt-1 text-slate-200">{formatDate(startTime)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Ends</dt>
                <dd className="mt-1 text-slate-200">{formatDate(endTime)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="mt-1 text-slate-200">{hours > 0 ? `${hours} hours` : 'Invalid time range'}</dd>
              </div>
            </dl>

            <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
              <span className="text-slate-400">Estimated total</span>
              <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Change time
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || hours <= 0}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {submitting ? 'Creating booking...' : 'Confirm booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
