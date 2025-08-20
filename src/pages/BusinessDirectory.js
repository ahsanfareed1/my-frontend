import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const BusinessCard = ({ business, onOpen }) => {
  const primaryService = business.services?.[0]?.name || business.businessType;
  return (
    <div className="provider-card" onClick={() => onOpen(business._id)}>
      <div className="provider-card-content">
        <div className="provider-card-header">
          <div className="provider-avatar">
            <div className="avatar-container">
              {business.images?.logo ? (
                <img className="provider-image" src={business.images.logo} alt={business.businessName} />
              ) : null}
              {!business.images?.logo && (
                <span className="avatar-initials">{business.businessName?.charAt(0)?.toUpperCase() || 'B'}</span>
              )}
            </div>
          </div>
          <div className="provider-info">
            <h3 className="provider-name" title={business.businessName}>{business.businessName}</h3>
            <p className="provider-title">{primaryService}</p>
            <p className="provider-location">
              <i className="fas fa-map-marker-alt"></i>
              <span className="location-text">{business.location?.city}</span>
            </p>
          </div>
        </div>
        <div className="provider-description">
          {business.description?.slice(0, 140) || 'No description provided.'}
        </div>
        <div className="action-buttons">
          <button className="action-button primary-button" onClick={(e) => { e.stopPropagation(); onOpen(business._id); }}>
            <i className="fas fa-user"></i>
            View Profile
          </button>
          <button className="action-button secondary-button" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${business.contact?.email}`; }}>
            <i className="fas fa-envelope"></i>
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

const BusinessDirectory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businesses, setBusinesses] = useState([]);

  const city = searchParams.get('city') || '';
  const type = searchParams.get('type') || '';
  const search = searchParams.get('q') || '';

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.set('status', 'active');
      if (city) params.set('city', city);
      if (type) params.set('businessType', type);
      if (search) params.set('search', search);
      params.set('limit', '24');

      const res = await fetch(`${API_BASE}/business?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load businesses');
      setBusinesses(data.businesses || []);
    } catch (err) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); /* eslint-disable-next-line */ }, [city, type, search]);

  const onOpenProfile = (id) => navigate(`/business/${id}`);

  return (
    <div className="services-page">
      <div className="services-hero">
        <h1>Find a Business</h1>
        <p>Browse verified businesses and service providers</p>
      </div>

      <div className="services-filters" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (e.target.value) p.set('q', e.target.value); else p.delete('q'); return p; })}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', minWidth: 260 }}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (e.target.value) p.set('city', e.target.value); else p.delete('city'); return p; })}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', minWidth: 180 }}
        />
        <select
          value={type}
          onChange={(e) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (e.target.value) p.set('type', e.target.value); else p.delete('type'); return p; })}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}
        >
          <option value="">All Types</option>
          {['plumbing','electrical','cleaning','painting','gardening','repair','transport','security','education','food','beauty','health','construction','maintenance','other'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message" style={{ maxWidth: 960, margin: '0 auto 16px' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading businesses...</div>
      ) : (
        <div className="providers-grid">
          {businesses.map(b => (
            <BusinessCard key={b._id} business={b} onOpen={onOpenProfile} />
          ))}
          {businesses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>No businesses found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessDirectory;


