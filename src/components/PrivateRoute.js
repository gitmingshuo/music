import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingScreen from './LoadingScreen';

function PrivateRoute({ children }) {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;