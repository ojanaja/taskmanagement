import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children ? children : <Outlet />;
}

export default PrivateRoute;
