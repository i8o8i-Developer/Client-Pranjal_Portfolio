import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import { verifyToken } from './services/Api.js';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        // Verify Token Is Still Valid
        await verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        // Token Expired Or Invalid, Clear It
        console.log('Token Expired Or Invalid, Please Login Again');
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard/*"
          element={
            isAuthenticated ? (
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;