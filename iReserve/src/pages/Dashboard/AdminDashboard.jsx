import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getListings, deleteListing } from '../../services/listingService';

const AdminDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const data = await getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load system data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workspace listing?')) {
      try {
        await deleteListing(id);
        setListings(listings.filter((item) => item._id !== id));
      } catch (err) {
        alert('Failed to delete listing.');
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">System overview and workspace governance.</p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 font-bold text-lg">Active System Listings</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Hourly Rate</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {listings.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/50 transition">
                  <td className="py-4 px-6 font-medium text-white">{item.title}</td>
                  <td className="py-4 px-6 text-slate-300">{item.category}</td>
                  <td className="py-4 px-6 text-slate-300">KES {item.hourlyRate}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;