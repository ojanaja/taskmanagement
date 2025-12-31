import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from './context/AuthProvider';

import { TaskList } from './components/TaskList';

// Simple Home Component
const Home = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently.</p>
        </div>
        <Button onClick={logout} variant="secondary">Logout</Button>
      </div>

      <TaskList />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
