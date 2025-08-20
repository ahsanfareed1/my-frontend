import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ComplaintPage.css';

const ComplaintPage = () => {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (formData) => {
    // In a real application, you would make an API call here
    console.log('Submitting complaint:', formData);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Save to localStorage for demo purposes
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        complaints.push({
          id: Date.now().toString(),
          ...formData,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('complaints', JSON.stringify(complaints));
        
        console.log('Complaint submitted successfully');
        toast.success('Your complaint has been submitted successfully!');
        setIsSubmitted(true);
        resolve();
      }, 1000);
    });
  };

  const handleCancel = () => {
    navigate('/home'); // Go back to home
  };

  if (isSubmitted) {
    return (
      <div className="complaint-success">
        <h2>Complaint Submitted Successfully!</h2>
        <p>Thank you for your feedback. We take all complaints seriously and will review your submission shortly.</p>
        <p>Your complaint reference number is: <strong>CP-{Date.now().toString().slice(-6)}</strong></p>
        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              setIsSubmitted(false);
              window.scrollTo(0, 0);
            }}
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-page">
      <div className="complaint-container">
        <button 
          className="back-button"
          onClick={handleCancel}
        >
        <i className="fas fa-arrow-left"> Back</i>
        </button>
        <h1>File a Complaint</h1>
        <p className="page-description">
          We're sorry to hear you're having issues. Please fill out the form below to submit 
          a complaint about a service provider. Our team will review your complaint and take 
          appropriate action.
        </p>
        
        <ComplaintForm 
          serviceProviderId={providerId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ComplaintPage;
