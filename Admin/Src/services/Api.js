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
  /* Ignore */
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

// Add Token To Requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Responses - Token Expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token Expired Or Invalid - Clear It And Redirect To Login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Cloudinary Upload Endpoints
export const uploadPhotoImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/photos/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadVideoThumbnail = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/videos/upload-thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Auth
export const login = (email, password) => 
  api.post('/api/auth/login', { email, password });

export const verifyToken = () => 
  api.get('/api/auth/verify');

// Profile
export const getProfile = () => api.get('/api/profile');
export const updateProfile = (data) => api.put('/api/profile', data);
export const createProfile = (data) => api.post('/api/profile', data);

// Photos
export const getPhotos = (params) => api.get('/api/photos', { params });
export const createPhoto = (data) => api.post('/api/photos', data);
export const updatePhoto = (id, data) => api.put(`/api/photos/${id}`, data);
export const deletePhoto = (id) => api.delete(`/api/photos/${id}`);
export const getPhotoCategories = () => api.get('/api/photos/categories');

// Videos
export const getVideos = (params) => api.get('/api/videos', { params });
export const createVideo = (data) => api.post('/api/videos', data);
export const updateVideo = (id, data) => api.put(`/api/videos/${id}`, data);
export const deleteVideo = (id) => api.delete(`/api/videos/${id}`);
export const getVideoCategories = () => api.get('/api/videos/categories');

// Edits
export const getEdits = (params) => api.get('/api/edits', { params });
export const createEdit = (data) => api.post('/api/edits', data);
export const updateEdit = (id, data) => api.put(`/api/edits/${id}`, data);
export const deleteEdit = (id) => api.delete(`/api/edits/${id}`);
export const getEditCategories = () => api.get('/api/edits/categories');
export const getFeaturedEdit = () => api.get('/api/edits/featured');

// Messages
export const getMessages = () => api.get('/api/contact');
export const markMessageRead = (id) => api.put(`/api/contact/${id}/read`);
export const deleteMessage = (id) => api.delete(`/api/contact/${id}`);

// Analytics
export const getAnalyticsStats = () => api.get('/api/analytics/stats');
export const getRealtimeVisitors = () => api.get('/api/analytics/realtime');

// Export API_URL For Use In Components
export { API_URL };

export default api;