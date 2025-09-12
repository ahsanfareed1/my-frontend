
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// backend se providers lane k liye
import './ServiceProviders.css';
import BusinessAvatar from '../components/BusinessAvatar';

const ServiceProviders = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceTitle, setServiceTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // search term ya providers change hon to filtered list update krne k liye
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(provider =>
        provider.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  }, [searchTerm, providers]);

  // providers load hone pe initial filtered set krne k liye
  useEffect(() => {
    setFilteredProviders(providers);
  }, [providers]);

  // id se service title nikalne k liye
  const getServiceTitle = (id) => {
    const serviceTitles = {
      1: "Plumbing Services",
      2: "Electrical Work",
      3: "Food Catering",
      4: "Home Cleaning",
      5: "Transport Services",
      6: "Home Maintenance",
      7: "Gardening & Lawn",
      8: "Pest Control",
      9: "Locksmith Services",
      10: "Moving & Storage",
      11: "Food Delivery",
      12: "Personal Training"
    };
    return serviceTitles[id] || 'Service Providers';
  };

  // serviceId change pe title set krne k liye
  useEffect(() => {
    setServiceTitle(getServiceTitle(parseInt(serviceId)));
  }, [serviceId]);

  // backend se providers lana
  useEffect(() => {
    const controller = new AbortController();
    const fetchProviders = async () => {
      try {
        setLoading(true);
        // serviceId ko businessType me map krne k liye
        const serviceIdToType = {
          1: 'plumbing',
          2: 'electrical',
          3: 'food',
          4: 'cleaning',
          5: 'transport',
          6: 'maintenance',
          7: 'gardening',
          8: 'pest',
          9: 'security', // locksmith close to security
          10: 'transport',
          11: 'food',
          12: 'health'
        };
        const businessType = serviceIdToType[parseInt(serviceId)] || '';
        const params = new URLSearchParams({ status: 'active', limit: '100' });
        if (businessType) params.set('businessType', businessType);
        const res = await fetch(`http://localhost:5000/api/business?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to load providers');
        const data = await res.json();
        const apiProviders = (data.businesses || []).map(b => ({
          id: b._id,
          name: b.businessName,
          location: b.location?.city || 'N/A',
          rating: b.rating?.average || 0,
          views: b.rating?.totalReviews || 0,
          experience: b.createdAt ? '' : '',
          profilePicture: b.images?.logo,
          image: b.images?.logo
        }));
        setProviders(apiProviders);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setProviders([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
    return () => controller.abort();
  }, [serviceId, location.state]);

  const handleProviderClick = (provider, e) => {
    // agr button/link pe click ho to navigation na ho
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    // provider profile pe navigate krne k liye
    navigate(`/provider/${serviceId}/${provider.id}`);
  };

  if (loading) {
    return <div className="loading">Loading providers...</div>;
  }

  return (
    <div className="service-providers-container">
      <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            border: '2px solid #3a5bd9',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            minWidth: '160px',
            textAlign: 'center'
          }}
        >
          <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>←</span>
          <span>Back to Services</span>
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '2rem', margin: 0 }}>
          {serviceTitle} Providers
        </h1>
        <div style={{ position: 'relative', minWidth: '300px', flex: '1', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              paddingLeft: '40px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          />
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666'
          }}></i>
        </div>
      </div>
      
      {filteredProviders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}></i>
          <h3>No providers found in "{searchTerm}"</h3>
          <p>Try a different location or check back later for more providers in your area.</p>
        </div>
      ) : (
        <div className="providers-grid">
        {filteredProviders.map((provider) => (
          <div 
            key={provider.id} 
            className="provider-card" 
            onClick={(e) => handleProviderClick(provider, e)}
            style={{ cursor: 'pointer' }}
            tabIndex={0}
            role="button"
            aria-label={`View ${provider.name}'s profile`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProviderClick(provider, e);
              }
            }}
          >
            <div className="provider-image-container">
              <div className="image-container">
                <BusinessAvatar
                  businessName={provider.name}
                  imageUrl={provider.profilePicture || provider.image}
                  size="large"
                  className="profile-image hover-zoom"
                />
              </div>
            </div>
            <div className="provider-info">
              <h3>{provider.name}</h3>
              <div className="provider-stats">
                <span className="rating">
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star ${i < Math.floor(provider.rating) ? 'filled' : ''}`}
                    ></i>
                  ))}
                  {provider.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                  <span className="rating-number">({provider.rating})</span>
                </span>
                <span className="experience">{provider.experience} experience</span>
                <span className="views">({provider.views}) views</span>
              </div>
              <p className="location">
                <i className="fas fa-map-marker-alt"></i> {provider.location}
              </p>
              <p className="description">{provider.description}</p>
              <div className="provider-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button 
                  className="ask-question-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate directly to provider's contact form
                    navigate(`/provider/${serviceId}/${provider.id}?tab=contact`);
                  }}
                  style={{
                    backgroundColor: '#4a6cf7',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.backgroundColor = '#3a5bd9';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.backgroundColor = '#4a6cf7';
                    }
                  }}
                >
                  <i className="fas fa-question-circle"></i>
                  Ask Question
                </button>
                <button 
                  className="view-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/provider/${serviceId}/${provider.id}`);
                  }}
                  style={{
                    backgroundColor: 'white',
                    color: '#4a6cf7',
                    border: '1px solid #4a6cf7',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.backgroundColor = '#f8f9ff';
                      e.currentTarget.style.color = '#3a5bd9';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#4a6cf7';
                    }
                  }}
                >
                  <i className="fas fa-user"></i>
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default ServiceProviders;