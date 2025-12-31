import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = () => {
    const { token } = useSelector((state) => state.auth);
    return token ? <Navigate to="/" /> : <Outlet />;
}

export default PublicRoute;
