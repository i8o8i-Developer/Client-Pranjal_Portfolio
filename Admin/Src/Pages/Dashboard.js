import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Placeholder components
const Overview = () => <div className="content-section"><h2>Overview</h2><p>Welcome to the admin dashboard. Use the sidebar to manage your portfolio.</p></div>;
const ProfileManager = () => <div className="content-section"><h2>Profile</h2><p>Profile management coming soon...</p></div>;
const PhotosManager = () => <div className="content-section"><h2>Photography</h2><p>Photo management coming soon...</p></div>;
const VideosManager = () => <div className="content-section"><h2>Videography</h2><p>Video management coming soon...</p></div>;
const EditsManager = () => <div className="content-section"><h2>Video Editing</h2><p>Edit management coming soon...</p></div>;
const MessagesManager = () => <div className="content-section"><h2>Messages</h2><p>Message management coming soon...</p></div>;

export default function Dashboard({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Overview' },
    { path: '/dashboard/profile', label: 'Profile' },
    { path: '/dashboard/photos', label: 'Photography' },
    { path: '/dashboard/videos', label: 'Videography' },
    { path: '/dashboard/edits', label: 'Video Editing' },
    { path: '/dashboard/messages', label: 'Messages' },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>PRANJAL</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/profile" element={<ProfileManager />} />
            <Route path="/photos" element={<PhotosManager />} />
            <Route path="/videos" element={<VideosManager />} />
            <Route path="/edits" element={<EditsManager />} />
            <Route path="/messages" element={<MessagesManager />} />
          </Routes>
        </div>

        {/* PERMANENT CREDIT SECTION - NOT EDITABLE */}
        <div className="admin-credit">
          <p>
            Portfolio Designed And Developed By <strong>Anubhav Chaurasia</strong> | 
            Also Known As i8o8i-Developer In The Social Media World | 
            Built With Python, FastAPI, React, MongoDB, And Three.js
          </p>
        </div>
      </main>
    </div>
  );
}