import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPhotos, getPhotoCategories, API_URL } from '../services/Api.js';
import './Photography.css';

// Helper to get full URL for images
const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

export default function Photography() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const categoriesResponse = await getPhotoCategories();
      setCategories(['all', ...categoriesResponse.data.categories]);
      setError(null);
    } catch (error) {
      console.error('Error Loading Categories:', error);
      setError('Failed To Load Categories');
      setCategories(['all']);
    }
  };

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await getPhotos(params);
      setPhotos(response.data);
      setError(null);
    } catch (error) {
      console.error('Error Loading Photos:', error);
      setError('Failed To Load Photos. Please Try Again Later.');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="photography-page">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Photography
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Capturing Moments With Artistic Vision
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
              {photos.map((photo, index) => (
                <motion.div
                  key={photo._id}
                  className="photo-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={getFullImageUrl(photo.thumbnail_url || photo.image_url)}
                    alt={photo.title}
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <h3>{photo.title}</h3>
                    <p>{photo.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedPhoto && (
        <div className="modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>
              ×
            </button>
            <img src={getFullImageUrl(selectedPhoto.image_url)} alt={selectedPhoto.title} />
            <div className="modal-info">
              <h2>{selectedPhoto.title}</h2>
              <p>{selectedPhoto.description}</p>
              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div className="tags">
                  {selectedPhoto.tags.map((tag, index) => (
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