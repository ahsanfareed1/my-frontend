import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaTimes, FaUser, FaBuilding, FaTrash, FaCheck } from 'react-icons/fa';
import './ChatWindow.css';

const ChatWindow = ({ 
  conversation, 
  business, 
  onClose, 
  isOpen = false,
  onConversationDeleted
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMessageOptions, setShowMessageOptions] = useState(null);
  
  const { sendMessage, startTyping, stopTyping, socket, deleteMessage } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageOptions && !event.target.closest('.message-options') && !event.target.closest('.message')) {
        setShowMessageOptions(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMessageOptions]);
  useEffect(() => {
    if (conversation?.conversationId && isOpen) {
      loadMessages();
    }
  }, [conversation?.conversationId, isOpen]);
  useEffect(() => {
    if (isOpen && conversation?.conversationId && messages.length > 0) {
      const timer = setTimeout(() => {
        markAllMessagesAsRead(messages);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, conversation?.conversationId, messages.length]);

  // socket events set kr rhy hain
  useEffect(() => {
    
    if (!socket) {
      return;
    }
    
    if (!conversation) {
      return;
    }
    
    if (!conversation.conversationId) {
      return;
    }

    socket.off('new-message');
    socket.off('user-typing');
    socket.off('user-stopped-typing');
    socket.off('message-read');
    socket.off('message-deleted');
    socket.off('delete-message-success');
    socket.off('delete-message-error');

    const handleNewMessage = (data) => {
      if (data.conversationId === conversation.conversationId) {
        setMessages(prev => [...prev, data.message]);
        if (data.message.receiver._id === user._id) {
          markMessageAsRead(data.message._id);
        }
      }
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === conversation.conversationId && data.userId !== user._id) {
        setOtherUserTyping(data.userName || 'Someone is typing...');
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.conversationId === conversation.conversationId && data.userId !== user._id) {
        setOtherUserTyping(false);
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId === conversation.conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data) => {
      if (data.conversationId === conversation.conversationId) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    };

    const handleDeleteSuccess = (data) => {
      if (data.conversationId === conversation.conversationId) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
        setShowMessageOptions(null);
      }
    };

    const handleDeleteError = () => {
      setShowMessageOptions(null);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);
    socket.on('message-read', handleMessageRead);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('delete-message-success', handleDeleteSuccess);
    socket.on('delete-message-error', handleDeleteError);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
      socket.off('message-read', handleMessageRead);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('delete-message-success', handleDeleteSuccess);
      socket.off('delete-message-error', handleDeleteError);
    };
  }, [socket, conversation, user._id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `http://localhost:5000/api/messaging/conversations/${conversation.conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation) return;
    const receiverId = user.userType === 'customer' 
      ? conversation.businessOwner._id 
      : conversation.customer._id;

    const messageData = {
      receiverId: receiverId,
      businessId: conversation.businessId._id,
      content: newMessage.trim(),
      messageType: 'text'
    };

    const sent = sendMessage(messageData);
    
    if (sent) {
      const tempMessage = {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: user,
        receiver: getOtherUser(),
        businessId: conversation.businessId._id,
        conversationId: conversation.conversationId,
        createdAt: new Date(),
        isRead: false,
        isOptimistic: true
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      stopTyping();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
        const receiverId = user.userType === 'customer' 
      ? conversation.businessOwner._id 
      : conversation.customer._id;
        if (!isTyping) {
      setIsTyping(true);
      startTyping({
        receiverId: receiverId,
        businessId: conversation.businessId._id,
        conversationId: conversation.conversationId
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping({
        receiverId: receiverId,
        businessId: conversation.businessId._id,
        conversationId: conversation.conversationId
      });
    }, 1000);
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await fetch('http://localhost:5000/api/messaging/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId, conversationId: conversation.conversationId })
      });
    } catch (err) {
    }
  };

  const markAllMessagesAsRead = async (messages) => {
    try {
      const unreadMessages = messages.filter(msg => 
        msg.receiver._id === user._id && !msg.isRead
      );
      
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg => markMessageAsRead(msg._id))
        );
        setMessages(prev => 
          prev.map(msg => 
            unreadMessages.some(unreadMsg => unreadMsg._id === msg._id)
              ? { ...msg, isRead: true, readAt: new Date() }
              : msg
          )
        );
        if (socket) {
          socket.emit('mark-read', {
            messageIds: unreadMessages.map(msg => msg._id),
            conversationId: conversation.conversationId
          });
        }
      }
    } catch (err) {
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllMessagesAsRead(messages);
  };

  const deleteConversation = async (conversationId) => {
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
        onClose();
        if (onConversationDeleted) {
          onConversationDeleted(conversationId);
        }
      }
    } catch (err) {
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId, conversation.conversationId);
    }
  };

  const handleMarkAsRead = (messageId) => {
    markMessageAsRead(messageId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherUser = () => {
    if (user.userType === 'customer') {
      return conversation.businessOwner;
    } else {
      return conversation.customer;
    }
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <button className="chat-back-btn" onClick={onClose}>←</button>
          <div className="user-avatar">
            {getOtherUser()?.profilePicture ? (
              <img 
                src={getOtherUser().profilePicture} 
                alt={getOtherUser()?.firstName} 
              />
            ) : (
              <div className="avatar-placeholder">
                {user.userType === 'customer' ? <FaBuilding /> : <FaUser />}
              </div>
            )}
          </div>
          <div className="user-details">
            <h4>
              {user.userType === 'customer' 
                ? conversation.businessId.businessName 
                : `${getOtherUser()?.firstName} ${getOtherUser()?.lastName}`
              }
            </h4>
            <span className="user-status">
              {otherUserTyping ? otherUserTyping : 'online'}
            </span>
          </div>
        </div>
          <div className="chat-header-actions">
          {messages.some(msg => msg.receiver._id === user._id && !msg.isRead) && (
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              title="Mark all messages as read"
            >
              <FaCheck /> Mark All as Read
            </button>
          )}
        </div>
        
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-messages">
            <p>{error}</p>
            <button onClick={loadMessages}>Retry</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowMessageOptions(showMessageOptions === message._id ? null : message._id);
              }}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {formatTime(message.createdAt)}
                  </span>
                  {message.sender._id === user._id && (
                    <span className="message-status">
                      {message.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
              {showMessageOptions === message._id && (
                <div className="message-options">
                  {message.sender._id === user._id && (
                    <button 
                      className="message-option-btn delete-btn"
                      onClick={() => handleDeleteMessage(message._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                  {message.sender._id !== user._id && !message.isRead && (
                    <button 
                      className="message-option-btn mark-read-btn"
                      onClick={() => handleMarkAsRead(message._id)}
                    >
                      <FaCheck /> Mark as Read
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            disabled={loading}
            maxLength={1000}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || loading}
            className="send-btn"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="typing-indicator">
          {isTyping && <span>⌨️ You are typing...</span>}
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
