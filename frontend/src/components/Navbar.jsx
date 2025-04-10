// File: src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem("token") !== null;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Close mobile menu when route changes
    setMenuOpen(false);
    
    // Get user data from localStorage if logged in
    if (isLoggedIn) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          setUserData(JSON.parse(userStr));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [location.pathname, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserData(null);
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <h1>Vocab<span>Venture</span></h1>
      </Link>
      
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {isLoggedIn ? (
          <>
            <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
              My Quest{userData?.username ? ` (${userData.username})` : ''}
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Exit Adventure
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
              Begin Quest
            </Link>
            <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>
              Join Adventure
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
