// Listing Card component
import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ listing }) => {
  return (
    <div className="listing-card">
      <img src={listing.image} alt={listing.title} className="listing-image" />
      <div className="listing-details">
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
        <p className="listing-price">${listing.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ListingCard;