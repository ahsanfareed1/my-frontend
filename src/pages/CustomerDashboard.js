import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FaComments, FaUser, FaHome, FaStar, FaSignOutAlt, FaSearch, FaBars, FaArrowLeft, FaTimes, FaEdit, FaSave, FaTrash, FaEllipsisV, FaCheck, FaArrowLeft as FaBack } from 'react-icons/fa';
import ChatWindow from '../components/ChatWindow';
import BusinessAvatar from '../components/BusinessAvatar';
import Profile from './Profile';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  
  // navigation state se active tab nikalne k liye
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'dashboard'
  );
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [recentReview, setRecentReview] = useState(null);
  const [showConversationOptions, setShowConversationOptions] = useState(null);
  
  // agr navigation state me conversation id ho to use krne k liye
  const initialConversationId = location.state?.conversationId;

  // search query pe conversations filter krne k liye
  const filteredConversations = conversations.filter(conversation =>
    conversation.businessId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation items
  const navItems = [
    { id: 'back-to-home', icon: <FaBack />, label: 'Back to Home', desktopOnly: true },
    { id: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
    { id: 'messages', icon: <FaComments />, label: 'Messages' },
    { id: 'profile', icon: <FaUser />, label: 'Profile' },
    { id: 'reviews', icon: <FaStar />, label: 'My Reviews' },
  ];

  // back jane ka logic
  const handleGoBack = () => {
    if (isFullScreenChat) {
      setIsFullScreenChat(false);
      setSelectedConversation(null);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/home');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // mobile menu toggle krne k liye
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // bahar click pe mobile menu band krne k liye
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // mobile me conversation select krne k liye
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setIsFullScreenChat(true);
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
      fetchUnreadCount();
    }
    if (activeTab === 'reviews') {
      fetchUserReviews();
    }
  }, [activeTab]);

  // socket event pe unread count update krne k liye
  useEffect(() => {
    if (socket) {
      const handleMessageRead = () => {
        // message read hone pe unread refresh
        fetchUnreadCount();
        fetchConversations();
      };

      socket.on('message-read', handleMessageRead);
      
      return () => {
        socket.off('message-read', handleMessageRead);
      };
    }
  }, [socket]);

  // bahar click pe options menu band krne k liye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showConversationOptions && !event.target.closest('.conversation-options') && !event.target.closest('.conversation-options-btn')) {
        setShowConversationOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConversationOptions]);

  // component mount pe user reviews lane k liye
  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);
  
  // new conversation bnne k baad auto select krne k liye
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.conversationId === initialConversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        setIsChatOpen(true);
      }
    }
  }, [conversations, initialConversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/messaging/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messaging/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotalUnread(data.unreadCount || 0);
        // unread count update ho gaya
      }
    } catch (err) {
      // ignore error
    }
  };

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!user._id) {
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/reviews?reviewer=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userReviews = (data.reviews || []).filter(review => {
          const reviewerId = review.reviewer?._id || review.reviewer;
          return reviewerId === user._id;
        });
        
        setReviews(userReviews);
        
        // Set the most recent review for dashboard display
        if (userReviews.length > 0) {
          const sortedReviews = userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentReview(sortedReviews[0]);
        }
      }
    } catch (error) {
      // reviews fetch error ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  const handleMarkConversationAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messaging/conversations/${conversationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh conversations and unread count
        fetchConversations();
        fetchUnreadCount();
        setShowConversationOptions(null);
      }
    } catch (err) {
      // mark read pe error ignore
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/messaging/conversations/${conversationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Close the chat window if this conversation is currently open
          if (selectedConversation?.conversationId === conversationId) {
            setSelectedConversation(null);
            setIsChatOpen(false);
            setIsFullScreenChat(false);
          }
          
          // Refresh conversations and unread count to remove the deleted conversation
          fetchConversations();
          fetchUnreadCount();
          setShowConversationOptions(null);
        }
      } catch (err) {
        // delete pe error ignore
      }
    }
  };

  const handleConversationDeleted = (conversationId) => {
    // Close the chat window if this conversation is currently open
    if (selectedConversation?.conversationId === conversationId) {
      setSelectedConversation(null);
      setIsChatOpen(false);
      setIsFullScreenChat(false);
    }
    
    // Refresh conversations and unread count to remove the deleted conversation
    fetchConversations();
    fetchUnreadCount();
    setShowConversationOptions(null);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="customer-dashboard">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('data:') ? user.profilePicture : `http://localhost:5000/${user.profilePicture}`}
                  alt="Profile"
                  onError={(e) => {
                    console.log('CustomerDashboard: Profile picture failed to load, showing placeholder');
                    if (e.target) {
                      e.target.style.display = 'none';
                    }
                    if (e.target && e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="avatar-placeholder" style={{ display: user.profilePicture ? 'none' : 'flex' }}>
                {getInitials(user.firstName, user.lastName)}
              </div>
              {totalUnread > 0 && (
                <div className="profile-unread-badge">
                  {totalUnread}
                </div>
              )}
            </div>
            <div className="user-details">
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
          <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''} ${item.desktopOnly ? 'desktop-only' : ''}`}
              data-tab={item.id}
              onClick={() => {
                if (item.id === 'back-to-home') {
                  handleBackToHome();
                } else {
                  setActiveTab(item.id);
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Mobile Header - Only show in conversations view */}
        {!isFullScreenChat && (
          <div className="mobile-header">
            <button className="go-back-btn" onClick={handleGoBack}>
              <FaArrowLeft />
              <span>Go Back</span>
            </button>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        )}

        {/* Chat Header - Only show in full screen chat */}
        {isFullScreenChat && (
          <div className="chat-header-mobile">
            <button className="back-to-conversations" onClick={handleGoBack}>
            <i className="fa-solid fa-arrow-left-long"></i>
            </button>
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                {selectedConversation?.businessId?.images?.logo ? (
                  <img src={selectedConversation.businessId.images.logo} alt="Business" />
                ) : (
                  <div className="chat-header-avatar-placeholder">
                    {selectedConversation?.businessId?.businessName?.charAt(0) || 'B'}
                  </div>
                )}
              </div>
              <div className="chat-header-details">
                <h3>{selectedConversation?.businessId?.businessName || 'Business'}</h3>
                <span className="chat-header-status">online</span>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="welcome-card">
                <h2>Welcome back, {user.firstName}! 👋</h2>
                <p>Manage your conversations, reviews, and profile from here.</p>
              </div>
              
                             <div className="stats-grid">
                 <div className="stat-card-customer-dashboard">
                   <div className="stat-icon-customer-dashboard">💬</div>
                   <div className="stat-content-customer-dashboard">
                     <h3>{conversations.length}</h3>
                     <p>Active Conversations</p>
                   </div>
                 </div>
                 
                 <div className="stat-card-customer-dashboard">
                   <div className="stat-icon-customer-dashboard">⭐</div>
                   <div className="stat-content-customer-dashboard">
                     <h3>{reviews.length}</h3>
                     <p>Reviews Written</p>
                   </div>
                 </div>
               </div>

               {/* Recent Review Section */}
               {recentReview && (
                 <div className="recent-review-card">
                   <h3>Your Most Recent Review</h3>
                   <div className="review-preview">
                     <div className="review-header">
                       <h4>{recentReview.business?.businessName || 'Business'}</h4>
                       <div className="review-rating">
                         {[...Array(5)].map((_, i) => (
                           <FaStar
                             key={i}
                             className={`star ${i < recentReview.rating ? 'filled' : ''}`}
                           />
                         ))}
                       </div>
                     </div>
                     {recentReview.title && <p className="review-title">{recentReview.title}</p>}
                     <p className="review-comment">{recentReview.comment}</p>
                     <p className="review-date">
                       {new Date(recentReview.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* Messages Tab - WhatsApp-like Layout */}
          {activeTab === 'messages' && (
            <>
              {/* Desktop Layout - WhatsApp Style */}
              <div className="desktop-messages-layout">
                {/* Conversations Panel */}
                <div className="conversations-panel">
                  <div className="conversations-header">
                    <h2>Messages</h2>
                    <p>Chat with businesses about their services</p>
                  </div>
                  
                  {/* Search Field */}
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>
                  
                  {/* Conversations List */}
                  <div className="conversations-list-container">
                    {loading ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading conversations...</p>
                      </div>
                    ) : error ? (
                      <div className="error-state">
                        <p>{error}</p>
                        <button onClick={fetchConversations}>Try Again</button>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>{searchQuery ? 'No conversations found' : 'No conversations yet'}</h3>
                        <p>{searchQuery ? 'Try adjusting your search terms' : 'Start chatting with businesses by clicking "Message Us" on their profiles!'}</p>
                      </div>
                    ) : (
                      <div className="conversations-list">
                        {filteredConversations.map((conversation) => (
                          <div
                            key={conversation.conversationId}
                            className={`conversation-item ${selectedConversation?.conversationId === conversation.conversationId ? 'selected' : ''}`}
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <div className="conversation-avatar">
                              {conversation.businessId?.images?.logo ? (
                                <img src={conversation.businessId.images.logo} alt="Business" />
                              ) : (
                                <div className="business-avatar-placeholder">
                                  {conversation.businessId?.businessName?.charAt(0) || 'B'}
                                </div>
                              )}
                            </div>
                            
                            <div className="conversation-content">
                              <div className="conversation-header">
                                <h4>{conversation.businessId?.businessName || 'Business'}</h4>
                                <div className="conversation-header-right">
                                  <span className="conversation-time">
                                    {formatTime(conversation.lastMessageTime)}
                                  </span>
                                  <button 
                                    className="conversation-options-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowConversationOptions(showConversationOptions === conversation.conversationId ? null : conversation.conversationId);
                                    }}
                                  >
                                    <FaEllipsisV />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="conversation-preview">
                                {conversation.lastMessageContent || 'No messages yet'}
                              </p>
                              
                              {conversation.unreadCount?.customer > 0 && (
                                <span className="unread-badge">
                                  {conversation.unreadCount.customer}
                                </span>
                              )}
                            </div>

                            {/* Conversation Options Menu */}
                            {showConversationOptions === conversation.conversationId && (
                              <div className="conversation-options">
                                {conversation.unreadCount?.customer > 0 && (
                                  <button 
                                    className="conversation-option-btn mark-read-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkConversationAsRead(conversation.conversationId);
                                    }}
                                  >
                                    <FaCheck /> Mark as Read
                                  </button>
                                )}
                                <button 
                                  className="conversation-option-btn delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConversation(conversation.conversationId);
                                  }}
                                >
                                  <FaTrash /> Delete Chat
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Panel */}
                <div className="chat-panel">
                  {selectedConversation ? (
                    <ChatWindow
                      conversation={selectedConversation}
                      business={selectedConversation.businessId}
                      isOpen={true}
                      onClose={() => setSelectedConversation(null)}
                      onConversationDeleted={handleConversationDeleted}
                    />
                  ) : (
                    <div className="no-chat-selected">
                      <div className="no-chat-icon">💬</div>
                      <h3>Select a conversation</h3>
                      <p>Choose a business from the list to start chatting</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Layout - Keep existing mobile behavior */}
              <div className="mobile-messages-layout">
                {!isFullScreenChat ? (
                  /* Conversations List View */
                  <div className="mobile-conversations-view">
                    <div className="conversations-header">
                      <h2>Messages</h2>
                      <p>Chat with businesses about their services</p>
                    </div>
                    
                    {/* Search Field */}
                    <div className="search-container">
                      <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
                      </div>
                    </div>
                    
                    {/* Conversations List */}
                    <div className="conversations-list-container">
                      {loading ? (
                        <div className="loading-state">
                          <div className="spinner"></div>
                          <p>Loading conversations...</p>
                        </div>
                      ) : error ? (
                        <div className="error-state">
                          <p>{error}</p>
                          <button onClick={fetchConversations}>Try Again</button>
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">💬</div>
                          <h3>{searchQuery ? 'No conversations found' : 'No conversations yet'}</h3>
                          <p>{searchQuery ? 'Try adjusting your search terms' : 'Start chatting with businesses by clicking "Message Us" on their profiles!'}</p>
                        </div>
                      ) : (
                        <div className="conversations-list">
                          {filteredConversations.map((conversation) => (
                            <div
                              key={conversation.conversationId}
                              className="conversation-item"
                              onClick={() => handleConversationSelect(conversation)}
                            >
                              <div className="conversation-avatar">
                                {conversation.businessId?.images?.logo ? (
                                  <img src={conversation.businessId.images.logo} alt="Business" />
                                ) : (
                                  <div className="business-avatar-placeholder">
                                    {conversation.businessId?.businessName?.charAt(0) || 'B'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="conversation-content">
                                <div className="conversation-header">
                                  <h4>{conversation.businessId?.businessName || 'Business'}</h4>
                                  <div className="conversation-header-right">
                                    <span className="conversation-time">
                                      {formatTime(conversation.lastMessageTime)}
                                    </span>
                                    <button 
                                      className="conversation-options-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConversationOptions(showConversationOptions === conversation.conversationId ? null : conversation.conversationId);
                                      }}
                                    >
                                      <FaEllipsisV />
                                    </button>
                                  </div>
                                </div>
                                
                                <p className="conversation-preview">
                                  {conversation.lastMessageContent || 'No messages yet'}
                                </p>
                                
                                {conversation.unreadCount?.customer > 0 && (
                                  <span className="unread-badge">
                                    {conversation.unreadCount.customer}
                                  </span>
                                )}
                              </div>

                              {/* Conversation Options Menu */}
                              {showConversationOptions === conversation.conversationId && (
                                <div className="conversation-options">
                                  {conversation.unreadCount?.customer > 0 && (
                                    <button 
                                      className="conversation-option-btn mark-read-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkConversationAsRead(conversation.conversationId);
                                      }}
                                    >
                                      <FaCheck /> Mark as Read
                                    </button>
                                  )}
                                  <button 
                                    className="conversation-option-btn delete-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteConversation(conversation.conversationId);
                                    }}
                                  >
                                    <FaTrash /> Delete Chat
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Full Screen Chat View */
                  <div className="full-screen-chat">
                    <ChatWindow
                      conversation={selectedConversation}
                      business={selectedConversation.businessId}
                      isOpen={true}
                      onClose={() => setIsFullScreenChat(false)}
                      onConversationDeleted={handleConversationDeleted}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <Profile />
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <CustomerReviews />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



// Customer Reviews Component
const CustomerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!user._id) {
        setError('User ID not found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/reviews?reviewer=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userReviews = (data.reviews || []).filter(review => {
          const reviewerId = review.reviewer?._id || review.reviewer;
          return reviewerId === user._id;
        });
        
        setReviews(userReviews);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('An error occurred while fetching reviews');
    } finally {
      setLoading(false);
    }
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
        fetchUserReviews();
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
          fetchUserReviews();
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

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-error">
        <p>{error}</p>
        <button onClick={fetchUserReviews}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="customer-reviews">
      <div className="reviews-header">
        <h2>My Reviews</h2>
        <p>Manage and edit your reviews for businesses</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">⭐</div>
          <h3>No Reviews Yet</h3>
          <p>You haven't written any reviews yet. Start reviewing businesses you've used!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
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
                    {review.title && <p className="review-title">{review.title}</p>}
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
      )}
    </div>
  );
};

// Review Edit Form Component
const ReviewEditForm = ({ review, onSave, onCancel }) => {
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
      <div>
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
      
      <div>
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
      
      <div>
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
};

export default CustomerDashboard;
