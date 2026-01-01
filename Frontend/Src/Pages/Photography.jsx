import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPhotos, getPhotoCategories, API_URL } from '../services/Api.js';
import './Photography.css';

// Helper To Get Full URL For Images (Cloudinary Only)
const getFullImageUrl = (photo) => {
  if (!photo) return '';
  const url = photo.image_url || photo;
  if (!url) return '';
  return url;
};

// Helper To Get Thumbnail URL (Cloudinary only)
const getThumbnailUrl = (photo, size = 800) => {
  if (!photo) return '';
  if (photo.thumbnail_url) return photo.thumbnail_url;
  return getFullImageUrl(photo);
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
                    src={getThumbnailUrl(photo)}
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
          <div className="modal-content photo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>
              ×
            </button>
            <div className="modal-image-center">
              <div className="modal-image-wrapper">
                <img 
                  src={getFullImageUrl(selectedPhoto)} 
                  alt={selectedPhoto.title}
                  onError={(e) => {
                    console.error('Image failed to load:', getFullImageUrl(selectedPhoto));
                    e.target.style.border = '2px solid red';
                  }}
                  onLoad={(e) => {
                    console.log('Image loaded successfully:', getFullImageUrl(selectedPhoto));
                  }}
                />
              </div>
            </div>
            <div className="modal-info">
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{selectedPhoto.title}</h2>
              <p style={{ fontSize: '1.15rem', color: '#ccc', marginBottom: '1rem' }}>{selectedPhoto.description}</p>
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