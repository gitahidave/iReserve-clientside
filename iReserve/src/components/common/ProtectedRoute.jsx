// Protected Route Component to restrict access to certain routes based on authentication status
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if the user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if the user is authenticated
  return children;
};

export default ProtectedRoute;