import { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { deleteListing, getHostListings, updateListing } from '../../services/listingService';
import {
  downloadBookingPdf,
  downloadBookingsCsv,
  getHostBookings,
} from '../../services/bookingService';
import { formatDate } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      setBookingsError('');
      const data = await getHostBookings();
      setBookings(data);
    } catch (err) {
      setBookingsError(err?.response?.data?.message || 'Failed to load system bookings.');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getHostListings()
      .then((data) => {
        if (isMounted) setListings(data);
      })
      .catch((err) => {
        console.error('Failed to load system data', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    getHostBookings()
      .then((data) => {
        if (isMounted) setBookings(data);
      })
      .catch((err) => {
        if (isMounted) {
          setBookingsError(err?.response?.data?.message || 'Failed to load system bookings.');
        }
      })
      .finally(() => {
        if (isMounted) setBookingsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workspace listing?')) {
      try {
        await deleteListing(id);
        setListings((current) => current.filter((item) => item._id !== id));
      } catch {
        alert('Failed to delete listing.');
      }
    }
  };

  const handleToggleListing = async (listing) => {
    try {
      const result = await updateListing(listing._id, { isActive: !listing.isActive });
      setListings((current) => current.map((item) => (
        item._id === listing._id ? result.listing : item
      )));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update listing status.');
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const blob = await downloadBookingsCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ireserve-report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to export bookings.');
    } finally {
      setExportingCsv(false);
    }
  };

  const handleDownloadPdf = async (bookingId) => {
    try {
      const blob = await downloadBookingPdf(bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to download receipt.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">System overview and workspace governance.</p>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 font-bold text-lg">System Listings</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-155 text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Hourly Rate</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {listings.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/50 transition">
                  <td className="py-4 px-6 font-medium text-white">{item.title}</td>
                  <td className="py-4 px-6 text-slate-300">{item.category}</td>
                  <td className="py-4 px-6 text-slate-300">KES {item.hourlyRate}</td>
                  <td className="py-4 px-6 capitalize text-slate-300">
                    {item.isActive ? 'Active' : 'Inactive'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleListing(item)}
                        className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-600 transition"
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-lg">System Bookings</h2>
            <p className="mt-1 text-sm text-slate-400">Review all reservations across workspaces.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchBookings}
              disabled={bookingsLoading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {bookingsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportingCsv || bookings.length === 0}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition"
            >
              {exportingCsv ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
        {bookingsError && (
          <div role="alert" className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {bookingsError}
          </div>
        )}
        {bookingsLoading ? (
          <p className="p-6 text-sm text-slate-400">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No bookings have been made yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-220 text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Workspace</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Start Time</th>
                  <th className="py-4 px-6">End Time</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6 font-medium text-white">
                      {booking.listingId?.title || 'Workspace'}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <div>{booking.clientId?.name || 'Client'}</div>
                      {booking.clientId?.email && (
                        <div className="mt-1 text-xs text-slate-500">{booking.clientId.email}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-300">{formatDate(booking.startTime)}</td>
                    <td className="py-4 px-6 text-slate-300">{formatDate(booking.endTime)}</td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td className="py-4 px-6 capitalize text-slate-300">{booking.bookingStatus}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(booking._id)}
                        className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-600 transition"
                      >
                        Receipt PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;