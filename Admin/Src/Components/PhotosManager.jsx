import React, { useState, useEffect } from 'react';
import { getPhotos, createPhoto, updatePhoto, deletePhoto, API_URL, getGoogleDriveUrls } from '../services/Api.js';
import CustomSelect from './CustomSelect.jsx';
import './Manager.css';

// Helper To Get Full Image URL (Supports Both Regular URLs And Google Drive)
const getFullImageUrl = (photo) => {
  if (!photo) return '';
  
  // If Has Google Drive file ID, Use It
  if (photo.drive_file_id) {
    return getGoogleDriveUrls.direct(photo.drive_file_id);
  }
  
  // Otherwise Use Regular URL
  const url = photo.image_url || photo;
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

// Helper To Get Thumbnail URL
const getThumbnailUrl = (photo, size = 400) => {
  if (!photo) return '';
  
  // If Has Google Drive file ID, Generate Thumbnail
  if (photo.drive_file_id) {
    return getGoogleDriveUrls.thumbnail(photo.drive_file_id, size);
  }
  
  // Use Existing Thumbnail Or Fallback To Image URL
  if (photo.thumbnail_url) return getFullImageUrl({ image_url: photo.thumbnail_url });
  return getFullImageUrl(photo);
};

export default function PhotosManager() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image_url: '',
    thumbnail_url: '',
    tags: [],
    published: true,
    order: 0
  });
  const [newTag, setNewTag] = useState('');
  const [categories] = useState(['Portrait', 'Event', 'Landscape', 'Product', 'Wedding', 'Fashion', 'Street', 'Other']);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await getPhotos();
      setPhotos(response.data || []);
    } catch (error) {
      console.error('Error Loading Photos:', error);
      showMessage('error', 'Failed To Load Photos');
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
      category: '',
      image_url: '',
      thumbnail_url: '',
      tags: [],
      published: true,
      order: 0
    });
    setNewTag('');
    setEditingPhoto(null);
  };

  const openModal = (photo = null) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title || '',
        description: photo.description || '',
        category: photo.category || '',
        image_url: photo.image_url || '',
        thumbnail_url: photo.thumbnail_url || '',
        tags: photo.tags || [],
        published: photo.published !== undefined ? photo.published : true,
        order: photo.order || 0
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
      if (editingPhoto) {
        await updatePhoto(editingPhoto._id, formData);
        showMessage('success', 'Photo Updated Successfully!');
      } else {
        await createPhoto(formData);
        showMessage('success', 'Photo Created Successfully!');
      }
      closeModal();
      loadPhotos();
    } catch (error) {
      console.error('Save Error:', error);
      showMessage('error', 'Failed To Save Photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are You Sure You Want To Delete This Photo?')) return;

    try {
      await deletePhoto(photoId);
      showMessage('success', 'Photo Deleted Successfully!');
      loadPhotos();
    } catch (error) {
      console.error('Delete Error:', error);
      showMessage('error', 'Failed To Delete Photo');
    }
  };

  const togglePublished = async (photo) => {
    try {
      await updatePhoto(photo._id, { published: !photo.published });
      loadPhotos();
    } catch (error) {
      console.error('Toggle Error:', error);
      showMessage('error', 'Failed To Update Photo');
    }
  };

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="spinner"></div>
        <p>Loading Photos...</p>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <div>
          <h2>Photography Management</h2>
          <p>Manage Your Photography Portfolio</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          + Add Photo
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="empty-state">
          <h3>No Photos Yet</h3>
          <p>Start Building Your Photography Portfolio By Adding Your First Photo.</p>
          <button className="add-btn" onClick={() => openModal()}>
            + Add Your First Photo
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {photos.map((photo) => (
            <div key={photo._id} className={`item-card ${!photo.published ? 'unpublished' : ''}`}>
              <div className="item-image">
                {(photo.image_url || photo.drive_file_id) ? (
                  <img src={getThumbnailUrl(photo, 400)} alt={photo.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <div className="item-overlay">
                  <button className="edit-btn" onClick={() => openModal(photo)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(photo._id)}>Delete</button>
                </div>
              </div>
              <div className="item-content">
                <h3>{photo.title}</h3>
                <p className="category">{photo.category}</p>
                <div className="item-meta">
                  <span className={`status ${photo.published ? 'published' : 'draft'}`}>
                    {photo.published ? 'Published' : 'Draft'}
                  </span>
                  <button
                    className="toggle-btn"
                    onClick={() => togglePublished(photo)}
                  >
                    {photo.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPhoto ? 'Edit Photo' : 'Add New Photo'}</h3>
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
                <label>Category</label>
                <CustomSelect
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Select Category"
                  required
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                />
              </div>

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
                <label>Main Image URL</label>
                <small style={{color: '#888', display: 'block', marginBottom: '8px'}}>
                  Paste Google Drive link or upload image
                </small>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/... Or Upload Below"
                />
                <div className="upload-area" style={{marginTop: '10px'}}>
                  {formData.image_url ? (
                    <div className="uploaded-image">
                      <img 
                        src={getGoogleDriveUrls.isDriveUrl(formData.image_url) 
                          ? getGoogleDriveUrls.thumbnail(getGoogleDriveUrls.extractId(formData.image_url), 400)
                          : getFullImageUrl({ image_url: formData.image_url })
                        } 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{display: 'none', padding: '20px', background: '#f5f5f5', textAlign: 'center'}}>
                        Preview not available
                      </div>
                    </div>
                  ) : null}
                </div>
                <small>Paste Google Drive URL - file ID Will Be Automatically Extracted</small>
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
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : (editingPhoto ? 'Update Photo' : 'Add Photo')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}