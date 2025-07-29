import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="site-header">
      <div className="logo-title">
        <img src="/images/logo.png" alt="Azhar Foundation Logo" className="logo" />
        <div className="text">
          <h1>Azhar Foundation School</h1>
          <p className="motto">The Foundation builders</p>
        </div>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
};

export default Header;
