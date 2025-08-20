import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar } from 'react-icons/fa';
import serviceProviders from '../data/serviceProviders';
import './ComplaintForm.css';

const serviceCategories = {
  1: 'Plumbing Services',
  2: 'Electrical Work',
  3: 'Food Catering',
  4: 'Home Painting',
  5: 'Transport Services',
  6: 'Home Cleaning',
  7: 'Gardening & Lawn',
  8: 'Home Repair',
  9: 'Locksmith Services',
  10: 'Online Courses',
  11: 'Food Delivery'
};

const ComplaintForm = ({ serviceProviderId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'service_issue',
    priority: 'medium',
    serviceProvider: serviceProviderId || '',
    serviceProviderName: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [serviceProvidersData, setServiceProvidersData] = useState({});
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProviderList, setShowProviderList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set service providers from imported data
  useEffect(() => {
    try {
      console.log('Initial service providers data:', serviceProviders);
      
      // The imported serviceProviders is already in the correct format
      // Just ensure all IDs are strings for consistency
      const formattedProviders = {};
      
      Object.entries(serviceProviders).forEach(([categoryId, providers]) => {
        // Keep categoryId as string to match the serviceCategories keys
        formattedProviders[categoryId] = providers.map(provider => ({
          ...provider,
          id: provider.id.toString()
        }));
      });
      
      console.log('Formatted providers:', formattedProviders);
      setServiceProvidersData(formattedProviders);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading service providers:', err);
      setError('Failed to load service providers. Please try again later.');
      setIsLoading(false);
    }
  }, [serviceProviders]); // Add serviceProviders to dependency array
  
  // Filter providers based on search query
  useEffect(() => {
    console.log('Filtering providers with:', { 
      selectedCategory, 
      searchQuery, 
      availableCategories: Object.keys(serviceProvidersData) 
    });
    
    if (selectedCategory && serviceProvidersData[selectedCategory]) {
      const categoryProviders = serviceProvidersData[selectedCategory] || [];
      console.log(`Found ${categoryProviders.length} providers for category ${selectedCategory}`, categoryProviders);
      
      const filtered = categoryProviders.filter(provider => {
        const searchTerm = searchQuery.toLowerCase().trim();
        if (!searchTerm) return true; // Show all if no search term
        return provider.name.toLowerCase().includes(searchTerm);
      });
      
      console.log(`Filtered to ${filtered.length} providers for search '${searchQuery}'`);
      setFilteredProviders(filtered);
    } else {
      console.log('No category selected or no providers for category:', selectedCategory);
      setFilteredProviders([]);
    }
  }, [searchQuery, selectedCategory, serviceProvidersData]);

  const handleCategorySelect = (categoryId) => {
    console.log('Category selected:', categoryId);
    
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      serviceProvider: '',
      serviceProviderName: ''
    }));
    setShowCategoryDropdown(false);
    setShowProviderList(true);
    setSearchQuery('');
    
    // Log available providers for debugging
    console.log('Available providers for category:', serviceProvidersData[categoryId]);
  };

  const handleProviderSelect = (provider) => {
    setFormData(prev => ({
      ...prev,
      serviceProvider: provider.id,
      serviceProviderName: provider.name
    }));
    setShowProviderList(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!serviceProviderId && !formData.serviceProvider) {
      setError('Please select a service provider');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // Reset form on successful submission
      setFormData({
        title: '',
        description: '',
        category: 'service_issue',
        priority: 'medium',
        serviceProvider: serviceProviderId || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <h2>File a Complaint</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {!serviceProviderId && (
          <div className="form-group">
            <label>Select Service Category</label>
            <div className="dropdown">
              <div 
                className="dropdown-toggle" 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                {selectedCategory ? serviceCategories[selectedCategory] : 'Select a category'}
                <span className="dropdown-arrow">▼</span>
              </div>
              {showCategoryDropdown && (
                <div className="dropdown-menu">
                  {Object.entries(serviceCategories).map(([id, name]) => {
                    const hasProviders = serviceProvidersData[id] && serviceProvidersData[id].length > 0;
                    return (
                      <div 
                        key={id} 
                        className={`dropdown-item ${!hasProviders ? 'disabled' : ''}`}
                        onClick={() => hasProviders && handleCategorySelect(id)}
                        title={!hasProviders ? 'No providers available in this category' : ''}
                      >
                        {name}
                        {!hasProviders && <span className="no-providers-tag">(Empty)</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedCategory && !formData.serviceProvider && (
          <div className="form-group">
            <label>Select Service Provider</label>
            <div className="provider-search">
              <input
                type="text"
                placeholder="Search providers..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowProviderList(true)}
              />
              {showProviderList && (
                <div className="provider-list">
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((provider) => (
                      <div 
                        key={provider.id} 
                        className="provider-item"
                        onClick={() => handleProviderSelect(provider)}
                      >
                        <div className="provider-image-container">
                          <img 
                            src={provider.image} 
                            alt={provider.name} 
                            className="provider-image1"
                            onError={(e) => {
                              // Hide the image if it fails to load
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="provider-info">
                          <div className="provider-name">{provider.name}</div>
                          <div className="provider-rating">
                            <FaStar color="#f9b90b" />
                            <span>{provider.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No providers found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {formData.serviceProvider && (
          <div className="selected-provider">
            <div className="selected-provider-content">
              <div className="selected-provider-image-container">
                <img 
                  src={serviceProvidersData[selectedCategory]?.find(p => p.id.toString() === formData.serviceProvider.toString())?.image} 
                  alt={formData.serviceProviderName}
                  className="selected-provider-image"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="selected-provider-info">
                <h4>{formData.serviceProviderName}</h4>
                <div className="provider-rating">
                  <FaStar color="#f9b90b" />
                  <span>{
                    serviceProvidersData[selectedCategory]?.find(p => p.id.toString() === formData.serviceProvider.toString())?.rating?.toFixed(1) || 'N/A'
                  }</span>
                </div>
              </div>
            </div>
            <button 
              type="button" 
              className="change-provider"
              onClick={() => {
                setFormData(prev => ({ ...prev, serviceProvider: '', serviceProviderName: '' }));
                setShowProviderList(true);
              }}
            >
              Change
            </button>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="title">Complaint Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of your complaint"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide detailed information about your complaint"
            rows="5"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="service_issue">Service Issue</option>
              <option value="billing">Billing Problem</option>
              <option value="professionalism">Professionalism</option>
              <option value="safety">Safety Concern</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
