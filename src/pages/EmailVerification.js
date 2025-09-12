import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // status: verifying | success | error
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendUserType, setResendUserType] = useState('business');
  const [isVerifying, setIsVerifying] = useState(false); // Prevent multiple requests
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setError('No verification token provided. Please check your email for the verification link.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    if (isVerifying) {
      // already verifying, dobara request na bhejein
      return;
    }
    setIsVerifying(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}?t=${Date.now()}`);
      // pehle check karein agr pehle se verified hai
      if (response.data.alreadyVerified) {
        setVerificationStatus('already-verified');
        setMessage(response.data.message || 'Your email is already verified. You can login now.');
        setUserType(response.data.userType || '');
        setUserEmail(response.data.userEmail || '');
        setError('');
        setShowResendForm(false);
        toast.dismiss();
        toast.info('Your email is already verified!');
        return;
      }
      if (response.data.success && response.data.message) {
        setVerificationStatus('success');
        setMessage('Your email has been verified successfully. You can now login.');
        setUserType(response.data.userType || '');
        setUserEmail(response.data.userEmail || '');
        setError('');
        setShowResendForm(false);
        toast.dismiss();
        toast.success('Email verified successfully!');
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (error) {
      const already = error.response?.data?.alreadyVerified;
      if (already) {
        setVerificationStatus('already-verified');
        setMessage('Your email is already verified. You can login now.');
        setUserType(error.response?.data?.userType || '');
        setUserEmail(error.response?.data?.userEmail || '');
        setError('');
        setShowResendForm(false);
        toast.dismiss();
        toast.info('Your email is already verified!');
      } else {
        setVerificationStatus('error');
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to verify email';
        setError(errorMsg);
        setMessage('');
        toast.dismiss();
        toast.error(errorMsg);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToLogin = () => {
    const loginPath = userType === 'business' ? '/business/login' : '/login';
    navigate(loginPath);
  };

  const handleResendVerification = async () => {
    try {
      // pehle token se user info nikalne ki koshish
      let email = userEmail;
      let userTypeForResend = userType;
      
      if (!email && token) {
        try {
          const userInfoResponse = await axios.get(`http://localhost:5000/api/auth/verify-email-info/${token}`);
          email = userInfoResponse.data.userEmail;
          userTypeForResend = userInfoResponse.data.userType;
        } catch (userInfoError) {
          // agr token se info na mile to manual form dikhayein
          setShowResendForm(true);
          return;
        }
      }
      
      if (!email) {
        setShowResendForm(true);
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/auth/resend-verification', {
        email: email,
        userType: userTypeForResend || 'business'
      });
      
      if (response.data.message) {
        toast.success('Verification email sent successfully!');
        setMessage(response.data.message);
        if (response.data.note) {
          setMessage(prev => prev + ' ' + response.data.note);
        }
        setShowResendForm(false);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to resend verification email';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const handleManualResend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/resend-verification', {
        email: resendEmail,
        userType: resendUserType
      });
      
      if (response.data.message) {
        toast.success('Verification email sent successfully!');
        setMessage(response.data.message);
        if (response.data.note) {
          setMessage(prev => prev + ' ' + response.data.note);
        }
        setShowResendForm(false);
        setResendEmail('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to resend verification email';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="loading-state">
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="auth-container">
        <div className="auth-form text-center">
          <div className="success-state">
            <FaCheckCircle className="success-icon" />
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
          </div>
          
          <div className="auth-footer">
            <p>You can now login to your account</p>
            <Link 
              to={userType === 'business' ? '/business/login' : '/login'} 
              className="auth-link"
            >
              Go to {userType === 'business' ? 'Business Login' : 'Login'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'already-verified') {
    return (
      <div className="auth-container">
        <div className="auth-form text-center">
          <div className="success-state">
            <FaCheckCircle className="success-icon" />
            <h2>Email Already Verified!</h2>
            <p>{message}</p>
          </div>
          
          <div className="auth-footer">
            <p>Your account is ready to use</p>
            <Link 
              to={userType === 'business' ? '/business/login' : '/login'} 
              className="auth-button"
            >
              Go to {userType === 'business' ? 'Business Login' : 'Login'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <button 
            onClick={handleBackToLogin}
            className="back-button"
            type="button"
          >
            <FaArrowLeft />
            Back to Login
          </button>
          <h2>Email Verification Failed</h2>
          <p>The email verification link could not be processed.</p>
        </div>
        
        <div className="error-message">
          <FaExclamationTriangle className="error-icon" />
          <span>{error}</span>
        </div>
        
        <div className="auth-footer">
          <p>Need help? You can:</p>
          <button 
            onClick={handleResendVerification}
            className="auth-link"
            type="button"
          >
            Request a new verification link
          </button>
        </div>
        
        {showResendForm && (
          <div className="resend-form">
            <h3>Request New Verification Email</h3>
            <form onSubmit={handleManualResend}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={resendUserType}
                  onChange={(e) => setResendUserType(e.target.value)}
                >
                  <option value="business">Business Account</option>
                  <option value="customer">Customer Account</option>
                </select>
              </div>
              <button type="submit" className="auth-button">
                Send Verification Email
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
