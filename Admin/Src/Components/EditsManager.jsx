import React, { useState, useEffect } from 'react';
import { getEdits, createEdit, updateEdit, deleteEdit, uploadImage, API_URL } from '../services/Api.js';
import './Manager.css';

// Helper To Get Full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
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

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: response.data.url }));
      showMessage('success', 'Image Uploaded Successfully');
    } catch (error) {
      console.error('Upload Error:', error);
      showMessage('error', 'Failed To Upload Image');
    }
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

  const getEmbedUrl = (url) => {
    const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    
    // Google Drive support
    const gdriveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (gdriveMatch) return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
    const gdriveIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (gdriveIdMatch) return `https://drive.google.com/file/d/${gdriveIdMatch[1]}/preview`;
    
    return getFullUrl(url);
  };

  const isEmbeddable = (url) => {
    return url.includes('youtube') || url.includes('youtu.be') || url.includes('drive.google.com');
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
                {edit.thumbnail_url ? (
                  <img src={getFullUrl(edit.thumbnail_url)} alt={edit.title} />
                ) : edit.video_url ? (
                  isEmbeddable(edit.video_url) ? (
                    <iframe
                      src={getEmbedUrl(edit.video_url)}
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
              </div>

              {formData.video_url && (
                <div className="video-preview">
                  <label>Preview</label>
                  {isEmbeddable(formData.video_url) ? (
                    <iframe
                      src={getEmbedUrl(formData.video_url)}
                      title="Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls src={getFullUrl(formData.video_url)} style={{ width: '100%', maxHeight: '300px' }}>
                      Your browser does not support the video tag.
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
                <label>Thumbnail</label>
                <div className="upload-area">
                  {formData.thumbnail_url ? (
                    <div className="uploaded-image">
                      <img src={getFullUrl(formData.thumbnail_url)} alt="Thumbnail" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="upload-btn">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail_url')} hidden />
                      Upload Thumbnail
                    </label>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Before Image (Optional)</label>
                  <div className="upload-area small">
                    {formData.before_url ? (
                      <div className="uploaded-image small">
                        <img src={getFullUrl(formData.before_url)} alt="Before" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, before_url: '' }))}>×</button>
                      </div>
                    ) : (
                      <label className="upload-btn small">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'before_url')} hidden />
                        Upload
                      </label>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>After Image (Optional)</label>
                  <div className="upload-area small">
                    {formData.after_url ? (
                      <div className="uploaded-image small">
                        <img src={getFullUrl(formData.after_url)} alt="After" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, after_url: '' }))}>×</button>
                      </div>
                    ) : (
                      <label className="upload-btn small">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'after_url')} hidden />
                        Upload
                      </label>
                    )}
                  </div>
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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