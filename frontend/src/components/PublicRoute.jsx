import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const PublicRoute = () => {
    const { token } = useAuth();
    return token ? <Navigate to="/" /> : <Outlet />;
}

export default PublicRoute;
