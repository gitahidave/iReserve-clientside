// Navbar component
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">iReserve</Link>
      </div>
    </nav>
  );
};

export default Navbar;