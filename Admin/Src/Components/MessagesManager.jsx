import React, { useState, useEffect } from 'react';
import { getMessages, markMessageRead, deleteMessage } from '../services/Api.js';
import './Manager.css';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // All, UnRead, Read

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await getMessages();
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error Loading Messages:', error);
      showMessage('error', 'Failed To Load Messages');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleMarkRead = async (msgId) => {
    try {
      await markMessageRead(msgId);
      loadMessages();
    } catch (error) {
      console.error('Mark Read Error:', error);
      showMessage('error', 'Failed To Mark Message As Read');
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm('Are You Sure You Want To Delete This Message?')) return;

    try {
      await deleteMessage(msgId);
      showMessage('success', 'Message Deleted Successfully!');
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Delete Error:', error);
      showMessage('error', 'Failed To Delete Message');
    }
  };

  const openMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await handleMarkRead(msg._id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.read;
    if (filter === 'read') return msg.read;
    return true;
  });

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="spinner"></div>
        <p>Loading Messages...</p>
      </div>
    );
  }

  return (
    <div className="manager-container messages-manager">
      <div className="manager-header">
        <div>
          <h2>Messages</h2>
          <p>Contact Form Submissions {unreadCount > 0 && <span className="unread-badge">{unreadCount} Unread</span>}</p>
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({messages.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="messages-layout">
        <div className="messages-list">
          {filteredMessages.length === 0 ? (
            <div className="empty-state small">
              <h3>No Messages</h3>
              <p>{filter === 'all' ? 'No Messages Yet.' : `No ${filter} Messages.`}</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div 
                key={msg._id} 
                className={`message-item ${!msg.read ? 'unread' : ''} ${selectedMessage?._id === msg._id ? 'selected' : ''}`}
                onClick={() => openMessage(msg)}
              >
                <div className="message-header">
                  <span className="sender-name">{msg.name}</span>
                  {!msg.read && <span className="unread-dot"></span>}
                </div>
                <div className="message-email">{msg.email}</div>
                <div className="message-preview">{msg.message.substring(0, 60)}...</div>
                <div className="message-date">{formatDate(msg.created_at)}</div>
              </div>
            ))
          )}
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="detail-header">
                <div>
                  <h3>{selectedMessage.name}</h3>
                  <a href={`mailto:${selectedMessage.email}`} className="email-link">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="detail-actions">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: Portfolio Contact`}
                    className="reply-btn"
                  >
                    Reply
                  </a>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(selectedMessage._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="detail-date">
                Received: {formatDate(selectedMessage.created_at)}
              </div>
              <div className="detail-body">
                {selectedMessage.message}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">✉</div>
              <p>Select A Message To View</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}