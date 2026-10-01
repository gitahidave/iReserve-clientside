import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getListingById } from '../services/listingService';
import { useAuth } from '../context/AuthContext';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        console.error("Failed to load venue details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleBooking = () => {
    if (!user) {
      return navigate('/login');
    }
    // Proceed to booking confirmation
    navigate(`/checkout`, { state: { listingId: id, startTime, endTime } });
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!listing) return <div className="text-center py-20">Listing not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <img
            src={listing.images?.[0] || 'https://via.placeholder.com/800x400'}
            alt={listing.title}
            className="w-full h-64 sm:h-96 object-cover rounded-2xl border border-slate-800"
          />
          <div>
            <span className="text-sm font-semibold text-blue-400 uppercase">{listing.category}</span>
            <h1 className="text-3xl font-extrabold mt-1 mb-3">{listing.title}</h1>
            <p className="text-slate-400 leading-relaxed">{listing.description}</p>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities?.map((amenity, idx) => (
                <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl h-fit lg:sticky lg:top-24">
          <div className="flex flex-wrap justify-between items-baseline gap-2 mb-6">
            <span className="text-2xl font-bold">KES {listing.hourlyRate}</span>
            <span className="text-sm text-slate-400">per hour</span>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={!startTime || !endTime}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 font-semibold py-3 rounded-xl transition"
          >
            Reserve Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;