import React, { useState } from 'react';
import { login } from '../services/Api.js';
import './Login.css';

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please Enter Both Email And Password');
      return;
    }
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please Enter A Valid Email Address');
      return;
    }
    
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.data && response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
        setIsAuthenticated(true);
      } else {
        setError('Invalid Response From Server');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.detail || 'Invalid Credentials. Please Try Again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>PRANJAL</h1>
          <p>Admin Dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}