import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaPhone, FaMapMarkerAlt, FaEnvelope, FaEdit, FaPlus, FaGlobe, FaClock, FaUsers, FaAward, FaCheckCircle, FaRegClock, FaRegUser, FaRegBuilding, FaRegCalendarAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './BusinessProfile.css';
import InquiryForm from '../components/InquiryForm';

const BusinessProfile = () => {
  const { businessId, serviceId, providerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  console.log('🔍 BusinessProfile: URL Parameters - businessId:', businessId, 'serviceId:', serviceId, 'providerId:', providerId);
  console.log('🔍 BusinessProfile: Location state:', location.state);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    serviceType: 'other',
    serviceQuality: 5,
    communication: 5,
    valueForMoney: 5,
    punctuality: 5,
    professionalism: 5
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Inquiry form state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState('');

  // Normalize business data from different sources
  const normalizeBusinessData = (data) => {
    if (!data) return null;
    
    const normalized = {
      id: data._id || data.id,
      businessName: data.businessName || data.name,
      description: data.description,
      rating: data.rating?.average || data.rating || 0,
      totalReviews: data.rating?.totalReviews || 0,
      reviews: data.reviews || [],
      categoryName: data.businessType || data.categoryName || data.category,
      phone: data.contact?.phone || data.phone,
      email: data.contact?.email || data.email,
      website: data.contact?.website || data.website,
      address: data.location?.address || data.address,
      city: data.location?.city || data.city,
      yearsOfExperience: data.yearsOfExperience || data.experience,
      profilePicture: data.images?.logo || data.images?.cover || data.profilePicture || data.image,
      coverPhoto: data.images?.cover || data.coverPhoto,
      galleryImages: data.images?.gallery || data.galleryImages || [],
      businessHours: data.businessHours || data.hours || {},
      userId: data.userId || data.ownerId,
      services: data.services || []
    };
    
    console.log('🔍 BusinessProfile: Raw services data:', data.services);
    console.log('🔍 BusinessProfile: Normalized services:', normalized.services);
    console.log('🔍 BusinessProfile: Rating data:', data.rating);
    console.log('🔍 BusinessProfile: Total reviews from rating:', data.rating?.totalReviews);
    console.log('🔍 BusinessProfile: Final totalReviews:', normalized.totalReviews);
    
    return normalized;
  };

  // Handle review form input changes
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: name === 'rating' || name.includes('Quality') || name.includes('communication') || name.includes('valueForMoney') || name.includes('punctuality') || name.includes('professionalism') 
        ? parseInt(value) 
        : value
    }));
  };

  // Handle inquiry form success
  const handleInquirySuccess = (message) => {
    setInquirySuccess(message);
    setShowInquiryForm(false);
  };

  // Submit review to backend
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setReviewError('Please log in to write a review');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewError('Please write a review comment');
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      setReviewError('Review comment must be at least 10 characters long');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const reviewData = {
        businessId: businessId || business.id,
        rating: reviewForm.rating,
        title: reviewForm.title || `Review for ${business.businessName}`,
        comment: reviewForm.comment.trim(),
        serviceType: reviewForm.serviceType,
        serviceQuality: reviewForm.serviceQuality,
        communication: reviewForm.communication,
        valueForMoney: reviewForm.valueForMoney,
        punctuality: reviewForm.punctuality,
        professionalism: reviewForm.professionalism
      };

      if (!reviewData.businessId) {
        throw new Error('Business ID is missing');
      }

      console.log('🔍 BusinessProfile: SUBMITTING REVIEW - Business ID:', reviewData.businessId);
      console.log('🔍 BusinessProfile: SUBMITTING REVIEW - URL businessId:', businessId);
      console.log('🔍 BusinessProfile: SUBMITTING REVIEW - Business object ID:', business?.id);
      console.log('🔍 BusinessProfile: SUBMITTING REVIEW - Review data:', reviewData);

      console.log('🔍 BusinessProfile: Testing backend connectivity...');
      try {
        const testResponse = await fetch('http://localhost:5000/api/business', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        console.log('🔍 BusinessProfile: Backend connectivity test status:', testResponse.status);
      } catch (testError) {
        console.warn('🔍 BusinessProfile: Backend connectivity test failed:', testError);
      }

      console.log('🔍 BusinessProfile: Submitting review data:', reviewData);
      console.log('🔍 BusinessProfile: Business ID type:', typeof reviewData.businessId);
      console.log('🔍 BusinessProfile: Business ID value:', reviewData.businessId);
      console.log('🔍 BusinessProfile: Using token:', token ? 'Token exists' : 'No token');

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      console.log('🔍 BusinessProfile: Response status:', response.status);
      console.log('🔍 BusinessProfile: Response headers:', response.headers);

      const data = await response.json();
      console.log('🔍 BusinessProfile: Response data:', data);

      if (response.ok || (data && (data._id || data.id || data.reviewId))) {
        console.log('🔍 BusinessProfile: Review submitted successfully!');
        setReviewSuccess('Review submitted successfully!');
        setReviewForm({
          rating: 5,
          title: '',
          comment: '',
          serviceType: 'other',
          serviceQuality: 5,
          communication: 5,
          valueForMoney: 5,
          punctuality: 5,
          professionalism: 5
        });
        
        setShowReviewForm(false);
        
        await fetchReviews();
        await refreshBusinessData();
        
        setTimeout(() => {
          setReviewSuccess('');
        }, 3000);
      } else {
        console.error('🔍 BusinessProfile: API error response:', data);
        if (data && (data._id || data.id || data.reviewId)) {
          console.log('🔍 BusinessProfile: Review was created despite error response, treating as success');
          setReviewSuccess('Review submitted successfully!');
          setShowReviewForm(false);
          await fetchReviews();
          setTimeout(() => {
            setReviewSuccess('');
          }, 3000);
        } else {
          setReviewError(data.message || `Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('🔍 BusinessProfile: Network or other error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setReviewError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setReviewError(`Failed to submit review: ${error.message}`);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Refresh business data to update rating count
  const refreshBusinessData = async () => {
    if (!business?.id) return;
    
    try {
      console.log('🔍 BusinessProfile: Refreshing business data for ID:', business.id);
      const response = await fetch(`http://localhost:5000/api/business/${business.id}`);
      
      if (response.ok) {
        const businessData = await response.json();
        console.log('🔍 BusinessProfile: Refreshed business data:', businessData);
        
        if (businessData.business) {
          const normalized = normalizeBusinessData(businessData.business);
          console.log('🔍 BusinessProfile: Normalized business data:', normalized);
          console.log('🔍 BusinessProfile: Rating:', normalized.rating, 'Total Reviews:', normalized.totalReviews);
          setBusiness(normalized);
        } else if (businessData) {
          const normalized = normalizeBusinessData(businessData);
          console.log('🔍 BusinessProfile: Normalized business data (direct):', normalized);
          console.log('🔍 BusinessProfile: Rating:', normalized.rating, 'Total Reviews:', normalized.totalReviews);
          setBusiness(normalized);
        }
      } else {
        console.error('🔍 BusinessProfile: Failed to refresh business data:', response.status);
        const errorText = await response.text();
        console.error('🔍 BusinessProfile: Error response:', errorText);
      }
    } catch (error) {
      console.error('🔍 BusinessProfile: Error refreshing business data:', error);
    }
  };

  // Fetch reviews for this business
  const fetchReviews = async () => {
    const targetBusinessId = businessId || business?.id;
    
    if (!targetBusinessId) {
      console.log('🔍 BusinessProfile: No business ID available for fetching reviews');
      console.log('🔍 BusinessProfile: URL businessId:', businessId);
      console.log('🔍 BusinessProfile: Business object ID:', business?.id);
      return;
    }
    
    console.log('🔍 BusinessProfile: Starting to fetch reviews...');
    console.log('🔍 BusinessProfile: Using business ID for fetching reviews:', targetBusinessId);
    console.log('🔍 BusinessProfile: Business data available:', business);
    
    setLoadingReviews(true);
    try {
      let reviews = [];
      
      const url = `http://localhost:5000/api/reviews?businessId=${targetBusinessId}`;
      console.log('🔍 BusinessProfile: Fetching reviews from URL:', url);
      
      const response = await fetch(url);
      console.log('🔍 BusinessProfile: Reviews response status:', response.status);
      
      if (response.ok) {
        const reviewsData = await response.json();
        console.log('🔍 BusinessProfile: Raw reviews data from API:', reviewsData);
        
        if (Array.isArray(reviewsData)) {
          reviews = reviewsData;
          console.log('🔍 BusinessProfile: Reviews is an array, length:', reviews.length);
        } else if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
          reviews = reviewsData.reviews;
          console.log('🔍 BusinessProfile: Reviews from reviews property, length:', reviews.length);
        } else if (reviewsData.data && Array.isArray(reviewsData.data)) {
          reviews = reviewsData.data;
          console.log('🔍 BusinessProfile: Reviews from data property, length:', reviews.length);
        } else {
          console.log('🔍 BusinessProfile: Unexpected reviews data structure:', reviewsData);
        }
      } else {
        console.error('🔍 BusinessProfile: Failed to fetch reviews. Status:', response.status);
        const errorText = await response.text();
        console.error('🔍 BusinessProfile: Error response body:', errorText);
      }
      
      if (reviews.length === 0) {
        console.log('🔍 BusinessProfile: No reviews found with business ID, trying to fetch all reviews...');
        try {
          const allReviewsResponse = await fetch('http://localhost:5000/api/reviews');
          if (allReviewsResponse.ok) {
            const allReviewsData = await allReviewsResponse.json();
            console.log('🔍 BusinessProfile: All reviews in database:', allReviewsData);
            
            if (Array.isArray(allReviewsData)) {
              const matchingReviews = allReviewsData.filter(review => {
                console.log('🔍 BusinessProfile: Checking review:', review);
                return review.businessId === targetBusinessId || 
                       review.businessId === business?.id ||
                       review.businessId === businessId;
              });
              console.log('🔍 BusinessProfile: Matching reviews found:', matchingReviews);
              reviews = matchingReviews;
            }
          }
        } catch (allReviewsError) {
          console.log('🔍 BusinessProfile: Could not fetch all reviews:', allReviewsError);
        }
      }
      
      if (reviews.length === 0 && business.reviews && Array.isArray(business.reviews)) {
        console.log('🔍 BusinessProfile: Using fallback reviews from business data:', business.reviews);
        reviews = business.reviews;
      }
      
      console.log('🔍 BusinessProfile: Final processed reviews:', reviews);
      setReviews(reviews);
      
    } catch (error) {
      console.error('🔍 BusinessProfile: Network error fetching reviews:', error);
      if (business.reviews && Array.isArray(business.reviews)) {
        console.log('🔍 BusinessProfile: Using fallback reviews from business data after network error:', business.reviews);
        setReviews(business.reviews);
      } else {
        console.log('🔍 BusinessProfile: No fallback reviews available after network error, setting empty array');
        setReviews([]);
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch reviews when business data is available
  useEffect(() => {
    if (business?.id) {
      fetchReviews();
    }
  }, [business?.id]);

  // Auto-refresh business data when reviews change to keep rating count updated
  useEffect(() => {
    if (reviews.length > 0 && business?.id) {
      refreshBusinessData();
    }
  }, [reviews.length]);

  // Search localStorage for business data
  const searchLocalStorage = (businessId) => {
    if (!businessId) return null;
    
    const localStorageKeys = ['serviceProviders', 'registeredProviders', 'businesses', 'providers'];
    
    for (const key of localStorageKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsedData = JSON.parse(data);
          
          if (Array.isArray(parsedData)) {
            const found = parsedData.find(p => p.id === businessId || p._id === businessId);
            if (found) {
              console.log(`🔍 BusinessProfile: Found business in localStorage.${key}:`, found);
              return found;
            }
          } else if (typeof parsedData === 'object') {
            for (const [categoryId, providers] of Object.entries(parsedData)) {
              if (Array.isArray(providers)) {
                const found = providers.find(p => p.id === businessId || p._id === businessId);
                if (found) {
                  console.log(`🔍 BusinessProfile: Found business in localStorage.${key}.${categoryId}:`, found);
                  return found;
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(`🔍 BusinessProfile: Error parsing localStorage.${key}:`, e);
      }
    }
    
    return null;
  };

  // Fetch business data from API or localStorage
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        console.log('🔍 BusinessProfile: Fetching business data for ID:', businessId);
        
        const response = await fetch(`http://localhost:5000/api/business/${businessId}`);
        console.log('🔍 BusinessProfile: API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 BusinessProfile: API response data:', data);
          console.log('🔍 BusinessProfile: API response rating structure:', data.business?.rating || data.rating);
          
          let businessData;
          if (data.business) {
            businessData = data.business;
          } else if (data._id) {
            businessData = data;
          } else {
            throw new Error('Invalid business data structure from API');
          }
          
          console.log('🔍 BusinessProfile: Business data before normalization:', businessData);
          console.log('🔍 BusinessProfile: Business rating structure:', businessData.rating);
          
          const normalized = normalizeBusinessData(businessData);
          console.log('🔍 BusinessProfile: Normalized business data from API:', normalized);
          console.log('🔍 BusinessProfile: Rating from API:', normalized.rating, 'Total Reviews:', normalized.totalReviews);
          setBusiness(normalized);
        } else {
          console.log('🔍 BusinessProfile: API failed, falling back to localStorage');
          const fallbackData = searchLocalStorage(businessId);
          if (fallbackData) {
            const normalized = normalizeBusinessData(fallbackData);
            console.log('🔍 BusinessProfile: Normalized business data from localStorage:', normalized);
            setBusiness(normalized);
          } else {
            setError('Business not found');
          }
        }
      } catch (error) {
        console.error('🔍 BusinessProfile: Error fetching business data:', error);
        const fallbackData = searchLocalStorage(businessId);
        if (fallbackData) {
          const normalized = normalizeBusinessData(fallbackData);
          console.log('🔍 BusinessProfile: Normalized business data from localStorage fallback:', normalized);
          setBusiness(normalized);
        } else {
          setError('Business not found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading business profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <FaRegBuilding />
        </div>
        <h2>{error}</h2>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="no-business">
        <div className="no-business-icon">
          <FaRegBuilding />
        </div>
        <h2>No business profile found</h2>
        <p>We couldn't find the business you're looking for.</p>
        <div className="no-business-actions">
          <Link to="/service-provider-signup" className="btn-primary">
            {user ? 'Add a New Business' : 'Register Your Business'}
          </Link>
          {user && (
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Check if current user owns this business
  const isOwner = user && business.userId === user.id;

  // Ensure business.rating is a valid number
  const businessRating = Number(business.rating) || 0;

  return (
    <div className="business-profile">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading business profile...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">
            <FaRegBuilding />
          </div>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : !business ? (
        <div className="no-business">
          <div className="no-business-icon">
            <FaRegBuilding />
          </div>
          <h2>Business not found</h2>
          <p>The business you're looking for doesn't exist.</p>
        </div>
      ) : (
        <>
          {/* Professional Hero Section */}
          <div className="business-hero">
            <div className="hero-background-pattern"></div>
            <div className="business-hero-content">
              <div className="profile-section">
                <div className="profile-picture-container">
                  <div className="profile-picture">
                    <img 
                      src={business.profilePicture || business.image || '/default-profile.png'} 
                      alt={business.businessName || business.name}
                      onError={(e) => {
                        e.target.src = '/default-profile.png';
                      }}
                    />
                  </div>
                  {business.yearsOfExperience && (
                    <div className="experience-badge">
                      <FaAward />
                      <span>{business.yearsOfExperience} Years</span>
                    </div>
                  )}
                </div>
                <div className="business-info">
                  <div className="business-header">
                    <h1>{business.businessName || business.name}</h1>
                    <div className="verification-badge">
                      <FaCheckCircle />
                      <span>Verified Business</span>
                    </div>
                  </div>
                  <div className="rating-section">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < Math.floor(businessRating) ? 'star filled' : 'star'} 
                        />
                      ))}
                    </div>
                    <div className="rating-details">
                      <span className="rating-number">{businessRating.toFixed(1)}</span>
                      <span className="rating-text">({business.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="business-meta">
                    <div className="category-badge">
                      <FaRegBuilding />
                      <span>{business.categoryName || business.businessType || business.category}</span>
                    </div>
                    {business.city && (
                      <div className="location-badge">
                        <FaMapMarkerAlt />
                        <span>{business.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional CTA Section */}
          <div className="cta-section">
            <div className="cta-header">
              <h3>Contact & Connect</h3>
              <p>Choose how you'd like to interact with this business</p>
            </div>
            <div className="cta-grid">
              <button 
                className="cta-button cta-call"
                onClick={() => window.open(`tel:${business.phone}`, '_self')}
              >
                <div className="cta-icon">
                  <FaPhone />
                </div>
                <div className="cta-content">
                  <span className="cta-title">Call Now</span>
                  <span className="cta-subtitle">Direct phone contact</span>
                </div>
              </button>
              <button 
                className="cta-button cta-inquiry"
                onClick={() => setShowInquiryForm(true)}
              >
                <div className="cta-icon">
                  <FaEnvelope />
                </div>
                <div className="cta-content">
                  <span className="cta-title">Send Inquiry</span>
                  <span className="cta-subtitle">Request information</span>
                </div>
              </button>
              <button 
                className="cta-button cta-write-review"
                onClick={() => setShowReviewForm(true)}
              >
                <div className="cta-icon">
                  <FaStar />
                </div>
                <div className="cta-content">
                  <span className="cta-title">Write Review</span>
                  <span className="cta-subtitle">Share your experience</span>
                </div>
              </button>
            </div>
          </div>

          {/* Professional Information Cards */}
          <div className="info-grid">
            <div className="info-card contact-card">
              <div className="card-header">
                <FaPhone className="card-icon" />
                <h3>Contact Information</h3>
              </div>
              <div className="contact-details">
                <div className="detail-item phone-item">
                  <FaPhone className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{business.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="detail-item email-item">
                  <FaEnvelope className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{business.email}</span>
                  </div>
                </div>
                {business.website && (
                  <div className="detail-item website-item">
                    <FaGlobe className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Website</span>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="website-link">
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="detail-item address-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">
                      {[business.address, business.location, business.city]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card about-card">
              <div className="card-header">
                <FaRegBuilding className="card-icon" />
                <h3>About Us</h3>
              </div>
              <div className="about-content">
                <p>{business.description || 'No description provided.'}</p>
                
                {/* User Type Tags */}
                {business.tags && business.tags.length > 0 && (
                  <div className="user-type-tags">
                    <h4>Account Type</h4>
                    <div className="tags-container">
                      {business.tags.map((tag, index) => (
                        <span key={index} className={`user-type-tag ${tag.toLowerCase().replace(' ', '-')}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {business.services && business.services.length > 0 && (
                  <div className="services-list">
                    <h4>Services Offered</h4>
                    <div className="services-tags">
                      {business.services.slice(0, 6).map((service, index) => (
                        <span key={index} className="service-tag">
                          {typeof service === 'string' ? service : (service?.name || service?.service || 'Service')}
                        </span>
                      ))}
                      {business.services.length > 6 && (
                        <span className="service-tag more-tag">+{business.services.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {business.businessHours && Object.keys(business.businessHours).length > 0 && (
              <div className="info-card hours-card">
                <div className="card-header">
                  <FaRegClock className="card-icon" />
                  <h3>Business Hours</h3>
                </div>
                <div className="business-hours">
                  {Object.entries(business.businessHours).map(([day, hours]) => (
                    <div key={day} className="business-hour-row">
                      <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <span className="hours">
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(business.coverPhoto || (business.galleryImages && business.galleryImages.length > 0)) && (
              <div className="info-card gallery-card">
                <div className="card-header">
                  <FaRegBuilding className="card-icon" />
                  <h3>Gallery</h3>
                </div>
                <div className="business-gallery">
                  {business.coverPhoto && (
                    <div className="cover-photo">
                      <img src={business.coverPhoto} alt="Cover Photo" />
                      <div className="image-overlay">
                        <span className="image-label">Cover Photo</span>
                      </div>
                    </div>
                  )}
                  {business.galleryImages && business.galleryImages.length > 0 && (
                    <div className="gallery-images">
                      {business.galleryImages.slice(0, 6).map((image, index) => (
                        <div key={index} className="gallery-image">
                          <img src={image} alt={`Gallery Image ${index + 1}`} />
                        </div>
                      ))}
                      {business.galleryImages.length > 6 && (
                        <div className="gallery-more">
                          <span>+{business.galleryImages.length - 6} more</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Professional Reviews Section */}
          <div className="reviews-card">
            <div className="reviews-header">
              <div className="reviews-title">
                <h3>Customer Reviews</h3>
                <div className="reviews-summary">
                  <span className="average-rating">{businessRating.toFixed(1)}</span>
                  <div className="summary-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < Math.floor(businessRating) ? 'star filled' : 'star'} 
                      />
                    ))}
                  </div>
                  <span className="total-reviews">({business.totalReviews || 0} reviews)</span>
                </div>
              </div>
              <button className="write-review-btn" onClick={() => setShowReviewForm(true)}>
                <FaPlus /> Write a Review
              </button>
            </div>
            
            {loadingReviews ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {(() => {
                            if (review.reviewer && review.reviewer.firstName) {
                              return `${review.reviewer.firstName.charAt(0)}${review.reviewer.lastName ? review.reviewer.lastName.charAt(0) : ''}`;
                            } else if (review.reviewer && review.reviewer.name) {
                              return review.reviewer.name.charAt(0);
                            } else if (review.userName) {
                              return review.userName.charAt(0);
                            } else if (review.reviewerName) {
                              return review.reviewerName.charAt(0);
                            } else {
                              return 'A';
                            }
                          })()}
                        </div>
                        <div className="reviewer-details">
                          <span className="reviewer-name">
                            {(() => {
                              if (review.reviewer && review.reviewer.firstName) {
                                return `${review.reviewer.firstName} ${review.reviewer.lastName || ''}`.trim();
                              } else if (review.reviewer && review.reviewer.name) {
                                return review.reviewer.name;
                              } else if (review.userName) {
                                return review.userName;
                              } else if (review.reviewerName) {
                                return review.reviewerName;
                              } else {
                                return 'Anonymous';
                              }
                            })()}
                          </span>
                          <span className="review-date">
                            {new Date(review.date || review.createdAt || review.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < (Number(review.rating) || 0) ? 'star filled' : 'star'} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="review-title">{review.title}</h4>
                    )}
                    <p className="review-text">{review.comment || review.reviewText || review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <div className="no-reviews-icon">
                  <FaStar />
                </div>
                <h4>No reviews yet</h4>
                <p>Be the first to share your experience with this business</p>
                <button className="btn-primary" onClick={() => setShowReviewForm(true)}>
                  Write First Review
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-form-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowReviewForm(false);
            setReviewError('');
            setReviewSuccess('');
          }
        }}>
          <div className="review-form-content">
            <button 
              className="close-button" 
              onClick={() => {
                setShowReviewForm(false);
                setReviewError('');
                setReviewSuccess('');
              }}
              aria-label="Close review form"
            >
              &times;
            </button>
            <h2>Write a Review for {business.businessName}</h2>
            
            {!isAuthenticated ? (
              <div className="auth-required-message">
                <div className="auth-icon">
                  <FaRegUser />
                </div>
                <p>You need to be logged in to write a review</p>
                <div className="auth-actions">
                  <Link to="/login" className="btn-primary">Log In</Link>
                  <Link to="/signup" className="btn-secondary">Sign Up</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                {reviewError && <div className="error-message">{reviewError}</div>}
                {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
                
                <div className="form-group">
                  <label htmlFor="rating">Overall Rating *</label>
                  <select
                    id="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewInputChange}
                    name="rating"
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Review Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={reviewForm.title}
                    onChange={handleReviewInputChange}
                    placeholder="Brief summary of your experience"
                    maxLength="100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Review Comment *</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewInputChange}
                    placeholder="Share your detailed experience with this business..."
                    required
                    minLength="10"
                    maxLength="1000"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serviceType">Service Type</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={reviewForm.serviceType}
                    onChange={handleReviewInputChange}
                  >
                    <option value="other">Other</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="painting">Painting</option>
                    <option value="gardening">Gardening</option>
                    <option value="repair">Repair</option>
                    <option value="transport">Transport</option>
                    <option value="security">Security</option>
                    <option value="education">Education</option>
                    <option value="food">Food</option>
                    <option value="beauty">Beauty</option>
                    <option value="health">Health</option>
                    <option value="construction">Construction</option>
                    <option value="maintenance">Maintenance</option>
                    {business.services && Array.isArray(business.services) && business.services.length > 0 && business.services.map(service => {
                      const serviceName = typeof service === 'string' ? service : 
                                        (service && typeof service === 'object' ? service.name || service.service : '');
                      if (serviceName && typeof serviceName === 'string') {
                        return (
                          <option key={serviceName} value={serviceName.toLowerCase()}>
                            {serviceName}
                          </option>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                    {(!business.services || !Array.isArray(business.services) || business.services.length === 0) && (
                      <option value="other">Other (No specific services listed)</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Detailed Ratings</label>
                  <div className="detailed-ratings-grid">
                    <div>
                      <label htmlFor="serviceQuality">Service Quality</label>
                      <select
                        id="serviceQuality"
                        name="serviceQuality"
                        value={reviewForm.serviceQuality}
                        onChange={handleReviewInputChange}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="communication">Communication</label>
                      <select
                        id="communication"
                        name="communication"
                        value={reviewForm.communication}
                        onChange={handleReviewInputChange}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="valueForMoney">Value for Money</label>
                      <select
                        id="valueForMoney"
                        name="valueForMoney"
                        value={reviewForm.valueForMoney}
                        onChange={handleReviewInputChange}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="punctuality">Punctuality</label>
                      <select
                        id="punctuality"
                        name="punctuality"
                        value={reviewForm.punctuality}
                        onChange={handleReviewInputChange}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="professionalism">Professionalism</label>
                      <select
                        id="professionalism"
                        name="professionalism"
                        value={reviewForm.professionalism}
                        onChange={handleReviewInputChange}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submittingReview}
                  style={{ width: '100%' }}
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <InquiryForm
          serviceProviderId={business?.id}
          serviceId={serviceId}
          serviceName={business?.businessName || business?.name || 'this service'}
          onClose={() => setShowInquiryForm(false)}
          onSuccess={handleInquirySuccess}
        />
      )}
    </div>
  );
};

export default BusinessProfile;
