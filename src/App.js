import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { PrivateRoute } from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';
import './App.css';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const BusinessDirectory = lazy(() => import('./pages/BusinessDirectory'));
const ServiceProviders = lazy(() => import('./pages/ServiceProviders'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const ClientLogin = lazy(() => import('./pages/Login'));
const ServiceProviderLogin = lazy(() => import('./pages/ServiceProviderLogin'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const WriteReview = lazy(() => import('./pages/WriteReview'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServiceProviderSignup = lazy(() => import('./pages/ServiceProviderSignup'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const BusinessProfileEdit = lazy(() => import('./pages/BusinessProfileEdit'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const Inbox = lazy(() => import('./components/Inbox'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Guest route component to redirect authenticated users
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    // Always redirect to home page for all authenticated users
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/businesses" element={<BusinessDirectory />} />
          <Route path="/business/:businessId" element={<BusinessProfile />} />
          <Route path="/service-providers/:serviceId" element={<ServiceProviders />} />
          <Route path="/provider/:serviceId/:providerId" element={<BusinessProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/complaint" element={<ComplaintPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={
            <GuestRoute>
              <ClientLogin />
            </GuestRoute>
          } />
          <Route path="/service-provider/login" element={
            <GuestRoute>
              <ServiceProviderLogin />
            </GuestRoute>
          } />
          <Route path="/signup" element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          } />
          <Route path="/service-provider-signup" element={
            <GuestRoute>
              <ServiceProviderSignup />
            </GuestRoute>
          } />
          <Route path="/business-signup" element={
            <GuestRoute>
              <ServiceProviderSignup />
            </GuestRoute>
          } />

          {/* Protected Client Routes */}
          <Route path="/profile" element={
            <PrivateRoute requiredUserType="customer">
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/write-review/:providerId" element={
            <PrivateRoute requiredUserType="customer">
              <WriteReview />
            </PrivateRoute>
          } />

          {/* Protected Business Routes */}
          <Route path="/business/dashboard" element={
            <PrivateRoute requiredUserType="business">
              <BusinessDashboard />
            </PrivateRoute>
          } />
          <Route path="/business-dashboard" element={
            <PrivateRoute requiredUserType="business">
              <BusinessDashboard />
            </PrivateRoute>
          } />
          <Route path="/business/profile" element={
            <PrivateRoute requiredUserType="business">
              <BusinessProfile />
            </PrivateRoute>
          } />
          <Route path="/business/inbox" element={
            <PrivateRoute requiredUserType="business">
              <Inbox />
            </PrivateRoute>
          } />
          <Route path="/edit-business/:businessId" element={
            <PrivateRoute requiredUserType="business">
              <BusinessProfileEdit />
            </PrivateRoute>
          } />

          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          } />
          <Route path="/reset-password" element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<Home/>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
