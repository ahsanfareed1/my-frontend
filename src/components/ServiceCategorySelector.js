import React, { useState, useEffect, useRef } from 'react';
import './ServiceCategorySelector.css';

const ServiceCategorySelector = ({
  selectedCategory,
  onCategorySelect,
  placeholder = 'Select a service category',
  className = '',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';

  // api se categories lana
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${API_BASE}/service-categories`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        let apiCategories = [];
        if (data.categories && Array.isArray(data.categories)) {
          apiCategories = data.categories;
        } else if (Array.isArray(data)) {
          apiCategories = data;
        } else {
          throw new Error('Invalid data format received');
        }
        
        // api categories ko fallback k sath merge 
        const essentialCategories = [
          { _id: 'security-fallback', name: 'Security', slug: 'security', description: 'Security and protection services' },
          { _id: 'other-services-fallback', name: 'Other Services', slug: 'other-services', description: 'Custom services not listed above' }
        ];
        
        // security/other services already hon to dobara add nahi krna
        const hasSecurity = apiCategories.some(cat => 
          cat.name.toLowerCase().includes('security') || cat.slug === 'security'
        );
        const hasOtherServices = apiCategories.some(cat => 
          cat.name.toLowerCase().includes('other') || cat.slug === 'other-services'
        );
        
        // missing essential categories add krdo
        let finalCategories = [...apiCategories];
        if (!hasSecurity) {
          finalCategories.push(essentialCategories[0]);
        }
        if (!hasOtherServices) {
          finalCategories.push(essentialCategories[1]);
        }
        
        setCategories(finalCategories);
      } catch (err) {
        if (err.message.includes('Failed to fetch')) {
          setError('Cannot connect to server. Please check if the backend is running.');
        } else {
          setError(`Failed to load categories: ${err.message}`);
        }
        // agr api fail ho jaye to static categories use krna
        setCategories(getFallbackCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // api fail ho to fallback categories
  const getFallbackCategories = () => [
    { id: 1, name: 'Security', slug: 'security' },
    { id: 2, name: 'Security Services', slug: 'security-services' },
    { id: 3, name: 'Plumbing Services', slug: 'plumbing-services' },
    { id: 4, name: 'Electrical Services', slug: 'electrical-services' },
    { id: 5, name: 'Home Cleaning', slug: 'home-cleaning' },
    { id: 6, name: 'Home Painting', slug: 'home-painting' },
    { id: 7, name: 'Home Repair & Maintenance', slug: 'home-repair-maintenance' },
    { id: 8, name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
    { id: 9, name: 'Food Catering', slug: 'food-catering' },
    { id: 10, name: 'Food Delivery', slug: 'food-delivery' },
    { id: 11, name: 'Construction Services', slug: 'construction-services' },
    { id: 12, name: 'Transport Services', slug: 'transport-services' },
    { id: 13, name: 'Health & Medical', slug: 'health-medical' },
    { id: 14, name: 'Education & Training', slug: 'education-training' },
    { id: 15, name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    { id: 16, name: 'IT & Technology', slug: 'it-technology' },
    { id: 17, name: 'Business Services', slug: 'business-services' },
    { id: 18, name: 'Automotive Services', slug: 'automotive-services' },
    { id: 19, name: 'Pet Services', slug: 'pet-services' },
    { id: 20, name: 'Pest Control', slug: 'pest-control' },
    { id: 21, name: 'Other Services', slug: 'other-services' }
  ];

  // search term se categories filter krna
  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase().trim();
    const nameLower = category.name.toLowerCase();
    const slugLower = category.slug?.toLowerCase() || '';
    
    return nameLower.includes(searchLower) ||
           slugLower.includes(searchLower) ||
           category.description?.toLowerCase().includes(searchLower) ||
           category.tags?.some(tag => tag.toLowerCase().includes(searchLower));
  });

  // agr results na milen to "Other Services" dikhana
  const shouldShowOtherServices = searchTerm && filteredCategories.length === 0;
  const finalCategories = shouldShowOtherServices 
    ? categories.filter(cat => cat.name === 'Other Services' || cat.slug === 'other-services')
    : filteredCategories;

  // category select krne k liye
  const handleCategorySelect = (category) => {
    onCategorySelect(category);
    setIsOpen(false);
    setSearchTerm('');
  };



  // bahir click pe dropdown band krna
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // dropdown open pe search input focus krna
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // selected category ka display name
  const getSelectedDisplayName = () => {
    if (!selectedCategory) return '';
    return typeof selectedCategory === 'string' ? selectedCategory : selectedCategory.name;
  };

  return (
    <div className={`service-category-selector ${className}`} ref={dropdownRef}>
      <div className="selector-header">
        <label className="selector-label">
          Service Category {required && <span className="required">*</span>}
        </label>
        
        <div 
          className={`selector-input ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="selected-value">
            {getSelectedDisplayName() || placeholder}
          </span>
          <i className={`fas fa-chevron-down ${isOpen ? 'up' : ''}`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {/* Search Bar */}
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>

          {/* Categories List */}
          <div className="categories-list">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading categories...</span>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            ) : finalCategories.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <span>No categories found</span>
                {searchTerm && (
                  <p className="no-results-hint">
                    No categories match "{searchTerm}". Try selecting "Other Services" and describe your specific service below.
                  </p>
                )}
              </div>
            ) : (
              finalCategories.map(category => (
                <div
                  key={category._id || category.id}
                  className={`category-option ${selectedCategory && 
                    (typeof selectedCategory === 'string' ? 
                      selectedCategory === category.name : 
                      selectedCategory._id === category._id || selectedCategory.id === category.id)
                    ? 'selected' : ''
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-info">
                    <i className={`${category.icon || 'fas fa-cog'} category-icon`}></i>
                    <div className="category-details">
                      <span className="category-name">{category.name}</span>
                      {category.description && (
                        <span className="category-description">{category.description}</span>
                      )}
                    </div>
                  </div>
                  <span className="business-count">
                    {category.businessCount || 0} businesses
                  </span>
                </div>
              ))
            )}
          </div>

          
        </div>
      )}
    </div>
  );
};

export default ServiceCategorySelector;
