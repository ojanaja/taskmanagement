import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const PublicRoute = () => {
    const { token } = useAuth();

    // If authorized, redirect to home page
    // If not, return element that will render children (Login/Register)
    return token ? <Navigate to="/" /> : <Outlet />;
}

export default PublicRoute;
