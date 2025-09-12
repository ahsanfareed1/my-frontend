import React from 'react';
import './BusinessAvatar.css';

const BusinessAvatar = ({ 
  businessName, 
  imageUrl, 
  size = 'medium', 
  className = '',
  showBorder = true 
}) => {
  // its getting the first letter of a business name so we can show if don't have logo/image
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  const getAvatarColor = (name) => {
    if (!name) return '#228B22';
    
    const colors = [
      '#228B22', 
      '#32CD32', 
      '#006400', 
      '#90EE90',
      '#228B22', 
      '#32CD32', 
      '#006400', 
      '#90EE90',
      '#228B22',
      '#32CD32' 
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={businessName || 'Business'}
        className={`business-avatar business-avatar--${size} ${className}`}
        onError={(e) => {
          // If image fails to load, hide it and show the fallback
          if (e.target) {
            e.target.style.display = 'none';
          }
          if (e.target && e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
      />
    );
  }
  return (
    <div 
      className={`business-avatar business-avatar--${size} business-avatar--fallback ${className}`}
      title={businessName || 'Business'}
    >
      <span className="business-avatar__initial">
        {getInitial(businessName)}
      </span>
    </div>
  );
};

export default BusinessAvatar;
