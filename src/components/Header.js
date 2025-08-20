import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import BusinessDropdown from './BusinessDropdown';
import './Header.css';
import './BusinessDropdown.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [location, setLocation] = useState('');
  const mobileNavRef = useRef(null);
  const profileRef = useRef(null);
  const overlayRef = useRef(null);
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const isBusiness = user?.userType === 'business';
  const navigate = useNavigate();

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  const location_route = useLocation();
  useEffect(() => {
    closeMobileMenu();
  }, [location_route, closeMobileMenu]);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    const success = logout();
    setShowProfileDropdown(false);
    closeMobileMenu();
    
    if (success) {
      navigate('/', { replace: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (serviceName.trim() || location.trim()) {
      const searchParams = new URLSearchParams();
      if (serviceName.trim()) searchParams.append('service', serviceName.trim());
      if (location.trim()) searchParams.append('location', location.trim());
      
      navigate(`/services?${searchParams.toString()}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && !event.target.closest('.hamburger-btn')) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMobileMenu]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <header className="header">
      {/* Main Header */}
      <div className="main-header">
        <div className="header-container">
          {/* Logo on the left */}
          <div className="logo-container">
            <Link to="/" className="logo-link" onClick={closeMobileMenu}>
              <img 
                src={process.env.PUBLIC_URL + '/favicon_transbg.png'} 
                alt="AAA Logo" 
                className="logo-img" 
                loading="eager"
              />
            </Link>
          </div>

          {/* Search Bar in center */}
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-inputs">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="search-input-wrapper">
                  <FaMapMarkerAlt className="search-icon" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <button type="submit" className="search-button">
                  <FaSearch className="search-btn-icon" />
                </button>
              </div>
            </form>
          </div>

          {/* Right side - user actions */}
          <div className="header-right">
            <div className="desktop-actions">
              <BusinessDropdown 
                isAuthenticated={isAuthenticated} 
                user={user} 
                onLogout={handleLogout}
                isMobile={false}
              />
              {isAuthenticated && isBusiness && (
                <Link to="/business/dashboard" className="action-link">Dashboard</Link>
              )}
              <Link to="/reviews" className="action-link">Write a Review</Link>
              <Link to="/complaint" className="action-link">File a Complaint</Link>
            </div>
            
            {isAuthenticated ? (
              <div className="profile-container" ref={profileRef}>
                <button 
                  className="profile-btn" 
                  onClick={toggleProfileDropdown}
                  aria-expanded={showProfileDropdown}
                  aria-label="Profile menu"
                >
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="profile-pic"
                    />
                  ) : (
                    <FaUserCircle className="profile-icon" />
                  )}
                  <span className="profile-name">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'My Profile'}
                  </span>
                </button>
                
                {showProfileDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-item" 
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaUserCircle /> My Profile
                    </Link>
                    <button 
                      className="dropdown-item" 
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">Log In</Link>
                <Link to="/signup" className="signup-btn">Sign Up</Link>
              </div>
            )}
            
            <div className="hamburger-menu">
              <button
                className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile navigation"
              >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="category-nav">
        <div className="category-container">
          <div className="category-links">
            <Link to="/services?category=plumbing" className="category-link">Plumbing</Link>
            <Link to="/services?category=electrical" className="category-link">Electrical</Link>
            <Link to="/services?category=cleaning" className="category-link">Cleaning</Link>
            <Link to="/services?category=food" className="category-link">Food</Link>
            <Link to="/services?category=construction" className="category-link">Construction</Link>
            <Link to="/services?category=transport" className="category-link">Transport</Link>
            <Link to="/services?category=security" className="category-link">Security</Link>
            <Link to="/services?category=view-all" className="category-link">View All</Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`} ref={mobileNavRef}>
        <div className="mobile-menu">
          <div className="mobile-nav-header">
            <div className="logo-container">
              <Link to="/" className="logo-link" onClick={closeMobileMenu}>
                <img src={`${process.env.PUBLIC_URL}/favicon_transbg.png`} alt="AAA Logo" className="logo-img" />
              </Link>
            </div>
            <button className="close-btn" onClick={closeMobileMenu}>
              ×
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="mobile-search-section">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <div className="mobile-search-inputs">
                <div className="mobile-search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="mobile-search-input"
                  />
                </div>
                
                <div className="mobile-search-input-wrapper">
                  <FaMapMarkerAlt className="search-icon" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mobile-search-input"
                  />
                </div>
                
                <button type="submit" className="mobile-search-button">
                  <FaSearch className="search-btn-icon" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="mobile-nav-links">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link to="/services?category=plumbing" className="nav-link" onClick={closeMobileMenu}>Plumbing</Link>
            <Link to="/services?category=electrical" className="nav-link" onClick={closeMobileMenu}>Electrical</Link>
            <Link to="/services?category=cleaning" className="nav-link" onClick={closeMobileMenu}>Cleaning</Link>
            <Link to="/services?category=food" className="nav-link" onClick={closeMobileMenu}>Food</Link>
            <Link to="/services?category=construction" className="nav-link" onClick={closeMobileMenu}>Construction</Link>
            <Link to="/services?category=transport" className="nav-link" onClick={closeMobileMenu}>Transport</Link>
            <Link to="/services?category=security" className="nav-link" onClick={closeMobileMenu}>Security</Link>
            <Link to="/services" className="nav-link" onClick={closeMobileMenu}>View All</Link>
            
            {isAuthenticated && isBusiness && (
              <Link to="/business/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
            )}
            
            <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About Us</Link>
            <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
            <Link to="/reviews" className="nav-link" onClick={closeMobileMenu}>Write a Review</Link>
            <Link to="/complaint" className="nav-link" onClick={closeMobileMenu}>File a Complaint</Link>
            
            <BusinessDropdown 
              isAuthenticated={isAuthenticated} 
              user={user} 
              onLogout={handleLogout}
              isMobile={true}
              closeMobileMenu={closeMobileMenu}
            />
            
            {isAuthenticated ? (
              <div className="profile-mobile-options">
                <div className="mobile-user-info">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="mobile-profile-pic"
                    />
                  ) : (
                    <FaUserCircle className="mobile-profile-icon" />
                  )}
                  <span className="mobile-user-name">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'My Profile'}
                  </span>
                </div>
                <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>
                  <FaUserCircle className="mobile-nav-icon" /> My Profile
                </Link>
                <button onClick={handleLogout} className="nav-link">
                  <FaSignOutAlt className="mobile-nav-icon" /> Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="nav-link" onClick={closeMobileMenu}>Log In</Link>
                <Link to="/signup" className="nav-link" onClick={closeMobileMenu}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />
    </header>
  );
};

export default Header;
