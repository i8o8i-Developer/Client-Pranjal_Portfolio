import React, { useState, useEffect } from 'react';
import { getEdits, createEdit, updateEdit, deleteEdit, API_URL, getGoogleDriveUrls } from '../services/Api.js';
import './Manager.css';

// Helper To Get Full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

// Helper To Get Thumbnail URL With Google Drive Support
const getThumbnailUrl = (edit) => {
  if (edit.drive_file_id) {
    return getGoogleDriveUrls.thumbnail(edit.drive_file_id);
  }
  if (edit.thumbnail_url) {
    return getFullUrl(edit.thumbnail_url);
  }
  return null;
};

// Helper To Get Before Image URL With Google Drive Support
const getBeforeUrl = (edit) => {
  if (edit.before_drive_id) {
    return getGoogleDriveUrls.direct(edit.before_drive_id);
  }
  return getFullUrl(edit.before_url);
};

// Helper To Get After Image URL With Google Drive Support
const getAfterUrl = (edit) => {
  if (edit.after_drive_id) {
    return getGoogleDriveUrls.direct(edit.after_drive_id);
  }
  return getFullUrl(edit.after_url);
};

// Helper To Convert YouTube Or Google Drive URL To Embed Format
const getEmbedUrl = (url) => {
  if (!url) return null;
  
  // YouTube Support
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  
  // Google Drive Support
  const gdriveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  const gdriveIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (gdriveIdMatch) return `https://drive.google.com/file/d/${gdriveIdMatch[1]}/preview`;
  
  return url;
};

// Helper To Get Embed URL With Google Drive Support
const getVideoEmbedUrl = (edit) => {
  if (edit.drive_file_id) {
    return getGoogleDriveUrls.embed(edit.drive_file_id);
  }
  if (edit.video_url) {
    return getEmbedUrl(edit.video_url);
  }
  return null;
};

// Helper To Check If URL Is Embeddable
const isEmbeddable = (url) => {
  return url && (url.includes('youtube') || url.includes('youtu.be') || url.includes('drive.google.com'));
};

export default function EditsManager() {
  const [edits, setEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingEdit, setEditingEdit] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    before_url: '',
    after_url: '',
    tags: [],
    published: true,
    order: 0,
    is_featured: false
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadEdits();
  }, []);

  const loadEdits = async () => {
    try {
      const response = await getEdits();
      setEdits(response.data || []);
    } catch (error) {
      console.error('Error Loading Edits:', error);
      showMessage('error', 'Failed To Load Video Edits');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      before_url: '',
      after_url: '',
      tags: [],
      published: true,
      order: 0,
      is_featured: false
    });
    setNewTag('');
    setEditingEdit(null);
  };

  const openModal = (edit = null) => {
    if (edit) {
      setEditingEdit(edit);
      setFormData({
        title: edit.title || '',
        description: edit.description || '',
        video_url: edit.video_url || '',
        thumbnail_url: edit.thumbnail_url || '',
        before_url: edit.before_url || '',
        after_url: edit.after_url || '',
        tags: edit.tags || [],
        published: edit.published !== undefined ? edit.published : true,
        order: edit.order || 0,
        is_featured: edit.is_featured || false
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingEdit) {
        await updateEdit(editingEdit._id, formData);
        showMessage('success', 'Video Edit Updated Successfully!');
      } else {
        await createEdit(formData);
        showMessage('success', 'Video Edit Created Successfully!');
      }
      closeModal();
      loadEdits();
    } catch (error) {
      console.error('Save Error:', error);
      showMessage('error', 'Failed To Save Video Edit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (editId) => {
    if (!window.confirm('Are You Sure You Want To Delete This Video Edit?')) return;

    try {
      await deleteEdit(editId);
      showMessage('success', 'Video Edit Deleted Successfully!');
      loadEdits();
    } catch (error) {
      console.error('Delete Error:', error);
      showMessage('error', 'Failed To Delete Video Edit');
    }
  };

  const togglePublished = async (edit) => {
    try {
      await updateEdit(edit._id, { published: !edit.published });
      loadEdits();
    } catch (error) {
      console.error('Toggle Error:', error);
      showMessage('error', 'Failed To Update Video Edit');
    }
  };

  const toggleFeatured = async (edit) => {
    try {
      await updateEdit(edit._id, { is_featured: !edit.is_featured });
      loadEdits();
      showMessage('success', edit.is_featured ? 'Removed From Featured' : 'Set As Featured!');
    } catch (error) {
      console.error('Toggle Error:', error);
      showMessage('error', 'Failed To Update Featured Status');
    }
  };

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="spinner"></div>
        <p>Loading Video Edits...</p>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <div>
          <h2>Video Editing Management</h2>
          <p>Manage Your Video Editing Portfolio</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          + Add Video Edit
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {edits.length === 0 ? (
        <div className="empty-state">
          <h3>No Video Edits Yet</h3>
          <p>Showcase Your Video Editing Skills By Adding Your First Project.</p>
          <button className="add-btn" onClick={() => openModal()}>
            + Add Your First Video Edit
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {edits.map((edit) => (
            <div key={edit._id} className={`item-card ${!edit.published ? 'unpublished' : ''} ${edit.is_featured ? 'featured' : ''}`}>
              {edit.is_featured && <span className="featured-badge">★ Featured</span>}
              <div className="item-image video-thumbnail">
                {getThumbnailUrl(edit) ? (
                  <img src={getThumbnailUrl(edit)} alt={edit.title} />
                ) : (edit.video_url || edit.drive_file_id) ? (
                  isEmbeddable(edit.video_url) || edit.drive_file_id ? (
                    <iframe
                      src={getVideoEmbedUrl(edit)}
                      title="Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '180px' }}
                    ></iframe>
                  ) : (
                    <video controls src={getFullUrl(edit.video_url)} style={{ width: '100%', maxHeight: '180px' }}>
                      Your Browser Does Not Support the Video Tag.
                    </video>
                  )
                ) : (
                  <div className="no-image">
                    <span className="video-icon">✂</span>
                  </div>
                )}
                <div className="item-overlay">
                  <button className="edit-btn" onClick={() => openModal(edit)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(edit._id)}>Delete</button>
                </div>
              </div>
              <div className="item-content">
                <h3>{edit.title}</h3>
                <p className="description">{edit.description?.substring(0, 80)}...</p>
                <div className="item-meta">
                  <span className={`status ${edit.published ? 'published' : 'draft'}`}>
                    {edit.published ? 'Published' : 'Draft'}
                  </span>
                  <div className="meta-actions">
                    <button
                      className={`feature-btn ${edit.is_featured ? 'active' : ''}`}
                      onClick={() => toggleFeatured(edit)}
                      title={edit.is_featured ? 'Remove From Featured' : 'Set As Featured'}
                    >
                      ★
                    </button>
                    <button
                      className="toggle-btn"
                      onClick={() => togglePublished(edit)}
                    >
                      {edit.published ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEdit ? 'Edit Video Edit' : 'Add New Video Edit'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Video URL (YouTube / Google Drive / Direct Link)</label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=... or https://drive.google.com/file/d/..."
                  required
                />
                <small>Paste any Google Drive URL - file ID Will Be Automatically Extracted For Reliable Thumbnails</small>
              </div>

              {formData.video_url && (
                <div className="video-preview">
                  <label>Preview</label>
                  {isEmbeddable(formData.video_url) || getGoogleDriveUrls.isDriveUrl(formData.video_url) ? (
                    <iframe
                      src={getGoogleDriveUrls.isDriveUrl(formData.video_url) ? 
                        getGoogleDriveUrls.embed(getGoogleDriveUrls.extractId(formData.video_url)) : 
                        getEmbedUrl(formData.video_url)}
                      title="Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls src={getFullUrl(formData.video_url)} style={{ width: '100%', maxHeight: '300px' }}>
                      Your Browser Does Not Support The Video Tag.
                    </video>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Thumbnail URL (Optional - Auto-Generated From Google Drive If Not Provided)</label>
                <input
                  type="url"
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/... Or Leave Empty For Auto-Generation"
                />
                <small>Paste Google Drive URL Or Leave Empty - Thumbnail Will Be Auto-Generated From Video</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Before Image URL (Optional)</label>
                  <input
                    type="url"
                    name="before_url"
                    value={formData.before_url}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <small>Paste Google Drive URL For Before Image</small>
                </div>

                <div className="form-group">
                  <label>After Image URL (Optional)</label>
                  <input
                    type="url"
                    name="after_url"
                    value={formData.after_url}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <small>Paste Google Drive URL For After Image</small>
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add A Tag..."
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  />
                  <button type="button" onClick={addTag} className="add-tag-btn">Add</button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                    />
                    Published
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                    />
                    Featured
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : (editingEdit ? 'Update Video Edit' : 'Add Video Edit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}