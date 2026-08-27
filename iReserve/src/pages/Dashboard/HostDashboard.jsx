import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getListings, createListing } from '../../services/listingService';
import { formatCurrency } from '../../utils/formatCurrency';

const HostDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Boardroom',
    hourlyRate: '',
    amenities: '',
  });

  useEffect(() => {
    fetchHostListings();
  }, []);

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
        amenities: formData.amenities.split(',').map((a) => a.trim()),
      };
      await createListing(formattedData);
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'Boardroom', hourlyRate: '', amenities: '' });
      fetchHostListings();
    } catch (err) {
      alert('Failed to create workspace listing.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your workspaces and incoming split payouts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2.5 rounded-xl text-sm transition"
        >
          + Add New Property
        </button>
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
    </div>
  );
};

export default HostDashboard;