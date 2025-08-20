import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [serviceProviders, setServiceProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  
  const { admin, logout, getAuthHeaders } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin');
      return;
    }
    fetchDashboardStats();
  }, [admin, navigate]);

  useEffect(() => {
    if (activeTab === 'service-providers') {
      fetchServiceProviders();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  // Reset page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceProviders = async () => {
    try {
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      });
      
      const response = await fetch(`http://localhost:5000/api/admin/service-providers?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setServiceProviders(data.businesses || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      setServiceProviders([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      });
      
      const response = await fetch(`http://localhost:5000/api/admin/reviews?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      setDataLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter
      });
      
      const response = await fetch(`http://localhost:5000/api/admin/complaints?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setComplaints(data.complaints || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setDataLoading(false);
    }
  };

  const updateBusinessStatus = async (businessId, newStatus, reason = '') => {
    // Prompt for reason if suspending or rejecting
    if ((newStatus === 'suspended' || newStatus === 'rejected') && !reason) {
      const userReason = prompt(`Please provide a reason for ${newStatus} this business:`);
      if (!userReason) return; // User cancelled
      reason = userReason;
    }
    
    console.log('Starting updateBusinessStatus:', { businessId, newStatus, reason });
    
    try {
      const headers = getAuthHeaders();
      console.log('Auth headers:', headers);
      
      const requestBody = { status: newStatus, reason };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`http://localhost:5000/api/admin/service-providers/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        console.log('Status update successful, refreshing data...');
        fetchServiceProviders();
        fetchDashboardStats();
      } else {
        console.log('Response not ok, trying to parse error...');
        let errorMessage = 'Unknown error';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
          console.log('Error response data:', data);
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }
        alert(`Failed to update status: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network error in updateBusinessStatus:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/service-providers/${businessId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchServiceProviders();
        fetchDashboardStats();
      } else {
        const data = await response.json();
        alert(`Failed to delete business: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      alert(`Error deleting business: ${error.message}`);
    }
  };

  const updateReviewStatus = async (reviewId, newStatus, reason = '') => {
    try {
      console.log(`Updating review ${reviewId} to status: ${newStatus}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus, reason })
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        console.log('Review status updated successfully');
        await fetchReviews();
        await fetchDashboardStats();
      } else {
        console.error('Failed to update review status:', data.message);
        alert(`Failed to update review status: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      alert(`Error updating review status: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const handleRefresh = async () => {
    if (activeTab === 'overview') {
      await fetchDashboardStats();
    } else if (activeTab === 'service-providers') {
      await fetchServiceProviders();
    } else if (activeTab === 'reviews') {
      await fetchReviews();
    } else if (activeTab === 'complaints') {
      await fetchComplaints();
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🏢</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalBusinesses || 0}</h3>
            <p className="admin-stat-label">Total Service Providers</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.pendingBusinesses || 0}</h3>
            <p className="admin-stat-label">Pending Approvals</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.activeBusinesses || 0}</h3>
            <p className="admin-stat-label">Active Providers</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⭐</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalReviews || 0}</h3>
            <p className="admin-stat-label">Total Reviews</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalUsers || 0}</h3>
            <p className="admin-stat-label">Total Users</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🚨</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-number">{stats.totalComplaints || 0}</h3>
            <p className="admin-stat-label">Complaints</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceProviders = () => (
    <div className="admin-content-section">
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search service providers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
                 <select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           className="admin-filter-select"
         >
           <option value="all">All Status</option>
           <option value="active">Active</option>
           <option value="pending">Pending</option>
           <option value="suspended">Suspended</option>
           <option value="rejected">Rejected</option>
           <option value="inactive">Inactive</option>
         </select>
      </div>
      
             <div className="admin-table-container">
         {dataLoading ? (
           <div className="admin-loading">
             <div className="admin-spinner"></div>
             <p>Loading service providers...</p>
           </div>
         ) : (
           <table className="admin-table">
             <thead>
               <tr>
                 <th>Business Name</th>
                 <th>Owner</th>
                 <th>Type</th>
                 <th>Location</th>
                 <th>Status</th>
                 <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {serviceProviders.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="admin-no-data">
                     <div className="admin-empty-state">
                       <p>No service providers found</p>
                       <small>Try adjusting your filters or search terms</small>
                     </div>
                   </td>
                 </tr>
               ) : (
                 serviceProviders.map((business) => (
              <tr key={business._id}>
                <td>{business.businessName}</td>
                <td>{business.owner?.firstName} {business.owner?.lastName}</td>
                <td>{business.businessType}</td>
                <td>{business.location?.city}</td>
                                 <td>
                   <span className={`admin-status admin-status-${business.status}`}>
                     {business.status}
                   </span>
                   {business.statusReason && (
                     <div className="admin-status-reason">
                       Reason: {business.statusReason}
                     </div>
                   )}
                 </td>
                                 <td className="admin-actions">
                   <button
                     onClick={() => updateBusinessStatus(business._id, 'active')}
                     className="admin-action-btn admin-action-approve"
                     disabled={business.status === 'active'}
                   >
                     Approve
                   </button>
                   <button
                     onClick={() => updateBusinessStatus(business._id, 'suspended')}
                     className="admin-action-btn admin-action-suspend"
                     disabled={business.status === 'suspended'}
                   >
                     Suspend
                   </button>
                   <button
                     onClick={() => updateBusinessStatus(business._id, 'rejected')}
                     className="admin-action-btn admin-action-reject"
                     disabled={business.status === 'rejected'}
                   >
                     Reject
                   </button>
                   <button
                     onClick={() => updateBusinessStatus(business._id, 'inactive')}
                     className="admin-action-btn admin-action-inactive"
                     disabled={business.status === 'inactive'}
                   >
                     Deactivate
                   </button>
                   <button
                     onClick={() => deleteBusiness(business._id)}
                     className="admin-action-btn admin-action-delete"
                   >
                     Delete
                   </button>
                 </td>
               </tr>
               ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            Previous
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="admin-content-section">
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
          <option value="flagged">Flagged</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>
      
      <div className="admin-table-container">
        {dataLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading reviews...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Business</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-no-data">
                    <div className="admin-empty-state">
                      <p>No reviews found</p>
                      <small>Try adjusting your filters or search terms</small>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.reviewer?.firstName} {review.reviewer?.lastName}</td>
                <td>{review.business?.businessName}</td>
                <td>{review.rating}/5</td>
                <td className="admin-review-comment">{review.comment}</td>
                <td>
                  <span className={`admin-status admin-status-${review.status}`}>
                    {review.status}
                  </span>
                </td>
                <td className="admin-actions">
                  <button
                    onClick={() => updateReviewStatus(review._id, 'active')}
                    className="admin-action-btn admin-action-approve"
                    disabled={review.status === 'active'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateReviewStatus(review._id, 'hidden')}
                    className="admin-action-btn admin-action-suspend"
                    disabled={review.status === 'hidden'}
                  >
                    Hide
                  </button>
                  <button
                    onClick={() => updateReviewStatus(review._id, 'deleted')}
                    className="admin-action-btn admin-action-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            Previous
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderComplaints = () => (
    <div className="admin-content-section">
      <div className="admin-filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">All Complaints</option>
          <option value="flagged">Flagged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      
      <div className="admin-table-container">
        {dataLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Complainant</th>
                <th>Business</th>
                <th>Issue</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-no-data">
                    <div className="admin-empty-state">
                      <p>No complaints found</p>
                      <small>Try adjusting your filters or search terms</small>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td>{complaint.reviewer?.firstName} {complaint.reviewer?.lastName}</td>
                <td>{complaint.business?.businessName}</td>
                <td className="admin-complaint-issue">{complaint.comment}</td>
                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`admin-status admin-status-${complaint.status}`}>
                    {complaint.status}
                  </span>
                </td>
                <td className="admin-actions">
                  <button
                    onClick={() => updateReviewStatus(complaint._id, 'active')}
                    className="admin-action-btn admin-action-approve"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => updateReviewStatus(complaint._id, 'hidden')}
                    className="admin-action-btn admin-action-suspend"
                  >
                    Hide
                  </button>
                </td>
              </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            Previous
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-header-title">Admin Dashboard</h1>
          <div className="admin-header-user">
            <span className="admin-user-name">Welcome, {admin?.fullName}</span>
            <span className="admin-user-role">({admin?.role})</span>
            <button onClick={handleRefresh} className="admin-refresh-btn">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>



      <div className="admin-navigation">
        <button
          className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`admin-nav-btn ${activeTab === 'service-providers' ? 'active' : ''}`}
          onClick={() => setActiveTab('service-providers')}
        >
          Service Providers
        </button>
        <button
          className={`admin-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button
          className={`admin-nav-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          Complaints
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'service-providers' && renderServiceProviders()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'complaints' && renderComplaints()}
      </div>
    </div>
  );
};

export default AdminDashboard;
