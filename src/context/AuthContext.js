import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'customer' or 'business'

  // Set up axios interceptor for JWT tokens
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    axios.defaults.baseURL = API_BASE_URL;
  }, []);

  // Check authentication on page reload
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await axios.get('/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const currentUser = response.data.user;
          
          setUser(currentUser);
          setIsAuthenticated(true);
          setUserType(currentUser.userType || 'customer');
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
          setUserType(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      const { user: registeredUser, token } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(registeredUser);
      setUserType(registeredUser.userType || 'customer');
      setIsAuthenticated(true);

      return { success: true, user: registeredUser };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user: loggedInUser, token } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(loggedInUser);
      setUserType(loggedInUser.userType || 'customer');
      setIsAuthenticated(true);

      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      
      // Return specific error messages based on the response
      if (error.response?.status === 403) {
        return { 
          success: false, 
          message: error.response.data?.error || 'Access denied',
          userType: error.response.data?.userType
        };
      } else if (error.response?.status === 401) {
        return { 
          success: false, 
          message: error.response.data?.error || 'Invalid email or password' 
        };
      } else if (error.response?.status === 400) {
        return { 
          success: false, 
          message: error.response.data?.message || 'Please fill in all required fields' 
        };
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        return { 
          success: false, 
          message: 'Network error. Please check your internet connection.' 
        };
      } else {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed. Please try again.' 
        };
      }
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
    return true;
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/users/profile', profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedUser = response.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  // Update user profile picture
  const updateProfilePicture = async (profilePicture) => {
    try {
      const response = await axios.put('/users/profile-picture', 
        { profilePicture }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedUser = response.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile picture update error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return {
        success: false,
        message: error.response?.data?.message || 'Profile picture update failed'
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    userType,
    loading,
    login,
    logout,
    register,
    updateProfile,
    updateProfilePicture,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
