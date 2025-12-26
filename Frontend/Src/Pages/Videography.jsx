import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getVideos, getVideoCategories, API_URL, getGoogleDriveUrls } from '../services/Api.js';
import './Photography.css';

// Helper To Get Full URL For Images
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

export default function Videography() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadVideos();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const categoriesResponse = await getVideoCategories();
      setCategories(['all', ...categoriesResponse.data.categories]);
      setError(null);
    } catch (error) {
      console.error('Error Loading Categories:', error);
      setError('Failed To Load Categories');
      setCategories(['all']);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await getVideos(params);
      setVideos(response.data);
      setError(null);
    } catch (error) {
      console.error('Error Loading Videos:', error);
      setError('Failed To Load Videos. Please Try Again Later.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (video) => {
    const { video_type, video_url, drive_file_id } = video;

    // Priority 1: Use Google Drive file ID If Available
    if (drive_file_id) {
      return getGoogleDriveUrls.embed(drive_file_id);
    }

    // Priority 2: Handle Based On Video Type
    if (video_type === 'youtube') {
      const videoId = video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : video_url;
    } else if (video_type === 'gdrive' || video_url?.includes('drive.google.com')) {
      const fileId = getGoogleDriveUrls.extractId(video_url);
      if (fileId) {
        return getGoogleDriveUrls.embed(fileId);
      }
      return video_url;
    }
    
    // For Direct/Upload Types, Return Full URL
    return getFullUrl(video_url);
  };

  const isEmbeddable = (videoType) => {
    return videoType === 'youtube' || videoType === 'gdrive';
  };

  return (
    <div className="videography-page">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Videography
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Cinematic Storytelling Through Motion
          </motion.p>
        </div>
      </section>

      <section className="gallery-section">
        <div className="container">
          {categories.length > 0 && (
            <div className="filter-bar">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="photo-grid">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  className="photo-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedVideo(video)}
                >
                  {(() => {
                    const thumb = getPreviewThumbnail(video);
                    if (thumb) {
                      return <img src={thumb} alt={video.title} loading="lazy" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '10px' }} />;
                    } else if (video.video_url) {
                      return (
                        <div className="video-preview-outer">
                          <video
                            className="video-preview"
                            src={getFullUrl(video.video_url)}
                            controls={false}
                            preload="metadata"
                            onMouseOver={e => e.target.play()}
                            onMouseOut={e => e.target.pause()}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="video-placeholder">
                          <span>▶</span>
                        </div>
                      );
                    }
                  })()}
                  <div className="photo-overlay">
                    <h3>{video.title}</h3>
                    <p>{video.category || video.video_type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedVideo && (
        <div className="modal" onClick={() => setSelectedVideo(null)}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVideo(null)}>
              ×
            </button>
            <div className="modal-video-center">
              <div className="modal-video-aspect">
                {isEmbeddable(selectedVideo.video_type) ? (
                  <iframe
                    src={getEmbedUrl(selectedVideo)}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', borderRadius: '16px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}
                  />
                ) : selectedVideo.video_url ? (
                  <video
                    controls
                    src={getFullUrl(selectedVideo.video_url)}
                    style={{ width: '100%', height: '100%', borderRadius: '16px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)', background: '#222' }}
                  />
                ) : (
                  <div className="video-placeholder-large">
                    <span>▶</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-info">
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{selectedVideo.title}</h2>
              <p style={{ fontSize: '1.15rem', color: '#ccc', marginBottom: '1rem' }}>{selectedVideo.description}</p>
              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <div className="tags">
                  {selectedVideo.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}