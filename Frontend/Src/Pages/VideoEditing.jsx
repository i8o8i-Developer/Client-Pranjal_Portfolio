import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getEdits, getFeaturedEdit, API_URL } from '../services/Api.js';
import './Photography.css';

// Helper to get full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
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

  const getEmbedUrl = (videoUrl) => {
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
    // For direct URLs, return full URL
    return getFullUrl(videoUrl);
  };

  const isEmbeddable = (videoUrl) => {
    return videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('drive.google.com');
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
                  src={getEmbedUrl(featuredEdit.video_url)}
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
                  {edit.thumbnail_url ? (
                    <img src={getFullUrl(edit.thumbnail_url)} alt={edit.title} loading="lazy" />
                  ) : (
                    <div className="video-placeholder">
                      <span>▶</span>
                    </div>
                  )}
                  <div className="photo-overlay">
                    <h3>{edit.title}</h3>
                  </div>
                </motion.div>
              ))}
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
            <div className="video-wrapper">
              {isEmbeddable(selectedEdit.video_url) ? (
                <iframe
                  src={getEmbedUrl(selectedEdit.video_url)}
                  title={selectedEdit.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls src={getFullUrl(selectedEdit.video_url)} />
              )}
            </div>
            <div className="modal-info">
              <h2>{selectedEdit.title}</h2>
              <p>{selectedEdit.description}</p>
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