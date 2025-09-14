import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL
  || (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Socket functions
  const sendMessage = (messageData) => {
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return false;
    }

    try {
      socket.emit('send-message', messageData);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const startTyping = (typingData) => {
    if (!socket || !isConnected) return;
    
    try {
      socket.emit('typing-start', typingData);
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  };

  const stopTyping = (typingData) => {
    if (!socket || !isConnected) return;
    
    try {
      socket.emit('typing-stop', typingData);
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  };

  const markMessageAsRead = (messageId, conversationId) => {
    if (!socket || !isConnected) return;
    
    try {
      socket.emit('mark-read', { messageId, conversationId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const joinBusinessRoom = (businessId) => {
    if (!socket || !isConnected || user?.userType !== 'business') return;
    
    try {
      socket.emit('join-business', businessId);
    } catch (error) {
      console.error('Error joining business room:', error);
    }
  };

  const deleteMessage = (messageId, conversationId) => {
    if (!socket || !isConnected) return;
    
    try {
      socket.emit('delete-message', { messageId, conversationId });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    joinBusinessRoom,
    deleteMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
