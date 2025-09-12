import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaSignOutAlt, FaStore, FaUser } from 'react-icons/fa';
import { IoBusiness } from 'react-icons/io5';
import { MdDashboard } from 'react-icons/md';
import { AuthContext } from '../context/AuthContext';
import './BusinessDropdown.css';

const BusinessDropdown = ({ isAuthenticated, user, onLogout, isMobile = false, closeMobileMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user: authUser, userType } = useContext(AuthContext);
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    const checkBusiness = () => {
      const currentUser = user || authUser;
      if (isAuthenticated && currentUser) {
        // we are Checking if user has a business - validation 
        const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
        const userBusiness = providers.find(p => p.userId === currentUser.id);
        setHasBusiness(!!userBusiness);
      }
    };
    
    checkBusiness();
  }, [isAuthenticated, user, authUser]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleItemClick = (path) => {
    closeDropdown();
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const unlisten = () => {
      if (isMobile && closeMobileMenu) {
        closeMobileMenu();
      }
    };

    const unlistenToNavigation = window.addEventListener('popstate', unlisten);
    return () => {
      window.removeEventListener('popstate', unlisten);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderButton = () => {
    const buttonContent = (
      <>
        <IoBusiness className="business-icon" />
        <span>{isMobile ? 'Business' : 'AAA For Business'}</span>

      </>
    );

    if (isMobile) {
      return (
        <div className="mobile-business-toggle">
          <button 
            className={`business-dropdown-toggle mobile ${isOpen ? 'active' : ''}`}
            onClick={toggleDropdown}
            aria-expanded={isOpen}
            aria-label="Business menu"
          >
            {buttonContent}
          </button>
        </div>
      );
    }

    return (
      <button 
        className={`business-dropdown-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-label="Business menu"
      >
        {buttonContent}
      </button>
    );
  };

  // For mobile dropdown, we always want to show the dropdown content when the button is clicked
  const showDropdown = isMobile ? isOpen : isOpen;

  return (
    <div className={`business-dropdown ${isMobile ? 'mobile' : ''} ${isOpen ? 'active' : ''}`} ref={dropdownRef}>
      {renderButton()}
      
      {showDropdown && (
        <div className={`business-dropdown-menu ${isMobile ? 'mobile' : ''}`}>
          {isAuthenticated ? (
            <>
              {(() => {
                const currentUser = user || authUser;
                const isCustomer = userType === 'customer' || (currentUser && currentUser.userType === 'customer');
                
                if (isCustomer) {
                  return (
                    <Link 
                      to="/service-provider-signup"
                      className="dropdown-item"
                      onClick={closeDropdown}
                    >
                      <IoBusiness className="dropdown-icon" />
                      Register Your Business
                    </Link>
                  );
                } else {
                  return hasBusiness ? (
                    <>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleItemClick('/business/dashboard')}
                      >
                        <MdDashboard className="dropdown-icon" />
                        Business Dashboard
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleItemClick('/business/profile')}
                      >
                        <FaStore className="dropdown-icon" />
                        My Business Profile
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          closeDropdown();
                          if (onLogout) {
                            onLogout();
                          }
                          localStorage.removeItem('currentUser');
                          navigate('/');
                          window.location.reload();
                        }}
                      >
                          <FaSignOutAlt className="dropdown-icon" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/service-provider-signup"
                        className="dropdown-item"
                        onClick={closeDropdown}
                      >
                        <IoBusiness className="dropdown-icon" />
                        Register Your Business
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          closeDropdown();
                          if (onLogout) {
                            onLogout();
                          }
                          localStorage.removeItem('currentUser');
                          navigate('/');
                          window.location.reload();
                        }}
                      >
                          <FaSignOutAlt className="dropdown-icon" />
                        Logout
                      </button>
                    </>
                  );
                }
              })()}
            </>
          ) : (
            <>
              <Link 
                to="/service-provider/login" 
                className="business-dropdown-item"
                onClick={closeDropdown}
              >
                <FaSignInAlt className="dropdown-icon" />
                <span>Business Login</span>
              </Link>
              <div className="dropdown-divider"></div>
              <Link 
                to="/service-provider-signup" 
                className="business-dropdown-item"
                onClick={closeDropdown}
              >
                <IoBusiness className="dropdown-icon" />
                <span>Register Business</span>
              </Link>
              <div className="dropdown-divider"></div>
             
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessDropdown;