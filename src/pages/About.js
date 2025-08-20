import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About Us</h1>
        <p>Learn more about our mission and values</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>We are dedicated to connecting people with the best services and professionals in the industry. Our platform is designed to make it easy for users to find reliable service providers and for professionals to showcase their skills.</p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <ul className="values-list">
            <li>Transparency</li>
            <li>Reliability</li>
            <li>Customer Satisfaction</li>
            <li>Professionalism</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>Verified Professionals</h3>
              <p>All service providers on our platform are verified and rated by our users.</p>
            </div>
            <div className="feature-item">
              <h3>Easy Booking</h3>
              <p>Quick and simple booking process with instant confirmation.</p>
            </div>
            <div className="feature-item">
              <h3>24/7 Support</h3>
              <p>Our support team is always available to help you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;