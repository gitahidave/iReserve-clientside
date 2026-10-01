// Listing Grid component
import React from 'react';
import ListingCard from './ListingCard';
import './ListingGrid.css';

const ListingGrid = ({ listings }) => {
  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingGrid;