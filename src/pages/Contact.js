import React from 'react';
import './Contact.css';
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook,
  FaStar,
  FaUsers,
  FaHandshake
} from 'react-icons/fa';

const Contact = () => {
  // Co-founders data
  const coFounders = [
    {
      id: 1,
      name: "Ahsan Fareed",
      position: "Co-Founder & CEO",
      image: "https://via.placeholder.com/200x200/228B22/ffffff?text=AF",
      description: "Leading AAA Services platform with vision to connect quality service providers with customers across Pakistan.",
      expertise: ["Platform Strategy", "Business Development", "Customer Experience"],
      rating: 4.9,
      reviews: 127,
      email: "ahsan.fareed@aaaservices.com",
      phone: "+92-300-1234567",
      linkedin: "https://linkedin.com/in/ahsanfareed",
      facebook: "https://facebook.com/ahsanfareed"
    },
    {
      id: 2,
      name: "Ali Haider",
      position: "Co-Founder & CTO",
      image: "https://via.placeholder.com/200x200/32CD32/ffffff?text=AH",
      description: "Driving technological innovation and ensuring seamless platform performance for our users.",
      expertise: ["Technology Strategy", "Platform Development", "System Architecture"],
      rating: 4.8,
      reviews: 89,
      email: "ali.haider@aaaservices.com",
      phone: "+92-300-2345678",
      linkedin: "https://linkedin.com/in/alihaider",
      facebook: "https://facebook.com/alihaider"
    },
    {
      id: 3,
      name: "Muhammad Ali Khan",
      position: "Co-Founder & COO",
      image: "https://via.placeholder.com/200x200/006400/ffffff?text=MAK",
      description: "Managing operations and building strong partnerships with service providers and customers.",
      expertise: ["Operations Management", "Partnership Development", "Quality Assurance"],
      rating: 4.9,
      reviews: 156,
      email: "muhammad.khan@aaaservices.com",
      phone: "+92-300-3456789",
      linkedin: "https://linkedin.com/in/muhammadalikhan",
      facebook: "https://facebook.com/muhammadalikhan"
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>We're here to help and answer any questions you might have</p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <h3>Email Us</h3>
              <p>Have any inquiries? Send us an email</p>
              <a href="mailto:aaaservices@gmail.com" className="contact-link">
                aaaservices@gmail.com
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <h3>Call Us</h3>
              <p>Speak directly with our team</p>
              <a href="tel:+923224399586" className="contact-link">
                +92 322 4399586
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Visit Us</h3>
              <p>Our main office location</p>
              <span className="contact-text">
                Lahore, Pakistan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Co-Founders Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Co-Founders</h2>
            <p>The visionary leaders behind AAA Services platform</p>
          </div>
          
          <div className="team-grid">
            {coFounders.map((founder) => (
              <div key={founder.id} className="team-card">
                <div className="member-image">
                  <img src={founder.image} alt={founder.name} />
                  <div className="member-overlay">
                    <div className="social-links">
                      <a href={`mailto:${founder.email}`} className="social-link" title="Email">
                        <FaEnvelope />
                      </a>
                      <a href={`tel:${founder.phone}`} className="social-link" title="Call">
                        <FaPhone />
                      </a>
                      <a href={founder.linkedin} className="social-link" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin />
                      </a>
                      <a href={founder.facebook} className="social-link" title="Facebook" target="_blank" rel="noopener noreferrer">
                        <FaFacebook />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="member-info">
                  <h3 className="member-name">{founder.name}</h3>
                  <p className="member-position">{founder.position}</p>
                  
                  <div className="member-rating">
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FaStar 
                          key={star} 
                          className={star <= Math.floor(founder.rating) ? 'star filled' : 'star'} 
                        />
                      ))}
                    </div>
                    <span className="rating-text">{founder.rating} ({founder.reviews} reviews)</span>
                  </div>
                  
                  <p className="member-description">{founder.description}</p>
                  
                  <div className="member-expertise">
                    {founder.expertise.map((skill, index) => (
                      <span key={index} className="expertise-tag">{skill}</span>
                    ))}
                  </div>
                  
                  <div className="member-contact">
                    <a href={`mailto:${founder.email}`} className="contact-btn email">
                      <FaEnvelope /> Email
                    </a>
                    <a href={`tel:${founder.phone}`} className="contact-btn phone">
                      <FaPhone /> Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-number">10K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-number">4.8</div>
              <div className="stat-label">Average Rating</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FaHandshake />
              </div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Service Providers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;