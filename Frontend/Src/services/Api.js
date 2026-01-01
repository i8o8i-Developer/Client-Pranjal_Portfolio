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
export const getVideoCategories = () => api.get('/api/videos/categories');

// Edits
export const getEdits = (params) => api.get('/api/edits', { params: { ...params, published_only: true } });
export const getEditCategories = () => api.get('/api/edits/categories');
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

// Export API_URL for use in components
export { API_URL };

export default api;