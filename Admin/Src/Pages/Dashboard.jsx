import React from 'react';
import { MdDashboard, MdPerson, MdPhotoCamera, MdMovie, MdEdit, MdMail } from 'react-icons/md';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Overview from '../Components/Overview.jsx';
import ProfileManager from '../Components/ProfileManager.jsx';
import PhotosManager from '../Components/PhotosManager.jsx';
import VideosManager from '../Components/VideosManager.jsx';
import EditsManager from '../Components/EditsManager.jsx';
import MessagesManager from '../Components/MessagesManager.jsx';
import './Dashboard.css';

export default function Dashboard({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Overview', icon: <MdDashboard /> },
    { path: '/dashboard/profile', label: 'Profile', icon: <MdPerson /> },
    { path: '/dashboard/photos', label: 'Photography', icon: <MdPhotoCamera /> },
    { path: '/dashboard/videos', label: 'Videography', icon: <MdMovie /> },
    { path: '/dashboard/edits', label: 'Video Editing', icon: <MdEdit /> },
    { path: '/dashboard/messages', label: 'Messages', icon: <MdMail /> },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

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
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="view-site-btn"
          >
            View Live Site
          </a>
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
            Also Known As <a href="https://github.com/i8o8i-Developer" target="_blank" rel="noopener noreferrer">i8o8i-Developer</a> In The Social Media World | 
            Built With Python, FastAPI, React, MongoDB, And Three.js
          </p>
        </div>
      </main>
    </div>
  );
}