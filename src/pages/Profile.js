import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCamera, FaStar, FaTrash, FaEye } from 'react-icons/fa';
import './Profile.css';

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  
  // Debug logging
  useEffect(() => {
    console.log('Profile component - User state:', user);
    console.log('Profile component - Token in localStorage:', localStorage.getItem('token'));
    console.log('Profile component - User type:', typeof user);
    console.log('Profile component - User keys:', user ? Object.keys(user) : 'No user object');
  }, [user]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    area: '',
    country: 'Pakistan',
    postalCode: ''
  });
  
  // Initialize form data when user data is available
  useEffect(() => {
    if (user && user.firstName) {
      console.log('Profile component - Setting form data with user:', user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
          email: user.email || '',
        phone: user.phone || '',
        address: user.location?.address || '',
        city: user.location?.city || '',
        area: user.location?.area || '',
        country: user.location?.country || 'Pakistan',
        postalCode: user.location?.postalCode || ''
      });
    }
  }, [user]);

  // Fetch user reviews
  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews?reviewer=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data.reviews || []);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.location?.address || '',
      city: user.location?.city || '',
      area: user.location?.area || '',
      country: user.location?.country || 'Pakistan',
      postalCode: user.location?.postalCode || ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim()
        }
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleCancelEditReview = () => {
    setEditingReview(null);
  };

  const handleSaveReview = async (reviewId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Review updated successfully!' });
        setEditingReview(null);
        fetchUserReviews(); // Refresh reviews
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update review' });
      }
    } catch (error) {
      console.error('Review update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating review' });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Review deleted successfully!' });
          fetchUserReviews(); // Refresh reviews
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to delete review' });
        }
      } catch (error) {
        console.error('Review deletion error:', error);
        setMessage({ type: 'error', text: 'An error occurred while deleting review' });
      }
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-loading">
            <h2>Loading Profile...</h2>
            <p>Please wait while we load your profile information.</p>
            <div className="loading-spinner"></div>
            <p className="debug-info">
              Debug: User object is {user === null ? 'null' : 'undefined'}<br/>
              Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}<br/>
              <button onClick={() => window.location.reload()}>Reload Page</button>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback display if user object is incomplete
  if (!user.firstName || !user.email) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-loading">
            <h2>Profile Data Incomplete</h2>
            <p>Some profile information is missing. Please try logging in again.</p>
            <div className="debug-info">
              <p><strong>User object received:</strong></p>
              <pre>{JSON.stringify(user, null, 2)}</pre>
              <p><strong>User type:</strong> {typeof user}</p>
              <p><strong>User keys:</strong> {user ? Object.keys(user).join(', ') : 'No user object'}</p>
              <button onClick={() => navigate('/login')}>Go to Login</button>
              <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="avatar-img" />
          ) : (
            <FaUser className="avatar-icon" />
          )}
            {isEditing && (
              <button className="avatar-edit-btn">
            <FaCamera />
              </button>
            )}
          </div>
          <div className="profile-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <p className="user-email">{user.email}</p>
            <p className="user-type">Customer Account</p>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={handleEdit} className="edit-btn">
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn" disabled={isLoading}>
                  <FaSave /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <h3>Personal Information</h3>
            
            {/* First Name and Last Name - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  First Name
                </label>
            <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                />
              </div>
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  Last Name
          </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                />
              </div>
            </div>
            
            {/* User Type Tags */}
            {user && user.tags && user.tags.length > 0 && (
              <div className="user-type-section">
                <h4>Account Type</h4>
                <div className="user-type-tags">
                  {user.tags.map((tag, index) => (
                    <span key={index} className={`user-type-tag ${tag.toLowerCase().replace(' ', '-')}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
        
          <div className="profile-section">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="readonly"
              />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>
                <FaPhone className="input-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'readonly' : ''}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Location Information</h3>
          
            {/* Address - Full Width */}
            <div className="form-group">
              <label>
                <FaMapMarkerAlt className="input-icon" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'readonly' : ''}
                placeholder="Enter your street address"
              />
            </div>
            
            {/* City and Area - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                  placeholder="Enter your city"
                />
              </div>
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  Area/Neighborhood
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                  placeholder="Enter your area"
                />
              </div>
            </div>
            
            {/* Country and Postal Code - Two columns when space allows */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" />
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly' : ''}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
        </div>
        
          {/* User Reviews Section */}
          <div className="profile-section">
            <h3>My Reviews</h3>
            {loadingReviews ? (
              <div className="loading-reviews">Loading your reviews...</div>
            ) : userReviews.length > 0 ? (
              <div className="reviews-container">
                {userReviews.map((review) => (
                  <div key={review._id} className="review-item">
                    {editingReview && editingReview._id === review._id ? (
                      <ReviewEditForm
                        review={review}
                        onSave={handleSaveReview}
                        onCancel={handleCancelEditReview}
                      />
                    ) : (
                      <div className="review-content">
                        <div className="review-header">
                          <div className="review-business">
                            <h4>{review.business?.businessName || 'Business'}</h4>
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`star ${i < review.rating ? 'filled' : ''}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="review-actions">
              <button 
                              onClick={() => handleEditReview(review)}
                              className="review-edit-btn"
              >
                              <FaEdit /> Edit
              </button>
              <button 
                              onClick={() => handleDeleteReview(review._id)}
                              className="review-delete-btn"
              >
                              <FaTrash /> Delete
              </button>
                          </div>
                        </div>
                        <div className="review-details">
                          <p className="review-title">{review.title}</p>
                          <p className="review-comment">{review.comment}</p>
                          <p className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
          )}
        </div>
                ))}
            </div>
          ) : (
              <div className="no-reviews">
                <p>You haven't written any reviews yet.</p>
                <button 
                  onClick={() => navigate('/services')} 
                  className="browse-services-btn"
                >
                  Browse Services
                </button>
              </div>
          )}
        </div>

        <div className="profile-section">
            <h3>Account Actions</h3>
            <div className="account-actions">
              <button onClick={handleLogout} className="logout-btn">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Review Edit Form Component
function ReviewEditForm({ review, onSave, onCancel }) {
  const [editData, setEditData] = useState({
    rating: review.rating,
    title: review.title || '',
    comment: review.comment
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(review._id, editData);
  };

  return (
    <form onSubmit={handleSubmit} className="review-edit-form">
      <div className="form-group">
        <label>Rating</label>
        <select
          name="rating"
          value={editData.rating}
          onChange={handleChange}
          required
        >
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={editData.title}
          onChange={handleChange}
          placeholder="Review title"
          maxLength="100"
        />
      </div>
      
      <div className="form-group">
        <label>Comment</label>
        <textarea
          name="comment"
          value={editData.comment}
          onChange={handleChange}
          placeholder="Your review comment"
          rows="4"
          required
          maxLength="1000"
        />
      </div>
      
      <div className="review-edit-actions">
        <button type="submit" className="save-review-btn">
          <FaSave /> Save Review
        </button>
        <button type="button" onClick={onCancel} className="cancel-review-btn">
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );
}

export default Profile;
