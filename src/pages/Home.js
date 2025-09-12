import React, { useState, useEffect } from 'react';
import './Home.css';
import ServicesSection from '../components/ServicesSection';
import { Link, useNavigate } from 'react-router-dom';
import { clearCacheOnLoad } from '../utils/clearCache';
import { 
  FaSearch, 
  FaStar, 
  FaUsers, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCheckCircle,
  FaHandshake,
  FaAward,
  FaClock,
  FaHeart,
  FaQuoteLeft,
  FaArrowRight,
  FaPlay,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const nextSlide = () => {
    const itemsPerSlide = isMobile ? 1 : 3;
    const maxSlides = Math.ceil(recentActivities.length / itemsPerSlide);
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    const itemsPerSlide = isMobile ? 1 : 3;
    const maxSlides = Math.ceil(recentActivities.length / itemsPerSlide);
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };
  useEffect(() => {
    setCurrentSlide(0);
  }, [recentActivities, isMobile]);

  // business url banane k liye helper
  const generateBusinessUrl = (activity) => {
    const generateSlug = (title) => {
      if (!title) return '';
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') 
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') 
        .trim('-');
    };
        const category = activity.serviceType ? 
      activity.serviceType.toLowerCase().replace(/[^a-z0-9]/g, '') : 
      'other';
    
    const businessSlug = generateSlug(activity.business.name);
    return `/business/${category}/${businessSlug}`;
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reviews/recent?limit=6');
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.reviews || []);
      } else {
        // recent activities fetch na ho to empty set krdo
        setRecentActivities([]);
      }
    } catch (error) {
      // network error pe quietly handle
      setRecentActivities([]);
    }
  };
  const stats = [
    { number: "10K+", label: "Happy Customers", icon: FaUsers, color: "#006400" },
    { number: "4.8", label: "Average Rating", icon: FaStar, color: "#FFD700" },
    { number: "100%", label: "Verified Providers", icon: FaShieldAlt, color: "#228B22" },

  ];
  useEffect(() => {
    clearCacheOnLoad();
    
    const fetchData = async () => {
      try {
        setLoading(true);
                const [featuredResponse, activitiesResponse] = await Promise.all([
          fetch('http://localhost:5000/api/business?status=active&limit=10'),
          fetch('http://localhost:5000/api/reviews/recent?limit=6')
        ]);
                if (featuredResponse.ok) {
          const data = await featuredResponse.json();
          const activeBusinesses = data.businesses || [];
          
          let featured = [];
          if (activeBusinesses.length > 0) {
            const shuffled = [...activeBusinesses].sort(() => 0.5 - Math.random());
            featured = shuffled.slice(0, 3).map(business => ({
              ...business,
              rating: business.rating || 4.0, // Default rating if none exists
              totalReviews: business.totalReviews || 0, // Default review count
              name: business.businessName || business.name || 'Unnamed Business',
              type: business.businessType || business.type || 'Other',
              description: business.description || 'Professional service provider',
              address: business.location?.city || business.address || 'Location not specified',
              phone: business.contact?.phone || business.phone || null,
              id: business._id || business.id
            }));
          }
          
          setFeaturedServices(featured);
          setError('');
        } else {
          throw new Error('Failed to fetch businesses');
        }
          if (activitiesResponse.ok) {
            const data = await activitiesResponse.json();
            setRecentActivities(data.reviews || []);
          } else {
            // recent activities fail ho to empty
            setRecentActivities([]);
          }
        
      } catch (err) {
        // data fetch error pe fallback use kr rhy hain
        setError('Failed to load data');
        
        const fallbackServices = [
          {
            id: 'sample1',
            name: 'Karachi Biryani House',
            type: 'Food',
            description: 'Authentic Pakistani biryani and traditional dishes. Fresh ingredients, home-style cooking, and excellent taste guaranteed.',
            rating: 4.5,
            totalReviews: 89,
            address: 'Karachi, Pakistan',
            phone: '+92-300-1234567',
            image: null
          },
          {
            id: 'sample2',
            name: 'Lahore Plumbing Solutions',
            type: 'Plumbing',
            description: 'Professional plumbing services for homes and businesses. 24/7 emergency repairs, installations, and maintenance.',
            rating: 4.2,
            totalReviews: 156,
            address: 'Lahore, Pakistan',
            phone: '+92-300-2345678',
            image: null
          },
          {
            id: 'sample3',
            name: 'Islamabad Electrical Works',
            type: 'Electrical',
            description: 'Licensed electricians providing safe and reliable electrical services. Wiring, repairs, and installations.',
            rating: 4.7,
            totalReviews: 203,
            address: 'Islamabad, Pakistan',
            phone: '+92-300-3456789',
            image: null
          }
        ];
        setFeaturedServices(fallbackServices);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="home-hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <FaStar className="badge-icon" />
              <span>Pakistan's #1 Service Directory</span>
            </div>
            <h1 className="home-hero-title">
              Find Trusted Service Providers
              <span className="hero-highlight"> Near You</span>
            </h1>
            <p className="hero-subtitle">
              Connect with verified professionals for all your service needs across Pakistan. 
              Quality guaranteed, reviews verified, satisfaction assured.
            </p>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="home-stat-item">
                  <stat.icon className="home-stat-icon" style={{ color: stat.color }} />
                  <div className="home-stat-content">
                    <span className="home-stat-number">{stat.number}</span>
                    <span className="home-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <Link to="/services" className="hero-btn primary">
                <FaSearch className="btn-icon" />
                Find Services
              </Link>
              <Link to="/service-provider-signup" className="hero-btn secondary">
                Join as Provider
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <div className="floating-card card-1">
                <FaStar className="card-icon" />
                <span>5.0 Rating</span>
              </div>
              <div className="floating-card card-2">
                <FaUsers className="card-icon" />
                <span>500+ Reviews</span>
              </div>
              <div className="hero-main-image">
                {!showVideo ? (
                  <div className="image-placeholder" onClick={() => setShowVideo(true)}>
                    <FaPlay className="play-icon" />
                    <span className="play-text">Watch Video</span>
                  </div>
                ) : (
                  <div className="video-container">
                    <button 
                      className="video-close-btn" 
                      onClick={() => setShowVideo(false)}
                      title="Close Video"
                    >
                      ×
                    </button>

                    <iframe
                      className="hero-video-player"
                      src="AAA Service Directory Video.mp4"
                      title="AAA Service Directory Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose AAA Services?</h2>
            <p>We're committed to connecting you with the best service providers in Pakistan</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Verified Providers</h3>
              <p>All service providers are thoroughly vetted and verified for your safety and peace of mind.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaClock />
              </div>
              <h3>Quick Response</h3>
              <p>Get connected with service providers within minutes, not hours or days.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaHandshake />
              </div>
              <h3>Trusted Network</h3>
              <p>Join thousands of satisfied customers who trust us for their service needs.</p>
            </div>
          </div>
        </div>
      </section>
      <ServicesSection />
      <section className="featured-providers-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Services</h2>
            <p>Top-rated services trusted by thousands of customers</p>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading featured services...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-star" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
              <h3>No featured services available</h3>
              <p>Check back later for our top-rated service providers.</p>
            </div>
          ) : (
            <div className="providers-grid">
              {featuredServices.map(service => (
                <div key={service.id} className="provider-card" onClick={() => {
                  // Generate slug from business name
                  const generateSlug = (title) => {
                    if (!title) return '';
                    return title
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, '') 
                      .replace(/\s+/g, '-') 
                      .replace(/-+/g, '-') 
                      .trim('-');
                  };
                  
                  let category = service.businessType || 
                                 service.category || 
                                 service.serviceType || 
                                 (service.services && service.services[0] && service.services[0].name) ||
                                 'other';
                  
                  category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                  
                  const slug = generateSlug(service.businessName);
                  navigate(`/business/${category}/${slug}`);
                }}>
                  <div className="provider-card-header">
                    <div className="provider-avatar">
                      <div className="avatar-container">
                        {service.image ? (
                          <img 
                            className="provider-image" 
                            src={service.image} 
                            alt={service.name} 
                            onError={(e) => {
                              if (e.currentTarget) {
                                e.currentTarget.style.display = 'none';
                              }
                              if (e.currentTarget && e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }} 
                          />
                        ) : null}
                        <span className="avatar-initials" style={{ display: service.image ? 'none' : 'flex' }}>
                          {service.name?.[0]?.toUpperCase() || 'B'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="provider-info">
                      <h3 className="provider-name" title={service.name}>{service.name}</h3>
                     
                      <p className="provider-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span className="location-text">{service.address || service.city || service.location}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="provider-description">
                    {service.description?.slice(0, 140)}{service.description?.length > 140 ? '...' : ''}
                  </div>
                  
                  <div className="rating-section">
                    <div className="rating-container">
                      <div className="rating-badge">
                        {service.rating && typeof service.rating === 'number' ? service.rating.toFixed(1) : 'N/A'}
                      </div>
                      <div>
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map(s => (
                            <i key={s} className={`fas fa-star${s <= Math.round(service.rating || 0) ? ' filled' : '-o'}`}></i>
                          ))}
                        </div>
                        <div className="rating-count">
                          {service.totalReviews ? `${service.totalReviews} review${service.totalReviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    {service.phone && (
                      <a 
                        className="action-button secondary-button" 
                        href={`tel:${service.phone}`} 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fas fa-phone"></i> Call Now
                      </a>
                    )}
                    <button 
                      className="action-button primary-button" 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        // Generate slug from business name
                        const generateSlug = (title) => {
                          if (!title) return '';
                          return title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '') 
                            .replace(/\s+/g, '-') 
                            .replace(/-+/g, '-') 
                            .trim('-');
                        };
                        
                        let category = service.businessType || 
                                       service.category || 
                                       service.serviceType || 
                                       (service.services && service.services[0] && service.services[0].name) ||
                                       'other';
                        
                        category = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                        
                        const slug = generateSlug(service.businessName);
                        navigate(`/business/${category}/${slug}`);
                      }}
                    >
                      <i className="fas fa-user"></i> View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="section-footer">
            <Link to="/services" className="view-all-btn">
              View All Services <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="recent-activities-section">
        <div className="container">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <p>Latest reviews and activities from our community</p>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="activities-carousel">
              <div className="carousel-container">
                <div 
                  className="carousel-track"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`
                  }}
                >
                  {(() => {
                    const itemsPerSlide = isMobile ? 1 : 3;
                    const slides = [];
                    
                    for (let i = 0; i < recentActivities.length; i += itemsPerSlide) {
                      const slideActivities = recentActivities.slice(i, i + itemsPerSlide);
                      slides.push(
                        <div key={i} className="carousel-slide">
                          <div className="slide-content">
                            {slideActivities.map((activity) => (
                              <div key={activity.id} className="activity-card">
                                <div className="activity-header">
                                  <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                      {activity.reviewer.avatar ? (
                                        <img src={activity.reviewer.avatar} alt={activity.reviewer.name} />
                                      ) : (
                                        <div className="avatar-placeholder">
                                          {activity.reviewer.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="reviewer-details">
                                      <h4>{activity.reviewer.name}</h4>
                                      <p className="activity-time">
                                        <FaClock /> {new Date(activity.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="activity-rating">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar 
                                        key={i} 
                                        className={`star ${i < activity.rating ? 'filled' : 'empty'}`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="activity-content">
                                  <div className="business-info">
                                    <h5>{activity.business.name}</h5>
                                    <p className="business-location">
                                      <FaMapMarkerAlt /> {activity.business.city}
                                    </p>
                                    <span className="service-type">{activity.serviceType}</span>
                                  </div>
                                  
                                  {activity.title && (
                                    <h6 className="review-title">{activity.title}</h6>
                                  )}
                                  
                                  <p className="review-comment">
                                    <FaQuoteLeft className="quote-icon" />
                                    {activity.comment}
                                  </p>
                                </div>
                                
                                <div className="activity-footer">
                                  <Link 
                                    to={generateBusinessUrl(activity)} 
                                    className="view-business-btn"
                                  >
                                    <FaArrowRight className="btn-icon" />
                                    View Business
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return slides;
                  })()}
                </div>
                
                <div className="carousel-controls">
                  <button 
                    className="carousel-btn prev-btn" 
                    onClick={prevSlide}
                    aria-label="Previous activities"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    className="carousel-btn next-btn" 
                    onClick={nextSlide}
                    aria-label="Next activities"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-activities">
              <div className="no-activities-content">
                <FaStar className="no-activities-icon" />
                <h3>No Recent Activities</h3>
                <p>Be the first to leave a review and help others find great services!</p>
                <Link to="/services" className="cta-btn primary">
                  <FaSearch className="btn-icon" />
                  Find Services
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Service Provider?</h2>
            <p>Join thousands of satisfied customers who trust AAA Services for their needs</p>
            <div className="cta-buttons">
              <Link to="/services" className="cta-btn primary">
                <FaSearch className="btn-icon" />
                Start Searching
              </Link>
              <Link to="/signup" className="cta-btn secondary">
                <FaHeart className="btn-icon" />
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;