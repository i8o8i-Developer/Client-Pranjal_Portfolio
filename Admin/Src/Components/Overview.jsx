import React, { useState, useEffect, useRef } from 'react';
import { MdPhotoCamera, MdMovie, MdContentCut, MdEmail, MdAdd, MdEdit, MdBarChart } from 'react-icons/md';
import { getPhotos, getVideos, getEdits, getMessages, getAnalyticsStats, getRealtimeVisitors } from '../services/Api.js';
import './Manager.css';

export default function Overview() {
  const [stats, setStats] = useState({
    photos: 0,
    videos: 0,
    edits: 0,
    messages: 0,
    unreadMessages: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    hourly: [],
    summary: { today: 0, week: 0, month: 0, total: 0 },
    topPages: []
  });
  const [activeVisitors, setActiveVisitors] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    loadStats();
    loadAnalytics();
    
    // Refresh analytics every 30 seconds
    const analyticsInterval = setInterval(() => {
      loadAnalytics();
    }, 30000);
    
    // Refresh realtime visitors every 10 seconds
    const realtimeInterval = setInterval(() => {
      loadRealtimeVisitors();
    }, 10000);
    
    return () => {
      clearInterval(analyticsInterval);
      clearInterval(realtimeInterval);
    };
  }, []);

  const loadAnalytics = async () => {
    try {
      const [statsRes, realtimeRes] = await Promise.all([
        getAnalyticsStats(24).catch(() => ({ data: { hourly: [], summary: {}, topPages: [] } })),
        getRealtimeVisitors().catch(() => ({ data: { activeNow: 0 } }))
      ]);
      
      setAnalyticsData(statsRes.data);
      setActiveVisitors(realtimeRes.data.activeNow);
    } catch (error) {
      console.error('Error Loading Analytics:', error);
    }
  };

  const loadRealtimeVisitors = async () => {
    try {
      const res = await getRealtimeVisitors();
      setActiveVisitors(res.data.activeNow);
    } catch (error) {
      console.error('Error Loading Realtime:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [photosRes, videosRes, editsRes, messagesRes] = await Promise.all([
        getPhotos().catch(() => ({ data: [] })),
        getVideos().catch(() => ({ data: [] })),
        getEdits().catch(() => ({ data: [] })),
        getMessages().catch(() => ({ data: [] }))
      ]);

      const messages = messagesRes.data || [];
      
      setStats({
        photos: photosRes.data?.length || 0,
        videos: videosRes.data?.length || 0,
        edits: editsRes.data?.length || 0,
        messages: messages.length,
        unreadMessages: messages.filter(m => !m.read).length
      });

      setRecentMessages(messages.slice(0, 5));
    } catch (error) {
      console.error('Error Loading Stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="overview-container">
      <div className="overview-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome To Your Portfolio Admin Panel</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card photos">
          <div className="stat-icon"><MdPhotoCamera /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.photos}</span>
            <span className="stat-label">Photos</span>
          </div>
        </div>

        <div className="stat-card videos">
          <div className="stat-icon"><MdMovie /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.videos}</span>
            <span className="stat-label">Videos</span>
          </div>
        </div>

        <div className="stat-card edits">
          <div className="stat-icon"><MdContentCut /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.edits}</span>
            <span className="stat-label">Video Edits</span>
          </div>
        </div>

        <div className="stat-card messages">
          <div className="stat-icon"><MdEmail /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.messages}</span>
            <span className="stat-label">Messages</span>
            {stats.unreadMessages > 0 && (
              <span className="stat-badge">{stats.unreadMessages} Unread</span>
            )}
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <a href="/dashboard/photos" className="action-btn">
              <span className="action-icon"><MdAdd /></span>
              Add Photo
            </a>
            <a href="/dashboard/videos" className="action-btn">
              <span className="action-icon"><MdAdd /></span>
              Add Video
            </a>
            <a href="/dashboard/edits" className="action-btn">
              <span className="action-icon"><MdAdd /></span>
              Add Video Edit
            </a>
            <a href="/dashboard/profile" className="action-btn">
              <span className="action-icon"><MdEdit /></span>
              Edit Profile
            </a>
          </div>
        </div>

        <div className="overview-section">
          <h3>Recent Messages</h3>
          {recentMessages.length === 0 ? (
            <p className="no-data">No Messages Yet</p>
          ) : (
            <div className="recent-messages">
              {recentMessages.map((msg) => (
                <div key={msg._id} className={`recent-message ${!msg.read ? 'unread' : ''}`}>
                  <div className="msg-header">
                    <span className="msg-name">{msg.name}</span>
                    {!msg.read && <span className="unread-indicator"></span>}
                  </div>
                  <div className="msg-preview">{msg.message.substring(0, 50)}...</div>
                  <div className="msg-date">{formatDate(msg.created_at)}</div>
                </div>
              ))}
              <a href="/dashboard/messages" className="view-all-link">View All Messages →</a>
            </div>
          )}
        </div>
      </div>

      <div className="overview-section visitor-analytics">
        <div className="analytics-header">
          <h3><MdBarChart style={{verticalAlign: 'middle'}} /> Page Visitors</h3>
          <div className="realtime-indicator">
            <span className="pulse-dot"></span>
            <span className="active-count">{activeVisitors} Active Now</span>
          </div>
        </div>
        
        <div className="analytics-summary">
          <div className="summary-item">
            <span className="summary-value">{analyticsData.summary.today}</span>
            <span className="summary-label">Today</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{analyticsData.summary.week}</span>
            <span className="summary-label">This Week</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{analyticsData.summary.month}</span>
            <span className="summary-label">This Month</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{analyticsData.summary.total}</span>
            <span className="summary-label">Total</span>
          </div>
        </div>

        <div className="chart-container" ref={chartRef}>
          <div className="chart-title">Visitors (Last 24 Hours)</div>
          {analyticsData.hourly.length === 0 ? (
            <div className="no-chart-data">
              <span>📈</span>
              <p>No visitor data yet. Tracking will begin when visitors arrive.</p>
            </div>
          ) : (
            <div className="bar-chart">
              {analyticsData.hourly.map((item, index) => {
                const maxVisitors = Math.max(...analyticsData.hourly.map(h => h.visitors), 1);
                const heightPercent = (item.visitors / maxVisitors) * 100;
                return (
                  <div key={index} className="bar-wrapper" title={`${item.time}: ${item.visitors} visitors`}>
                    <div 
                      className="bar" 
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    >
                      <span className="bar-value">{item.visitors}</span>
                    </div>
                    <span className="bar-label">{item.time.split(' ')[1]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {analyticsData.topPages.length > 0 && (
          <div className="top-pages">
            <h4>Top Pages</h4>
            <ul>
              {analyticsData.topPages.map((page, index) => (
                <li key={index}>
                  <span className="page-name">{page.page}</span>
                  <span className="page-visits">{page.visits} visits</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}