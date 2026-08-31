import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getListings,
  createListing,
  updateListing,
  deleteListing,
  uploadListingImages,
} from '../../services/listingService';
import { getSupportedBanks, setupHostPayouts } from '../../services/hostService';
import { downloadBookingsCsv } from '../../services/bookingService';
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
  const [exportingCsv, setExportingCsv] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingListingId, setEditingListingId] = useState(null);
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

  useEffect(() => {
    if (payoutForm.settlementBank === 'test-bank' && !payoutForm.accountNumber) {
      setPayoutForm((prev) => ({ ...prev, accountNumber: '0000000000' }));
    }
  }, [payoutForm.settlementBank, payoutForm.accountNumber]);

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

  const resetListingForm = () => {
    setUploadedImages([]);
    setEditingListingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Boardroom',
      hourlyRate: '',
      address: '',
      city: 'Nairobi',
      amenities: '',
    });
  };

  const openCreateListingModal = () => {
    resetListingForm();
    setShowModal(true);
  };

  const openEditListingModal = (listing) => {
    setEditingListingId(listing._id);
    setUploadedImages(listing.images || []);
    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      category: listing.category || 'Boardroom',
      hourlyRate: listing.hourlyRate || '',
      address: listing.location?.address || '',
      city: listing.location?.city || 'Nairobi',
      amenities: Array.isArray(listing.amenities) ? listing.amenities.join(', ') : '',
    });
    setShowModal(true);
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workspace listing?')) {
      return;
    }

    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete listing.';
      alert(message);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const formDataToUpload = new FormData();
    files.forEach((file) => formDataToUpload.append('images', file));

    try {
      setUploadingImages(true);
      const result = await uploadListingImages(formDataToUpload);
      setUploadedImages((prev) => [...prev, ...result.images]);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to upload listing images.';
      alert(message);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
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
        images: uploadedImages,
      };

      if (editingListingId) {
        await updateListing(editingListingId, formattedData);
      } else {
        await createListing(formattedData);
      }

      setShowModal(false);
      resetListingForm();
      fetchHostListings();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to save workspace listing.';
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
      });

      alert('Payout setup completed successfully.');
      setShowPayoutModal(false);
      setPayoutForm({
        businessName: '',
        settlementBank: '',
        accountNumber: '',
        accountName: '',
        primaryContactPhone: '',
        description: '',
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to save payout setup.';
      alert(message);
    } finally {
      setSubmittingPayouts(false);
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

  if (loading) return <LoadingSpinner fullScreen />;

  const hasPayoutSetup = Boolean(user?.paystackSubaccountCode);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner Container: White in light mode, dark slate in dark mode */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors duration-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Host Dashboard
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border ${
                  hasPayoutSetup
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasPayoutSetup ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'
                  }`}
                />
                {hasPayoutSetup ? 'Payout setup' : 'Payout not setup'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
              Manage active listings, review workspace activity, and keep settlement accounts configured.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportingCsv}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {exportingCsv ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md transition"
            >
              Set Up Payouts
            </button>
            <button
              onClick={openCreateListingModal}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-md transition"
            >
              + Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Main Properties Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-600 dark:text-white tracking-tight">
            Your Properties <span className="text-blue-500 dark:text-slate-400 text-sm ml-2 font-medium">({listings.length})</span>
          </h2>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 text-base font-medium mb-4">No workspace properties listed yet.</p>
            <button
              onClick={openCreateListingModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition shadow-md"
            >
              Create First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              /* Property Card: bg-white in Light mode, bg-slate-900 in Dark mode */
              <div
                key={item._id}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                {/* Image Banner */}
                {item.images && item.images.length > 0 ? (
                  <div className="h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                      {item.category}
                    </div>
                  </div>
                ) : (
                  <div className="h-28 w-full bg-slate-100 dark:bg-slate-800 p-4 relative flex items-start">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                      {item.category}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hourly Rate</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.hourlyRate)}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/hr</span>
                    </span>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => openEditListingModal(item)}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteListing(item._id)}
                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-semibold py-2.5 rounded-xl transition active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl shadow-2xl transition-colors">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingListingId ? 'Edit Workspace Listing' : 'Add Workspace Listing'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetListingForm();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
              />
              <textarea
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white h-24 focus:outline-none focus:border-blue-500 transition"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition"
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
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Street / Address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <input
                type="text"
                placeholder="Amenities (comma separated: WiFi, Projector)"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
              />

              <div className="space-y-2 pt-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Listing photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 dark:file:bg-blue-600/20 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-600/30 file:font-semibold file:text-sm file:transition cursor-pointer"
                />
                {uploadingImages && <p className="text-xs text-blue-600 dark:text-blue-400">Uploading images...</p>}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`Listing preview ${index + 1}`}
                        className="h-20 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetListingForm();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md"
                >
                  {editingListingId ? 'Update Listing' : 'Save Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl shadow-2xl transition-colors">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set Up Host Payouts</h2>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Business name"
                required
                value={payoutForm.businessName}
                onChange={(e) => setPayoutForm({ ...payoutForm, businessName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  required
                  value={payoutForm.settlementBank}
                  onChange={(e) => {
                    const selectedBank = e.target.value;
                    setPayoutForm((prev) => ({
                      ...prev,
                      settlementBank: selectedBank,
                      accountNumber:
                        selectedBank === 'test-bank' && !prev.accountNumber ? '0000000000' : prev.accountNumber,
                    }));
                  }}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition"
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={payoutForm.settlementBank === 'test-bank' ? 'Account number (e.g. 0000000000)' : 'Account number'}
                  required
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Account name"
                  value={payoutForm.accountName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="tel"
                  placeholder="Primary phone"
                  value={payoutForm.primaryContactPhone}
                  onChange={(e) => setPayoutForm({ ...payoutForm, primaryContactPhone: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <input
                type="text"
                placeholder="Description (optional)"
                value={payoutForm.description}
                onChange={(e) => setPayoutForm({ ...payoutForm, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayouts || loadingBanks}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md"
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