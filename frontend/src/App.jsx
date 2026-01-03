import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { Button } from '@/components/ui/button';
import { TaskList } from './components/TaskList';

import Layout from './components/Layout';

import Members from "./pages/Members";

const Home = () => {
  return (
    <Layout>
      <div className="mb-8 ml-8">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-500 mt-1">Monitor project status and team productivity</p>
      </div>
      <TaskList />
    </Layout>
  );
};

import { Toaster } from 'sonner';

const App = () => {
  return (
    <Router>
      <Toaster richColors position="top-right" style={{ zIndex: 99999 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
