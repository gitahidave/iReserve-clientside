import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getListings, createListing } from '../../services/listingService';
import { getSupportedBanks, setupHostPayouts } from '../../services/hostService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

const HostDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submittingPayouts, setSubmittingPayouts] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Boardroom',
    hourlyRate: '',
    address: '',
    city: 'Nairobi',
    amenities: '',
  });
  const [payoutForm, setPayoutForm] = useState({
    businessName: '',
    settlementBank: '',
    accountNumber: '',
    accountName: '',
    primaryContactPhone: '',
    percentageCharge: 80,
    description: '',
  });

  useEffect(() => {
    fetchHostListings();
  }, []);

  useEffect(() => {
    if (showPayoutModal) {
      loadBanks();
    }
  }, [showPayoutModal]);

  const fetchHostListings = async () => {
    try {
      const data = await getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate),
        location: {
          address: formData.address.trim() || 'Nairobi',
          city: formData.city.trim() || 'Nairobi',
        },
        amenities: formData.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      };

      await createListing(formattedData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Boardroom',
        hourlyRate: '',
        address: '',
        city: 'Nairobi',
        amenities: '',
      });
      fetchHostListings();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create workspace listing.';
      alert(message);
    }
  };

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      const data = await getSupportedBanks();
      const supportedBanks = data?.banks || [];
      const hasTestBank = supportedBanks.some(
        (bank) => bank.code === 'test-bank' || bank.name?.toLowerCase() === 'test bank'
      );

      const availableBanks = hasTestBank
        ? supportedBanks
        : [{ code: 'test-bank', name: 'Test Bank', country: 'KE', currency: 'KES' }, ...supportedBanks];

      setBanks(availableBanks);

      if (!payoutForm.settlementBank && availableBanks.some((bank) => bank.code === 'test-bank')) {
        setPayoutForm((prev) => ({ ...prev, settlementBank: 'test-bank' }));
      }
    } catch (err) {
      console.error('Failed to load supported banks', err);
      alert(err?.response?.data?.message || 'Failed to load banks.');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmittingPayouts(true);
      await setupHostPayouts({
        ...payoutForm,
        percentageCharge: Number(payoutForm.percentageCharge),
      });

      alert('Payout setup completed successfully.');
      setShowPayoutModal(false);
      setPayoutForm({
        businessName: '',
        settlementBank: '',
        accountNumber: '',
        accountName: '',
        primaryContactPhone: '',
        percentageCharge: 80,
        description: '',
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to save payout setup.';
      alert(message);
    } finally {
      setSubmittingPayouts(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your workspaces and incoming split payouts.</p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                user?.paystackSubaccountCode
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
              }`}
            >
              {user?.paystackSubaccountCode ? 'Payouts enabled' : 'Payouts not set up'}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowPayoutModal(true)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 font-semibold px-4 py-2.5 rounded-xl text-sm transition"
          >
            Set Up Payouts
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2.5 rounded-xl text-sm transition"
          >
            + Add New Property
          </button>
        </div>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-blue-400 uppercase">{item.category}</span>
            <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
            <p className="text-slate-400 text-sm line-clamp-2 my-2">{item.description}</p>
            <div className="text-sm font-semibold text-white pt-2 border-t border-slate-800">
              {formatCurrency(item.hourlyRate)} / hour
            </div>
          </div>
        ))}
      </div>

      {/* Create Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Add Workspace Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm h-24"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300"
                >
                  <option value="Boardroom">Boardroom</option>
                  <option value="Private Office">Private Office</option>
                  <option value="Event Space">Event Space</option>
                </select>
                <input
                  type="number"
                  placeholder="Hourly Rate (KES)"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Street / Address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <input
                type="text"
                placeholder="Amenities (comma separated: WiFi, Projector)"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Set Up Host Payouts</h2>
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Business name"
                required
                value={payoutForm.businessName}
                onChange={(e) => setPayoutForm({ ...payoutForm, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  required
                  value={payoutForm.settlementBank}
                  onChange={(e) => setPayoutForm({ ...payoutForm, settlementBank: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300"
                  disabled={loadingBanks}
                >
                  <option value="">Select bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Account number"
                  required
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Account name"
                  value={payoutForm.accountName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Primary phone"
                  value={payoutForm.primaryContactPhone}
                  onChange={(e) => setPayoutForm({ ...payoutForm, primaryContactPhone: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Split %"
                  value={payoutForm.percentageCharge}
                  onChange={(e) => setPayoutForm({ ...payoutForm, percentageCharge: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={payoutForm.description}
                  onChange={(e) => setPayoutForm({ ...payoutForm, description: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayouts || loadingBanks}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  {submittingPayouts ? 'Saving...' : 'Save Payout Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;