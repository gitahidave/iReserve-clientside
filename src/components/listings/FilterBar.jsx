// Filter Bar component for the iReserve application. This component allows users to filter listings based on various criteria such as price, location, and availability.
import React, { useState } from 'react';
import './FilterBar.css';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    priceRange: '',
    location: '',
    availability: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <form className="filter-bar" onSubmit={handleFilterSubmit}>
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={filters.location}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="priceRange"
        placeholder="Price Range"
        value={filters.priceRange}
        onChange={handleInputChange}
      />
      <select
        name="availability"
        value={filters.availability}
        onChange={handleInputChange}
      >
        <option value="">Availability</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>
      <button type="submit">Apply Filters</button>
    </form>
  );
};

export default FilterBar;