import axios from 'axios';

// Determine API URL Using Vite env (import.meta.env.VITE_API_URL),
// A Runtime Window Shim (window.__env.REACT_APP_API_URL), Or A Sensible Default.
let API_URL = 'http://localhost:8000';

try {
  // import.meta Is Available In ESM; Wrap In Try/Catch So Code Is Safe In All Environments
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL;
  }
} catch (e) {
  /* ignore */
}

if (typeof window !== 'undefined' && window.__env && window.__env.REACT_APP_API_URL) {
  API_URL = window.__env.REACT_APP_API_URL;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile
export const getProfile = () => api.get('/api/profile');

// Photos
export const getPhotos = (params) => api.get('/api/photos', { params: { ...params, published_only: true } });
export const getPhotoCategories = () => api.get('/api/photos/categories');

// Videos
export const getVideos = (params) => api.get('/api/videos', { params: { ...params, published_only: true } });

// Edits
export const getEdits = (params) => api.get('/api/edits', { params: { ...params, published_only: true } });
export const getFeaturedEdit = () => api.get('/api/edits/featured');

// Contact
export const sendContactMessage = (data) => api.post('/api/contact', data);

// Analytics - Track Page Visits
export const trackPageVisit = (page) => {
  return api.post('/api/analytics/track', {
    page,
    referrer: document.referrer || ''
  }).catch(() => {
    // Silently fail - analytics should not break the app
  });
};

// Google Drive Media URLs
export const getDriveFileUrls = (fileId) => api.get(`/api/media/drive/${fileId}`);
export const getDriveThumbnail = (fileId, size = 800) => api.get(`/api/media/drive/${fileId}/thumbnail`, { params: { size } });
export const getDriveDirectUrl = (fileId) => api.get(`/api/media/drive/${fileId}/direct`);
export const getDriveEmbedUrl = (fileId) => api.get(`/api/media/drive/${fileId}/embed`);
export const extractDriveFileId = (url) => api.post('/api/media/drive/extract-id', { url });

// Helper Functions for Google Drive
export const getGoogleDriveUrls = {
  /**
   * Get Direct download/view URL For Google Drive File
   */
  direct: (fileId) => `https://drive.google.com/uc?export=view&id=${fileId}`,
  
  /**
   * Get Thumbnail URL For Google Drive File
   */
  thumbnail: (fileId, size = 800) => `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
  
  /**
   * Get Embed URL For Google Drive Video
   */
  embed: (fileId) => `https://drive.google.com/file/d/${fileId}/preview`,
  
  /**
   * Extract file ID From Google Drive URL
   */
  extractId: (url) => {
    if (!url) return null;
    // Pattern For /d/{file_id}
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    
    // Pattern For id={file_id}
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    
    // If It's Already Just An ID
    if (/^[a-zA-Z0-9_-]+$/.test(url)) return url;
    
    return null;
  }
};

// Export API_URL for use in components
export { API_URL };

export default api;