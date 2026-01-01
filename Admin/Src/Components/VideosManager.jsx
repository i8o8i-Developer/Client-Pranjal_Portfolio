// Helper To Format Video Type As Pascal Case
const toPascalCase = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
import React, { useState, useEffect } from 'react';
import { getVideos, createVideo, updateVideo, deleteVideo, API_URL } from '../services/Api.js';
import './Manager.css';
import CustomSelect from './CustomSelect.jsx';

// Helper To Get Full URL (Cloudinary only)
const getFullUrl = (url) => {
  if (!url) return '';
  return url;
};

// Helper To Get Preview Thumbnail (Cloudinary only)
const getPreviewThumbnail = (video) => {
  if (video.thumbnail_url) return getFullUrl(video.thumbnail_url);
  return null;
};

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_type: 'youtube',
    video_url: '',
    thumbnail_url: '',
    category: '',
    tags: [],
    published: true,
    order: 0
  });
  const [newTag, setNewTag] = useState('');
  const [categories] = useState(['Music Video', 'Documentary', 'Commercial', 'Short Film', 'Corporate', 'Wedding', 'Event', 'Cinematic', 'Other']);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await getVideos();
      setVideos(response.data || []);
    } catch (error) {
      console.error('Error Loading Videos:', error);
      showMessage('error', 'Failed To Load Videos');
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
      video_type: 'youtube',
      video_url: '',
      thumbnail_url: '',
      category: '',
      tags: [],
      published: true,
      order: 0
    });
    setNewTag('');
    setEditingVideo(null);
  };

  const openModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title || '',
        description: video.description || '',
        video_type: video.video_type || 'youtube',
        video_url: video.video_url || '',
        thumbnail_url: video.thumbnail_url || '',
        category: video.category || '',
        tags: video.tags || [],
        published: video.published !== undefined ? video.published : true,
        order: video.order || 0
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

  const getEmbedUrl = (url, type) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
    }
    // For Direct/mp4 Links, Return As-Is
    return url;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingVideo) {
        await updateVideo(editingVideo._id, formData);
        showMessage('success', 'Video Updated Successfully!');
      } else {
        await createVideo(formData);
        showMessage('success', 'Video Created Successfully!');
      }
      closeModal();
      loadVideos();
    } catch (error) {
      console.error('Save Error:', error);
      showMessage('error', 'Failed To Save Video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are You Sure You Want To Delete This Video?')) return;

    try {
      await deleteVideo(videoId);
      showMessage('success', 'Video Deleted Successfully!');
      loadVideos();
    } catch (error) {
      console.error('Delete Error:', error);
      showMessage('error', 'Failed To Delete Video');
    }
  };

  const togglePublished = async (video) => {
    try {
      await updateVideo(video._id, { published: !video.published });
      loadVideos();
    } catch (error) {
      console.error('Toggle Error:', error);
      showMessage('error', 'Failed To Update Video');
    }
  };

  // Handle Cloudinary Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setUploadingVideo(true);
    try {
      const formDataData = new FormData();
      formDataData.append('file', file);
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/api/videos/upload-video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataData
      });
      if (!res.ok) throw new Error('Video Upload Failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, video_url: data.video_url }));
      showMessage('success', 'Video Uploaded!');
    } catch (err) {
      showMessage('error', 'Failed To Upload Video');
    } finally {
      setUploadingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="spinner"></div>
        <p>Loading Videos...</p>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <div>
          <h2>Videography Management</h2>
          <p>Manage Your Video Portfolio</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          + Add Video
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="empty-state">
          <h3>No Videos Yet</h3>
          <p>Start Building Your Video Portfolio By Adding Your First Video.</p>
          <button className="add-btn" onClick={() => openModal()}>
            + Add Your First Video
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {videos.map((video) => (
            <div key={video._id} className={`item-card ${!video.published ? 'unpublished' : ''}`}>
              <div className="item-image video-thumbnail">
                {(() => {
                  const thumb = getPreviewThumbnail(video);
                  if (thumb) {
                    return <img src={thumb} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '10px' }} />;
                  } else if (video.video_url) {
                    return (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: '#181818', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video
                          className="video-preview"
                          src={getFullUrl(video.video_url)}
                          controls={false}
                          preload="metadata"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#222' }}
                          onMouseOver={e => e.target.play()}
                          onMouseOut={e => e.target.pause()}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: '#222', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: '2.5rem' }}>
                        <span className="video-icon">▶</span>
                      </div>
                    );
                  }
                })()}
                <span className="video-type-badge">{toPascalCase(video.video_type)}</span>
                <div className="item-overlay">
                  <button className="edit-btn" onClick={() => openModal(video)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(video._id)}>Delete</button>
                </div>
              </div>
              <div className="item-content">
                <h3>{video.title}</h3>
                <p className="description">{video.description?.substring(0, 80)}...</p>
                <div className="item-meta">
                  <span className={`status ${video.published ? 'published' : 'draft'}`}>
                    {video.published ? 'Published' : 'Draft'}
                  </span>
                  <button
                    className="toggle-btn"
                    onClick={() => togglePublished(video)}
                  >
                    {video.published ? 'Unpublish' : 'Publish'}
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
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVideo ? 'Edit Video' : 'Add New Video'}</h3>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Video Source</label>
                  <CustomSelect
                    name="video_type"
                    value={formData.video_type}
                    onChange={handleChange}
                    options={[
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'cloudinary', label: 'Cloudinary Upload' }
                    ]}
                  />
                </div>

                {formData.video_type === 'cloudinary' && (
                  <div className="form-group flex-2">
                    <label>Upload Video File</label>
                    <input
                      type="file"
                      name="video_file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                    {uploadingVideo && <div>Uploading Video...</div>}
                  </div>
                )}
              </div>

              {formData.video_url && (
                <div className="video-preview">
                  <label>Preview</label>
                  {formData.video_type === 'youtube' ? (
                    <iframe
                      src={getEmbedUrl(formData.video_url, formData.video_type)}
                      title="Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls src={formData.video_url} style={{ width: '100%', maxHeight: '300px' }}>
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
                <label>Category</label>
                <CustomSelect
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Category...' },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              </div>

              <div className="form-group">
                <label>Thumbnail URL (Optional - Auto-Generated From Cloudinary)</label>
                <input
                  type="url"
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/... Or Leave Empty"
                />
                <small>Paste Cloudinary URL or Leave Empty - Auto-Generated From Video Upload</small>
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
                  {saving ? 'Saving...' : (editingVideo ? 'Update Video' : 'Add Video')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}