import React, { useState, useEffect } from 'react';
import { getVideos, createVideo, updateVideo, deleteVideo, API_URL, getGoogleDriveUrls } from '../services/Api.js';
import './Manager.css';
import CustomSelect from './CustomSelect.jsx';

// Helper To Get Full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

// Helper To Get Preview Thumbnail URL For Grid
const getPreviewThumbnail = (video) => {
  // Priority 1: Use Google Drive file ID If Available
  if (video.drive_file_id) {
    return getGoogleDriveUrls.thumbnail(video.drive_file_id, 800);
  }
  
  // Priority 2: Use Existing Thumbnail
  if (video.thumbnail_url) return getFullUrl(video.thumbnail_url);
  
  // Priority 3: Generate From Video Type
  if (video.video_type === 'youtube' && video.video_url) {
    const match = video.video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    const id = match ? match[1] : null;
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  
  // Priority 4: Try To Extract Google Drive ID From URL
  if ((video.video_type === 'gdrive' || video.video_url?.includes('drive.google.com')) && video.video_url) {
    const fileId = getGoogleDriveUrls.extractId(video.video_url);
    if (fileId) return getGoogleDriveUrls.thumbnail(fileId, 800);
  }
  
  return null;
};

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_type: 'youtube',
    video_url: '',
    thumbnail_url: '',
    tags: [],
    published: true,
    order: 0
  });
  const [newTag, setNewTag] = useState('');

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
    } else if (type === 'gdrive') {
      // Google Drive: Extract File ID And Create Embed URL
      const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId[1]}/preview`;
      }
      // Also Support Direct File IDs
      const directId = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (directId) {
        return `https://drive.google.com/file/d/${directId[1]}/preview`;
      }
      return url;
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
                <span className="video-type-badge">{video.video_type}</span>
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
                  <label>Video Type</label>
                  <CustomSelect
                    name="video_type"
                    value={formData.video_type}
                    onChange={handleChange}
                    options={[
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'gdrive', label: 'Google Drive' },
                      { value: 'direct', label: 'Direct URL / MP4' },
                      { value: 'upload', label: 'Upload Video File' }
                    ]}
                  />
                </div>

                <div className="form-group flex-2">
                  <label>Video URL</label>
                  <small style={{color: '#888', display: 'block', marginBottom: '8px'}}>
                    {formData.video_type === 'youtube' && 'YouTube URL or video ID'}
                    {formData.video_type === 'gdrive' && 'Google Drive link (Any Format) Or File ID'}
                    {formData.video_type === 'direct' && 'Direct Video File URL'}
                    {formData.video_type === 'upload' && 'Use Google Drive Instead - Paste Drive URL Here'}
                      </small>
                      <input
                        type="text"
                        name="video_url"
                        value={formData.video_url}
                        onChange={handleChange}
                        placeholder={
                          formData.video_type === 'youtube' ? 'https://youtube.com/watch?v=... Or Video ID' :
                          formData.video_type === 'gdrive' ? 'https://drive.google.com/file/d/.../view Or File ID' :
                          'https://example.com/video.mp4'
                        }
                        required
                      />
                </div>
              </div>

              {formData.video_url && (
                <div className="video-preview">
                  <label>Preview</label>
                  {(formData.video_type === 'youtube' || formData.video_type === 'gdrive') ? (
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
                <label>Thumbnail URL (Optional - Auto-Generated From Google Drive)</label>
                <input
                  type="url"
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/... Or Leave Empty"
                />
                <small>Paste Google Drive URL or Leave Empty - Auto-Generated From Video File ID</small>
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