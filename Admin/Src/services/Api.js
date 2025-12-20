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
      // Token expired or invalid - clear it and redirect to login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => 
  api.post('/api/auth/login', { email, password });

export const verifyToken = () => 
  api.get('/api/auth/verify');

// Profile
export const getProfile = () => api.get('/api/profile');
export const updateProfile = (data) => api.put('/api/profile', data);

// Photos
export const getPhotos = (params) => api.get('/api/photos', { params: { ...params, published_only: false } });
export const createPhoto = (data) => api.post('/api/photos', data);
export const updatePhoto = (id, data) => api.put(`/api/photos/${id}`, data);
export const deletePhoto = (id) => api.delete(`/api/photos/${id}`);

// Videos
export const getVideos = (params) => api.get('/api/videos', { params: { ...params, published_only: false } });
export const createVideo = (data) => api.post('/api/videos', data);
export const updateVideo = (id, data) => api.put(`/api/videos/${id}`, data);
export const deleteVideo = (id) => api.delete(`/api/videos/${id}`);

// Edits
export const getEdits = (params) => api.get('/api/edits', { params: { ...params, published_only: false } });
export const createEdit = (data) => api.post('/api/edits', data);
export const updateEdit = (id, data) => api.put(`/api/edits/${id}`, data);
export const deleteEdit = (id) => api.delete(`/api/edits/${id}`);

// Contact Messages
export const getMessages = (params) => api.get('/api/contact', { params });
export const markMessageRead = (id) => api.put(`/api/contact/${id}/read`);
export const deleteMessage = (id) => api.delete(`/api/contact/${id}`);

// Upload
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // Return Full URL For The Uploaded Image
  if (response.data && response.data.url) {
    response.data.url = `${API_URL}${response.data.url}`;
  }
  return response;
};

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // Return Full URL For The Uploaded Video
  if (response.data && response.data.url) {
    response.data.url = `${API_URL}${response.data.url}`;
  }
  return response;
};

// Analytics
export const getAnalyticsStats = (hours = 24) => api.get('/api/analytics/stats', { params: { hours } });
export const getRealtimeVisitors = () => api.get('/api/analytics/realtime');

// Export API_URL For Use In Components
export { API_URL };

export default api;