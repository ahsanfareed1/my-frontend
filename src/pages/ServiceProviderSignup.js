import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ServiceCategorySelector from '../components/ServiceCategorySelector';
import './Signup.css';

// Pakistani cities data
const pakistaniCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot',
  'Sargodha', 'Bahawalpur', 'Sukkur', 'Jhang', 'Sheikhupura', 'Larkana', 'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Mardan',
  'Mingora', 'Nawabshah', 'Chiniot', 'Kotri', 'Khanpur', 'Hafizabad', 'Kohat', 'Jacobabad', 'Shikarpur', 'Muzaffargarh',
  'Khanewal', 'Hassan Abdal', 'Kamoke', 'Sahiwal', 'Gothki', 'Dera Ghazi Khan', 'Nowshera', 'Chaman', 'Kot Addu', 'Turbat',
  'Muzaffarabad', 'Abbottabad', 'Jhelum', 'Mansehra', 'Battagram', 'Kotli', 'Vehari', 'Tando Allahyar', 'Mirpur Khas', 'Nawabshah',
  'Chishtian', 'Jatoi', 'Ahmadpur East', 'Kamalia', 'Wazirabad', 'Attock', 'Vihari', 'Jampur', 'Mianwali', 'Chakwal',
  'Toba Tek Singh', 'Narowal', 'Shujaabad', 'Khushab', 'Kabirwala', 'Hasilpur', 'Charsadda', 'Bhakkar', 'Chichawatni', 'Kharian',
  'Mian Channu', 'Bhalwal', 'Zahir Pir', 'Dera Ismail Khan', 'Parachinar', 'Gwadar', 'Kandhkot', 'Abdul Hakim', 'Hassan Abdal', 'Lakki Marwat',
  'Layyah', 'Chamber', 'Dipalpur', 'Shahdadkot', 'Pishin', 'Sanghar', 'Umerkot', 'Chak Jhumra', 'Qila Abdullah', 'Haripur',
  'Khairpur', 'Kotri', 'Uch', 'Shahdadpur', 'Jhal Magsi', 'Jati', 'Matiari', 'Malir Cantonment', 'Vihari', 'Naushahro Feroze'
];

// Service categories are now fetched from the API via ServiceCategorySelector component

// Map UI categories to backend enum business types
const mapCategoryToBusinessType = (categoryName) => {
  console.log('🔍 DEBUG mapCategoryToBusinessType input:', categoryName);
  const key = (categoryName || '').toLowerCase();
  console.log('🔍 DEBUG mapCategoryToBusinessType key:', key);
  
  // Plumbing & Water Services
  if (key.includes('plumb') || key.includes('water') || key.includes('pipe') || key.includes('drain')) return 'plumbing';
  
  // Electrical Services
  if (key.includes('electric') || key.includes('wiring') || key.includes('power') || key.includes('light')) return 'electrical';
  
  // Cleaning Services
  if (key.includes('clean') || key.includes('housekeeping') || key.includes('janitorial')) return 'cleaning';
  
  // Painting Services
  if (key.includes('paint') || key.includes('wall') || key.includes('coating') || key.includes('finish')) return 'painting';
  
  // Gardening & Landscaping
  if (key.includes('garden') || key.includes('lawn') || key.includes('landscape') || key.includes('outdoor') || key.includes('yard')) return 'gardening';
  
  // Repair & Maintenance
  if (key.includes('repair') || key.includes('fix') || key.includes('maintenance') || key.includes('restore')) return 'repair';
  
  // Transport Services
  if (key.includes('transport') || key.includes('moving') || key.includes('delivery') || key.includes('shipping') || key.includes('logistics')) return 'transport';
  
  // Security Services
  if (key.includes('security') || key.includes('guard') || key.includes('safety') || key.includes('protection') || key.includes('lock')) return 'security';
  
  // Education & Training
  if (key.includes('education') || key.includes('tutor') || key.includes('training') || key.includes('learning') || key.includes('course') || key.includes('school')) return 'education';
  
  // Food Services
  if (key.includes('food') || key.includes('cater') || key.includes('restaurant') || key.includes('cooking') || key.includes('meal') || key.includes('dining')) return 'food';
  
  // Beauty & Personal Care
  if (key.includes('beauty') || key.includes('salon') || key.includes('spa') || key.includes('grooming') || key.includes('cosmetic') || key.includes('hair')) return 'beauty';
  
  // Health & Medical
  if (key.includes('health') || key.includes('medical') || key.includes('fitness') || key.includes('wellness') || key.includes('therapy') || key.includes('care')) return 'health';
  
  // Construction Services
  if (key.includes('construct') || key.includes('building') || key.includes('renovation') || key.includes('remodel') || key.includes('contractor')) return 'construction';
  
  // Roofing Services
  if (key.includes('roof') || key.includes('shingle') || key.includes('gutter')) return 'roofing';
  
  // Maintenance Services
  if (key.includes('maint') || key.includes('facility') || key.includes('upkeep')) {
    console.log('🔍 DEBUG mapCategoryToBusinessType returning: maintenance');
    return 'maintenance';
  }
  
  // Legal Services
  if (key.includes('legal') || key.includes('law') || key.includes('attorney') || key.includes('lawyer') || key.includes('counsel')) return 'legal';
  
  // Accounting Services
  if (key.includes('accounting') || key.includes('bookkeeping') || key.includes('finance') || key.includes('tax') || key.includes('audit') || key.includes('cpa')) {
    console.log('🔍 DEBUG mapCategoryToBusinessType returning: accounting');
    return 'accounting';
  }
  
  // Automotive Services
  if (key.includes('automotive') || key.includes('car') || key.includes('vehicle') || key.includes('auto') || key.includes('mechanic') || key.includes('wash') || key.includes('detailing')) return 'automotive';
  
  // IT & Technology
  if (key.includes('it') || key.includes('technology') || key.includes('tech') || key.includes('computer') || key.includes('software') || key.includes('digital')) return 'technology';
  
  // Business Services
  if (key.includes('business') || key.includes('consulting') || key.includes('professional') || key.includes('corporate') || key.includes('management')) return 'business';
  
  // Pet Services
  if (key.includes('pet') || key.includes('animal') || key.includes('veterinary') || key.includes('grooming') || key.includes('dog') || key.includes('cat')) return 'pet';
  
  // Pest Control
  if (key.includes('pest') || key.includes('exterminator') || key.includes('bug') || key.includes('insect') || key.includes('rodent')) return 'pest';
  
  // Marketing Services
  if (key.includes('marketing') || key.includes('advertising') || key.includes('seo') || key.includes('social media') || key.includes('digital marketing')) return 'marketing';
  
  // Medical Services
  if (key.includes('medical') || key.includes('doctor') || key.includes('physician') || key.includes('clinic')) return 'medical';
  
  // Dental Services
  if (key.includes('dental') || key.includes('dentist') || key.includes('tooth') || key.includes('oral')) return 'dental';
  
  // Fitness Services
  if (key.includes('fitness') || key.includes('gym') || key.includes('workout') || key.includes('training') || key.includes('exercise')) return 'fitness';
  
  // Tutoring Services
  if (key.includes('tutor') || key.includes('academic') || key.includes('homework') || key.includes('study')) return 'tutoring';
  
  // Language Learning
  if (key.includes('language') || key.includes('linguistic') || key.includes('translation')) return 'language';
  
  // Event Services
  if (key.includes('event') || key.includes('wedding') || key.includes('party') || key.includes('celebration')) return 'event';
  
  // Photography Services
  if (key.includes('photography') || key.includes('photographer') || key.includes('photo') || key.includes('camera')) return 'photography';
  
  // Entertainment Services
  if (key.includes('entertainment') || key.includes('dj') || key.includes('music') || key.includes('performance')) return 'entertainment';
  
  // Financial Services
  if (key.includes('financial') || key.includes('investment') || key.includes('retirement') || key.includes('wealth')) return 'financial';
  
  // Insurance Services
  if (key.includes('insurance') || key.includes('coverage') || key.includes('policy') || key.includes('protection')) return 'insurance';
  
  // Default fallback
  console.log('🔍 DEBUG mapCategoryToBusinessType returning: other (fallback)');
  return 'other';
};

const ServiceProviderSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // User details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business details
    businessName: '',
    serviceCategory: '',
    yearsOfExperience: '',
    description: '',
    address: '',
    city: '',
    website: '',
    
    // Business hours
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false }
    },
    
    // Additional services
    additionalServices: [],
    
    // Images
    profilePicture: null,
    coverPhotos: [],
    imagePreview: '',
    coverPreviews: []
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(pakistaniCities);
  const [isDropdownInteracting, setIsDropdownInteracting] = useState(false);
  const navigate = useNavigate();
  const { user, userType } = useContext(AuthContext);

  // City search functionality
  const handleCitySearch = (searchTerm) => {
    setCitySearchTerm(searchTerm);
    const filtered = pakistaniCities.filter(city => 
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
    setShowCityDropdown(true);
  };

  const selectCity = (city) => {
    setFormData(prev => ({ ...prev, city }));
    setCitySearchTerm(city);
    setShowCityDropdown(false);
  };

  const handleCityInputFocus = () => {
    setShowCityDropdown(true);
    setFilteredCities(pakistaniCities);
  };

  const handleCityInputBlur = () => {
    // Delay hiding dropdown to allow clicking on options (increased timeout for touchpad)
    setTimeout(() => {
      if (!isDropdownInteracting) {
        setShowCityDropdown(false);
      }
    }, 300);
  };

  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Clear any previous errors
      setError('');

      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      
      // Store a reference to setFormData that will be available in the callback
      const updateFormData = setFormData;
      
      reader.onload = (event) => {
        try {
          updateFormData(prev => ({
            ...prev,
            profilePicture: file,
            imagePreview: event.target.result
          }));
        } catch (err) {
          console.error('Error updating form data:', err);
          setError('Failed to process the image');
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the image file');
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error in handleImageChange:', err);
      setError('An error occurred while processing the image');
    }
  };

  const handleCoverPhotoChange = (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Clear any previous errors
      setError('');

      // Validate number of images
      if (formData.coverPhotos.length + files.length > 5) {
        setError('You can only upload up to 5 photos');
        return;
      }

      // Validate each file
      for (const file of files) {
        if (!file.type.match('image.*')) {
          setError('Please select valid image files (JPEG, PNG, etc.)');
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('Each image size should be less than 5MB');
          return;
        }
      }

      const newCoverPhotos = [...formData.coverPhotos];
      const newCoverPreviews = [...formData.coverPreviews];

      // Process each file
      files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            newCoverPhotos.push(file);
            newCoverPreviews.push(event.target.result);
            
            // Update form data when all files are processed
            if (newCoverPhotos.length === formData.coverPhotos.length + files.length) {
              setFormData(prev => ({
                ...prev,
                coverPhotos: newCoverPhotos,
                coverPreviews: newCoverPreviews
              }));
            }
          } catch (err) {
            console.error('Error updating cover photos data:', err);
            setError('Failed to process cover photos');
          }
        };
        
        reader.onerror = () => {
          setError('Failed to read cover photo files');
        };
        
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Error in handleCoverPhotoChange:', err);
      setError('An error occurred while processing cover photos');
    }
  };

  const removeCoverPhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      coverPhotos: prev.coverPhotos.filter((_, i) => i !== index),
      coverPreviews: prev.coverPreviews.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      handleImageChange(e);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAdditionalServiceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const addAdditionalService = () => {
    setFormData(prev => ({
      ...prev,
      additionalServices: [
        ...prev.additionalServices,
        {
          serviceTitle: '',
          serviceDescription: '',
          pricing: {
            type: 'fixed',
            amount: 0,
            currency: 'PKR',
            unit: undefined // Don't set unit for non-hourly services
          }
        }
      ]
    }));
  };

  const removeAdditionalService = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      // User details validation
      if (!formData.name.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      // Check if customer is trying to use their customer email for business registration
      if (user && userType === 'customer' && user.email && 
          formData.email.toLowerCase().trim() === user.email.toLowerCase().trim()) {
        setError('Please use your business email address instead of your customer email. Use a different email for your business registration.');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return false;
      }
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      // City is collected and validated in Step 2
      return true;
      
    } else if (step === 2) {
      // Business details validation
      if (!formData.businessName.trim()) {
        setError('Business name is required');
        return false;
      }
      if (!formData.serviceCategory) {
        setError('Please select a service category');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Business address is required');
        return false;
      }
      if (!citySearchTerm.trim()) {
        setError('City is required');
        return false;
      }
      // Optional: description minimum for better profiles
      if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 20) {
        setError('Description must be at least 20 characters long');
        return false;
      }
      return true;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    // IMMEDIATELY clear any existing errors and set submitting state
    setError('');
    setIsSuccess(false);
    setIsSubmitting(true);
    
    console.log('🔍 Frontend: Starting registration - cleared all states');

    try {
      // Split full name into first/last
      const trimmedName = formData.name.trim();
      const firstSpace = trimmedName.indexOf(' ');
      const firstName = firstSpace === -1 ? trimmedName : trimmedName.slice(0, firstSpace);
      const lastName = firstSpace === -1 ? 'Provider' : trimmedName.slice(firstSpace + 1) || 'Provider';

      const selectedCategory = formData.serviceCategory;
      console.log('🔍 DEBUG: selectedCategory:', selectedCategory);
      console.log('🔍 DEBUG: selectedCategory.name:', selectedCategory?.name);
      console.log('🔍 DEBUG: selectedCategory.slug:', selectedCategory?.slug);
      const businessType = selectedCategory ? mapCategoryToBusinessType(selectedCategory.name) : 'other';
      console.log('🔍 DEBUG: mapped businessType:', businessType);

      // Convert images to base64 strings for backend storage
      const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Convert all images to base64
      const profilePictureBase64 = await convertImageToBase64(formData.profilePicture);

      // Convert cover photos to base64
      const coverPhotosBase64 = await Promise.all(
        formData.coverPhotos.map(file => convertImageToBase64(file))
      );

      // Build payload that backend expects
      const payload = {
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim(),
        location: {
          city: (citySearchTerm || '').trim(),
          address: (formData.address || '').trim() || undefined
        },
        businessName: formData.businessName.trim(),
        businessType,
        description: (formData.description && formData.description.trim().length >= 20)
          ? formData.description.trim()
          : `Professional ${selectedCategory?.name || 'service'} provider in ${citySearchTerm}`,
        businessContact: {
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          website: formData.website.trim() || undefined
        },
        businessLocation: {
          address: formData.address.trim(),
          city: citySearchTerm.trim()
        },
        businessHours: formData.businessHours,
        services: [
          {
            name: selectedCategory?.name || 'Service',
            description: `Quality ${selectedCategory?.name || 'service'} for homes and businesses`,
            priceType: 'negotiable',
            currency: 'PKR'
          }
        ],
        additionalServices: formData.additionalServices.filter(service => 
          service.serviceTitle && service.serviceTitle.trim() && 
          service.serviceDescription && service.serviceDescription.trim() &&
          service.pricing && service.pricing.type &&
          (service.pricing.type === 'negotiable' || 
           (service.pricing.type === 'fixed' && service.pricing.amount > 0) ||
           (service.pricing.type === 'hourly' && service.pricing.amount > 0 && service.pricing.unit))
        ).map(service => {
          const pricing = {
            type: service.pricing.type,
            currency: 'PKR'
          };
          
          // Only add amount for fixed and hourly pricing
          if (service.pricing.type !== 'negotiable') {
            pricing.amount = service.pricing.amount;
          }
          
          // Only add unit for hourly pricing
          if (service.pricing.type === 'hourly') {
            pricing.unit = service.pricing.unit;
          }
          
          return {
            serviceTitle: service.serviceTitle.trim(),
            serviceDescription: service.serviceDescription.trim(),
            pricing
          };
        }),
        images: {
          logo: profilePictureBase64,
          cover: coverPhotosBase64.filter(img => img !== null)
        }
      };

      // Debug logging
      console.log('🔍 Frontend payload debug:');
      console.log('📝 Form data additional services:', JSON.stringify(formData.additionalServices, null, 2));
      console.log('📝 Additional services being sent:', JSON.stringify(payload.additionalServices, null, 2));
      console.log('📝 Full payload:', JSON.stringify(payload, null, 2));

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('http://localhost:5000/api/auth/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('🔍 Frontend: Registration response status:', response.status);
      console.log('🔍 Frontend: Response headers:', response.headers);
      console.log('🔍 Frontend: Response ok:', response.ok);

      let data;
      try {
        data = await response.json();
        console.log('🔍 Frontend: Registration response data:', data);
      } catch (jsonError) {
        console.error('🔍 Frontend: JSON parsing error:', jsonError);
        const textResponse = await response.text();
        console.log('🔍 Frontend: Raw response text:', textResponse);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        console.log('🔍 Frontend: Registration failed with status:', response.status);
        console.log('🔍 Frontend: Response not ok, data:', data);
        if (data && (data.errors || data.error)) {
          const msg = Array.isArray(data.errors) ? data.errors.join('\n') : (data.error || data.message);
          throw new Error(msg || 'Registration failed');
        }
        throw new Error('Registration failed');
      }

      // SUCCESS! Set success state IMMEDIATELY and clear all errors
      console.log('🔍 Frontend: SUCCESS! Setting success state immediately');
      
      // Force success state update
      setError('');
      setIsSuccess(true);
      setIsSubmitting(false);
      
      // Persist success message
      const successMsg = data.message || 'Thank you for registering your business with us! Please check your email to verify your account before you can login.';
      sessionStorage.setItem('sp_signup_success', successMsg);
      
      console.log('🔍 Frontend: SUCCESS STATE SET - Registration completed successfully!');
      console.log('🔍 Frontend: Success message:', successMsg);
      
      // Try navigation after a small delay
      setTimeout(() => {
        try {
          navigate('/signup/success');
        } catch (navError) {
          console.log('🔍 Frontend: Navigation failed, success message will show');
        }
      }, 200);
    } catch (err) {
      console.error('Registration error:', err);
      
      console.log('🔍 Frontend: Error caught:', err.message);
      
      // Only set error if we're not already in success state
      if (!isSuccess) {
        console.log('🔍 Frontend: Setting error state');
        if (err.name === 'AbortError') {
          setError('Registration request timed out. Please check your connection and try again.');
        } else if (err.message.includes('Invalid response format')) {
          setError('Server returned an invalid response. Please try again.');
        } else if (err.message.includes('Failed to fetch')) {
          setError('Unable to connect to server. Please check your internet connection.');
        } else if (err.message.includes('Email already registered')) {
          setError('Email already registered. Please use a different email or try logging in.');
        } else {
          setError(err.message || 'Failed to register. Please check your information and try again.');
        }
      } else {
        console.log('🔍 Frontend: Error occurred but success state is already set, ignoring error');
      }
    } finally {
      if (!isSuccess) {
        setIsSubmitting(false);
      }
    }
  };

  // Debug logging
  console.log('🔍 Frontend: Render - isSuccess:', isSuccess, 'error:', error);

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Become a Service Provider</h2>
          {error && !isSuccess && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
              {error.includes('Email already registered') && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <a href="/login" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                    Login instead
                  </a>
                  <span style={{ color: '#666' }}>or</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setError('');
                      setFormData(prev => ({ ...prev, email: '' }));
                      document.querySelector('input[name="email"]')?.focus();
                    }}
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid #4CAF50', 
                      color: '#4CAF50', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Use different email
                  </button>
                </div>
              )}
            </div>
          )}
          {(isSuccess || sessionStorage.getItem('sp_signup_success')) && (
            <div className="success-message" style={{
              background: '#4CAF50',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '24px' }}></i>
                <span>🎉 Registration Successful! 🎉</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'normal' }}>
                Your business has been registered successfully!<br/>
                Please check your email to verify your account.
              </div>
              <button 
                onClick={() => navigate('/signup/success')}
                style={{
                  background: 'white',
                  color: '#4CAF50',
                  border: '2px solid white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Continue to Success Page →
              </button>
            </div>
          )}
          <div className="progress-bar">
            {[1, 2, 3].map((stepNum) => (
              <div 
                key={stepNum} 
                className={`progress-step ${step === stepNum ? 'active' : ''}`}
              >
                <div className="step-number">{stepNum}</div>
                <div className="step-label">
                  {stepNum === 1 ? 'Personal Info' : stepNum === 2 ? 'Business Info' : 'Review'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {step === 1 && (
            <div className="form-step">
              <h2 className="step-title">Personal Information</h2>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={user && userType === 'customer' ? "Enter your business email (different from customer email)" : "Enter your email"}
                  required
                />
                {user && userType === 'customer' && (
                  <small className="form-hint">
                    Please use a different email address for your business registration, not your customer account email.
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  required
                />
              </div>
              <div className="form-group">
                <label>Create Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <div className="form-navigation">
                <button type="button" className="nav-button primary" onClick={nextStep}>
                  Next: Business Details
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="form-step">
              <h2 className="step-title">Business Information</h2>
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Your business name"
                  required
                />
              </div>
              <div className="form-group">
                <ServiceCategorySelector
                  selectedCategory={formData.serviceCategory}
                  onCategorySelect={(category) => setFormData(prev => ({ ...prev, serviceCategory: category }))}
                  placeholder="Select a service category"
                  required={true}
                />
              </div>
              <div className="form-group">
                <label>Business Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <div className="city-dropdown-container">
                  <input
                    type="text"
                    name="city"
                    value={citySearchTerm}
                    onChange={(e) => handleCitySearch(e.target.value)}
                    onFocus={handleCityInputFocus}
                    onBlur={handleCityInputBlur}
                    placeholder="Search and select your city"
                    required
                    className="city-search-input"
                  />
                  {showCityDropdown && (
                    <div className="city-dropdown">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city, index) => (
                          <div
                            key={index}
                            className="city-option"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setIsDropdownInteracting(true);
                              selectCity(city);
                              setTimeout(() => setIsDropdownInteracting(false), 100);
                            }}
                            onClick={() => selectCity(city)}
                            onMouseEnter={() => setIsDropdownInteracting(true)}
                            onMouseLeave={() => setIsDropdownInteracting(false)}
                          >
                            {city}
                          </div>
                        ))
                      ) : (
                        <div className="city-option no-results">
                          No cities found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Website (Optional)</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>
              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your business"
                  rows="4"
                ></textarea>
              </div>

              {/* Business Hours Section */}
              <div className="form-group">
                <label>Business Hours</label>
                <div className="business-hours-container">
                  {Object.entries(formData.businessHours).map(([day, hours]) => (
                    <div key={day} className="day-row">
                      <div className="day-label">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                          className="day-checkbox"
                        />
                        <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      </div>
                      {!hours.closed && (
                        <div className="time-inputs">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="time-input"
                          />
                          <span className="time-separator">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="time-input"
                          />
                        </div>
                      )}
                      {hours.closed && (
                        <span className="closed-label">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Services Section */}
              <div className="form-group">
                <label>Additional Services (Optional)</label>
                <p className="field-description">Add specific services you offer with pricing details</p>
                
                {formData.additionalServices.map((service, index) => (
                  <div key={index} className="additional-service-card">
                    <div className="service-header">
                      <h4>Service {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAdditionalService(index)}
                        className="remove-service-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="service-fields">
                      <input
                        type="text"
                        placeholder="Service Title (e.g., Solar Installation)"
                        value={service.serviceTitle}
                        onChange={(e) => handleAdditionalServiceChange(index, 'serviceTitle', e.target.value)}
                        className="service-input"
                      />
                      
                      <textarea
                        placeholder="Service Description"
                        value={service.serviceDescription}
                        onChange={(e) => handleAdditionalServiceChange(index, 'serviceDescription', e.target.value)}
                        className="service-textarea"
                        rows="3"
                      />
                      
                      <div className="pricing-section">
                        <select
                          value={service.pricing.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const newPricing = {
                              ...service.pricing,
                              type: newType
                            };
                            
                            // Auto-set unit for hourly pricing
                            if (newType === 'hourly' && !service.pricing.unit) {
                              newPricing.unit = 'per hour';
                            }
                            
                            handleAdditionalServiceChange(index, 'pricing', newPricing);
                          }}
                          className="pricing-type-select"
                        >
                          <option value="fixed">Fixed Price</option>
                          <option value="hourly">Hourly Rate</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                        
                        {(service.pricing.type === 'fixed' || service.pricing.type === 'hourly') && (
                          <div className="price-input-group">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={service.pricing.amount}
                              onChange={(e) => handleAdditionalServiceChange(index, 'pricing', {
                                ...service.pricing,
                                amount: parseFloat(e.target.value) || 0
                              })}
                              className="price-input"
                              min="0"
                            />
                            <span className="currency-label">PKR</span>
                            {service.pricing.type === 'hourly' && (
                              <select
                                value={service.pricing.unit || 'per hour'}
                                onChange={(e) => handleAdditionalServiceChange(index, 'pricing', {
                                  ...service.pricing,
                                  unit: e.target.value
                                })}
                                className="unit-select"
                              >
                                <option value="per hour">per hour</option>
                                <option value="per day">per day</option>
                                <option value="per month">per month</option>
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addAdditionalService}
                  className="add-service-btn"
                >
                  <i className="fas fa-plus"></i> Add Another Service
                </button>
              </div>
              <div className="form-group">
                <label>Profile Picture *</label>
                <div className="image-upload">
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    required
                  />
                  <label htmlFor="profilePicture" className="file-label">
                    {formData.imagePreview ? (
                      <img src={formData.imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-camera"></i>
                        <span>Upload Profile Picture</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Photos (Optional - Up to 5)</label>
                <div className="gallery-upload">
                  <input
                    type="file"
                    id="coverPhoto"
                    name="coverPhoto"
                    accept="image/*"
                    multiple
                    onChange={handleCoverPhotoChange}
                    className="file-input"
                  />
                  <label htmlFor="coverPhoto" className="file-label">
                    <div className="upload-placeholder">
                      <i className="fas fa-images"></i>
                      <span>Upload Photos</span>
                      <small>Select up to 5 images</small>
                    </div>
                  </label>
                  
                  {formData.coverPreviews && formData.coverPreviews.length > 0 && (
                    <div className="gallery-previews">
                      {formData.coverPreviews.map((preview, index) => (
                        <div key={index} className="gallery-preview-item">
                          <img src={preview} alt={`Photo ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeCoverPhoto(index)}
                            className="remove-gallery-image"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="nav-button secondary" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="nav-button primary" onClick={nextStep}>
                  Next: Review & Submit
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="form-step">
              <h2 className="step-title">Review Your Information</h2>
              <div className="review-section">
                <h3>Personal Information</h3>
                <div className="review-item">
                  <span className="review-label">Name:</span>
                  <span className="review-value">{formData.name}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Email:</span>
                  <span className="review-value">{formData.email}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Phone:</span>
                  <span className="review-value">{formData.phone}</span>
                </div>
                
                <h3>Business Information</h3>
                <div className="review-item">
                  <span className="review-label">Business Name:</span>
                  <span className="review-value">{formData.businessName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Service Category:</span>
                  <span className="review-value">
                    {formData.serviceCategory?.name || 'Not specified'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Address:</span>
                  <span className="review-value">{formData.address}, {citySearchTerm}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Website:</span>
                  <span className="review-value">{formData.website || 'Not specified'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Years of Experience:</span>
                  <span className="review-value">{formData.yearsOfExperience || '0'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Description:</span>
                  <span className="review-value">{formData.description || 'No description provided'}</span>
                </div>
                
                <h3>Images</h3>
                <div className="review-item">
                  <span className="review-label">Profile Picture:</span>
                  <span className="review-value">
                    {formData.profilePicture ? '✓ Uploaded' : 'Not uploaded'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Photos:</span>
                  <span className="review-value">
                    {formData.coverPhotos.length > 0 
                      ? `✓ ${formData.coverPhotos.length} photo(s) uploaded` 
                      : 'No photos uploaded'}
                  </span>
                </div>
                
                <h3>Business Hours</h3>
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="review-item">
                    <span className="review-label">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                    <span className="review-value">
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
                
                {formData.additionalServices.length > 0 && (
                  <>
                    <h3>Additional Services</h3>
                    {formData.additionalServices.map((service, index) => (
                      <div key={index} className="review-service-item">
                        <div className="review-item">
                          <span className="review-label">Service {index + 1}:</span>
                          <span className="review-value">{service.serviceTitle}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Description:</span>
                          <span className="review-value">{service.serviceDescription}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Pricing:</span>
                          <span className="review-value">
                            {service.pricing.type === 'negotiable' ? 'Negotiable' : 
                             `${service.pricing.amount} PKR ${service.pricing.type === 'hourly' ? service.pricing.unit : ''}`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              <div className="form-navigation">
                <button type="button" className="nav-button secondary" onClick={prevStep}>
                  Back
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
        <div className="signup-footer">
          <p>
            Already have a business account? <a className="login-link" href="/service-provider-login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderSignup;
