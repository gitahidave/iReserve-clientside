import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getListings } from '../services/listingService';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchListings();
  }, [category]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await getListings({ category, search });
      setListings(data);
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Workspaces</h1>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
        >
          <option value="">All Categories</option>
          <option value="Boardroom">Boardroom</option>
          <option value="Private Office">Private Office</option>
          <option value="Event Space">Event Space</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl py-3 text-sm transition"
        >
          Filter Results
        </button>
      </form>

      {/* Listings Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No workspace listings found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition">
              <img
                src={item.images?.[0] || 'https://via.placeholder.com/400x250'}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{item.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <span className="text-lg font-bold text-white">
                    KES {item.hourlyRate} <span className="text-xs text-slate-400 font-normal">/ hr</span>
                  </span>
                  <Link
                    to={`/listings/${item._id}`}
                    className="bg-slate-800 hover:bg-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    View Space
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsPage;