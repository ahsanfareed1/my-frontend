import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Services.css';

const API_BASE = 'http://localhost:5000/api';

const categoryOptions = [
  'All Categories', 'plumbing', 'electrical', 'cleaning', 'food', 'construction', 'transport', 'security'
];

const toBusinessType = (label) => {
  const k = (label || '').toLowerCase();
  if (k.includes('plumb')) return 'plumbing';
  if (k.includes('electric')) return 'electrical';
  if (k.includes('clean')) return 'cleaning';
  if (k.includes('food')) return 'food';
  if (k.includes('construct')) return 'construction';
  if (k.includes('transport')) return 'transport';
  if (k.includes('security')) return 'security';
  return '';
};

const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const urlService = searchParams.get('service') || '';
  const urlLocation = searchParams.get('location') || '';
  const urlCategory = searchParams.get('category') || '';
  
  const [locationQuery, setLocationQuery] = useState(urlLocation);
  const [searchTerm, setSearchTerm] = useState(urlService);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All Categories');
  const [sortBy, setSortBy] = useState('rating'); // rating, name, newest, oldest
  const [filterRating, setFilterRating] = useState('all'); // all, 4+, 3+, 2+

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    if (urlService !== searchTerm) setSearchTerm(urlService);
    if (urlLocation !== locationQuery) setLocationQuery(urlLocation);
    if (urlCategory !== selectedCategory && urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlService, urlLocation, urlCategory, searchTerm, locationQuery, selectedCategory]);

  const updateSearchParams = useCallback((service, location, category) => {
    const p = new URLSearchParams();
    if (service) p.set('service', service);
    if (location) p.set('location', location);
    if (category && category !== 'All Categories') p.set('category', category);
    setSearchParams(p);
  }, [setSearchParams]);

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All Categories') {
      updateSearchParams(searchTerm, locationQuery, selectedCategory);
    }
  }, [selectedCategory, searchTerm, locationQuery, updateSearchParams]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchParams(value, locationQuery, selectedCategory);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    updateSearchParams(searchTerm, value, selectedCategory);
  };

  // Sort and filter businesses
  const sortedAndFilteredBusinesses = useMemo(() => {
    let filtered = [...businesses];
    
    // Filter by rating
    if (filterRating !== 'all') {
      const minRating = parseInt(filterRating);
      filtered = filtered.filter(business => business.rating >= minRating);
    }
    
    // Sort businesses
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [businesses, sortBy, filterRating]);

  // Fetch businesses
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        params.set('status', 'active');
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        if (locationQuery.trim()) params.set('city', locationQuery.trim());
        const bt = toBusinessType(selectedCategory);
        if (bt) params.set('businessType', bt);
        params.set('limit', '50');
        console.log('🔍 Frontend: Fetching from:', `${API_BASE}/business?${params.toString()}`);
        const res = await fetch(`${API_BASE}/business?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        console.log('🔍 Frontend: API Response:', data);
        if (!res.ok) throw new Error(data.message || 'Failed to load services');
        console.log('🔍 Frontend: Raw businesses from API:', data.businesses);
        const items = (data.businesses || []).map(b => ({
          id: b._id,
          name: b.businessName,
          city: b.location?.city,
          address: b.location?.address,
          image: b.images?.logo || b.images?.cover,
          description: b.description,
          rating: b.rating?.average || 0,
          totalReviews: b.rating?.totalReviews || 0,
          type: b.businessType,
          phone: b.contact?.phone,
          email: b.contact?.email
        }));
        console.log('🔍 Frontend: Processed businesses for display:', items);
        console.log('🔍 Frontend: Number of businesses to display:', items.length);
        setBusinesses(items);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [searchTerm, locationQuery, selectedCategory]);

  const resultsTitle = useMemo(() => {
    const parts = [];
    if (selectedCategory && selectedCategory !== 'All Categories') parts.push(selectedCategory);
    if (locationQuery.trim()) parts.push(`in ${locationQuery.trim()}`);
    if (searchTerm.trim()) parts.push(`matching "${searchTerm.trim()}"`);
    return parts.length ? parts.join(' ') : 'All Services';
  }, [searchTerm, locationQuery, selectedCategory]);

  // Function to get display name for category
  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'cleaning': 'Cleaning',
      'food': 'Food',
      'construction': 'Construction',
      'transport': 'Transport',
      'security': 'Security',
      'view-all': 'All'
    };
    return categoryNames[category] || category;
  };

  // Handle category filtering
  const handleCategoryFilter = (category) => {
    if (category === 'view-all') {
      setSelectedCategory('All Categories');
      updateSearchParams(searchTerm, locationQuery, '');
    } else {
      setSelectedCategory(category);
      updateSearchParams(searchTerm, locationQuery, category);
    }
  };

  return (
    <div className="services-page">
      <div className="services-hero">
        <h1>Our Services</h1>
        <p>Discover our comprehensive range of professional services</p>
      </div>

      {/* Trust Banner */}
      <div className="trust-banner">
        <div className="trust-banner-content">
          <div className="trust-banner-left">
            <h2>Trusted by Thousands of Customers</h2>
            <p>Join thousands of satisfied customers who have found reliable, professional services through our platform. We connect you with verified, experienced professionals who deliver quality results.</p>
            <div className="trust-stats">
              <div className="trust-stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Verified Providers</div>
              </div>
              <div className="trust-stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="trust-stat">
                <div className="stat-number">4.8★</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
          <div className="trust-banner-right">
            <div className="trust-features">
              <div className="trust-feature">
                <div className="feature-icon">✓</div>
                <span>Verified & Background Checked</span>
              </div>
              <div className="trust-feature">
                <div className="feature-icon">✓</div>
                <span>Quality Guaranteed</span>
              </div>
              <div className="trust-feature">
                <div className="feature-icon">✓</div>
                <span>24/7 Customer Support</span>
              </div>
              <div className="trust-feature">
                <div className="feature-icon">✓</div>
                <span>Secure & Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="services-filters">
        <h1>Find Your Perfect Service</h1>
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="service">Service</label>
            <input
              id="service"
              type="text"
              className="filter-input"
              placeholder="Search services by keywords..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <i className="fas fa-search filter-icon"></i>
          </div>
          
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              className="filter-input"
              placeholder="Search by location..."
              value={locationQuery}
              onChange={handleLocationChange}
            />
            <i className="fas fa-map-marker-alt filter-icon"></i>
          </div>
          
          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category"
              className="category-select"
              value={selectedCategory}
              onChange={(e) => { 
                const v = e.target.value; 
                handleCategoryFilter(v); 
              }}
            >
              <option value="All Categories">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="food">Food</option>
              <option value="construction">Construction</option>
              <option value="transport">Transport</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding the best services for you...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
        </div>
      ) : sortedAndFilteredBusinesses.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
          <h3>No services found {resultsTitle ? `for ${resultsTitle}` : ''}</h3>
          <p>Try different keywords or broaden your location search.</p>
        </div>
      ) : (
        <>
          {/* Sort and Filter Controls */}
          <div className="sort-filter-controls">
            <div className="sort-controls">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="rating">Highest Rating</option>
                <option value="name">Alphabetically</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            <div className="filter-controls">
              <label htmlFor="filterRating">Minimum Rating:</label>
              <select
                id="filterRating"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>

          <div className="results-section">
            <div className="results-title">
              {selectedCategory !== 'All Categories' ? getCategoryDisplayName(selectedCategory) : 'All'} Services
            </div>
            <div className="results-count">
              {sortedAndFilteredBusinesses.length} service{sortedAndFilteredBusinesses.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'All Categories' && ` in ${getCategoryDisplayName(selectedCategory)}`}
            </div>
          </div>
          
          <div className="providers-grid">
            {sortedAndFilteredBusinesses.map((p) => (
              <div key={p.id} className="provider-card" onClick={() => navigate(`/business/${p.id}`)}>
                <div className="provider-card-header">
                  <div className="provider-avatar">
                    <div className="avatar-container">
                      {p.image ? (
                        <img 
                          className="provider-image" 
                          src={p.image} 
                          alt={p.name} 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'; 
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }} 
                        />
                      ) : null}
                      <span className="avatar-initials" style={{ display: p.image ? 'none' : 'flex' }}>
                        {p.name?.[0]?.toUpperCase() || 'B'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="provider-info">
                    <h3 className="provider-name" title={p.name}>{p.name}</h3>
                    <span className="provider-title">{p.type}</span>
                    <p className="provider-location">
                      <i className="fas fa-map-marker-alt"></i>
                      <span className="location-text">{p.address || p.city}</span>
                    </p>
                  </div>
                </div>
                
                <div className="provider-description">
                  {p.description?.slice(0, 140)}{p.description?.length > 140 ? '...' : ''}
                </div>
                
                <div className="rating-section">
                  <div className="rating-container">
                    <div className="rating-badge">
                      {p.rating ? p.rating.toFixed(1) : 'N/A'}
                    </div>
                    <div>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(s => (
                          <i key={s} className={`fas fa-star${s <= Math.round(p.rating || 0) ? ' filled' : '-o'}`}></i>
                        ))}
                      </div>
                      <div className="rating-count">
                        {p.totalReviews ? `${p.totalReviews} review${p.totalReviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  {p.phone && (
                    <a 
                      className="action-button secondary-button" 
                      href={`tel:${p.phone}`} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-phone"></i> Call Now
                    </a>
                  )}
                  <button 
                    className="action-button primary-button" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      navigate(`/business/${p.id}`);
                    }}
                  >
                    <i className="fas fa-user"></i> View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Services;

