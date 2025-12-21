import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getEdits, getFeaturedEdit, API_URL, getGoogleDriveUrls } from '../services/Api.js';
import './Photography.css';

// Helper To Get Full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

// Helper To Convert YouTube or Google Drive URL To Embed Format
const getEmbedUrl = (videoUrl) => {
  if (!videoUrl) return null;
  
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : videoUrl;
  } else if (videoUrl.includes('drive.google.com')) {
    const fileId = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId[1]}/preview`;
    }
    const directId = videoUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (directId) {
      return `https://drive.google.com/file/d/${directId[1]}/preview`;
    }
    return videoUrl;
  }
  // For Direct URLs, Return Full URL
  return getFullUrl(videoUrl);
};

// Helper To Get Thumbnail URL With Google Drive Support
const getThumbnailUrl = (edit) => {
  // Priority: drive_file_id > thumbnail_url > fallback
  if (edit.drive_file_id) {
    return getGoogleDriveUrls.thumbnail(edit.drive_file_id);
  }
  if (edit.thumbnail_url) {
    return getFullUrl(edit.thumbnail_url);
  }
  return null;
};

// Helper To Get Embed URL With Google Drive Support
const getVideoEmbedUrl = (edit) => {
  // Priority: drive_file_id > video_url
  if (edit.drive_file_id) {
    return getGoogleDriveUrls.embed(edit.drive_file_id);
  }
  if (edit.video_url) {
    return getEmbedUrl(edit.video_url);
  }
  return null;
};

// Helper To Get Full Video URL With Google Drive Support
const getFullVideoUrl = (edit) => {
  if (edit.drive_file_id) {
    return getGoogleDriveUrls.direct(edit.drive_file_id);
  }
  return getFullUrl(edit.video_url);
};

export default function VideoEditing() {
  const [edits, setEdits] = useState([]);
  const [featuredEdit, setFeaturedEdit] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [editsResponse, featuredResponse] = await Promise.all([
        getEdits(),
        getFeaturedEdit().catch(() => null),
      ]);
      setEdits(editsResponse.data);
      if (featuredResponse) {
        setFeaturedEdit(featuredResponse.data);
      }
    } catch (error) {
      console.error('Error Loading Edits:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEmbeddable = (videoUrl) => {
    return videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('drive.google.com'));
  };

  return (
    <div className="video-editing-page">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Video Editing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transforming Raw Footage Into Compelling Stories
          </motion.p>
        </div>
      </section>

      {featuredEdit && (
        <section className="featured-section">
          <div className="container">
            <motion.div
              className="featured-showreel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2>Featured Showreel</h2>
              <div className="video-wrapper">
                <iframe
                  src={getVideoEmbedUrl(featuredEdit)}
                  title={featuredEdit.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="featured-info">
                <h3>{featuredEdit.title}</h3>
                <p>{featuredEdit.description}</p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="gallery-section">
        <div className="container">
          <h2 className="section-title">Recent Projects</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="photo-grid">
              <>
                {edits.filter(edit => !edit.is_featured).map((edit, index) => (
                  <motion.div
                    key={edit._id}
                    className="photo-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedEdit(edit)}
                  >
                    {getThumbnailUrl(edit) ? (
                      <img src={getThumbnailUrl(edit)} alt={edit.title} loading="lazy" />
                    ) : (edit.video_url || edit.drive_file_id) ? (
                      isEmbeddable(edit.video_url) || edit.drive_file_id ? (
                        <iframe
                          src={getVideoEmbedUrl(edit)}
                          title={edit.title}
                          style={{ width: '100%', height: '180px', borderRadius: '10px', background: '#222', border: 'none', pointerEvents: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          className="video-preview"
                          src={getFullVideoUrl(edit)}
                          controls={false}
                          preload="metadata"
                          style={{ width: '100%', height: '180px', objectFit: 'cover', background: '#222', borderRadius: '10px', pointerEvents: 'none' }}
                          onMouseOver={e => e.target.play()}
                          onMouseOut={e => e.target.pause()}
                        />
                      )
                    ) : null}
                    <div className="photo-overlay">
                      <h3>{edit.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </>
            </div>
          )}
        </div>
      </section>

      {selectedEdit && (
        <div className="modal" onClick={() => setSelectedEdit(null)}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEdit(null)}>
              ×
            </button>
            <div className="modal-video-center">
              <div className="modal-video-aspect">
                {isEmbeddable(selectedEdit.video_url) || selectedEdit.drive_file_id ? (
                  <iframe
                    src={getVideoEmbedUrl(selectedEdit)}
                    title={selectedEdit.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', borderRadius: '16px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}
                  />
                ) : (selectedEdit.video_url || selectedEdit.drive_file_id) ? (
                  <video
                    controls
                    src={getFullVideoUrl(selectedEdit)}
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
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{selectedEdit.title}</h2>
              <p style={{ fontSize: '1.15rem', color: '#ccc', marginBottom: '1rem' }}>{selectedEdit.description}</p>
              {selectedEdit.tags && selectedEdit.tags.length > 0 && (
                <div className="tags">
                  {selectedEdit.tags.map((tag, index) => (
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