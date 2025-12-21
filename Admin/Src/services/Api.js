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


// Analytics
export const getAnalyticsStats = (hours = 24) => api.get('/api/analytics/stats', { params: { hours } });
export const getRealtimeVisitors = () => api.get('/api/analytics/realtime');

// Google Drive Media URLs
export const getDriveFileUrls = (fileId) => api.get(`/api/media/drive/${fileId}`);
export const getDriveThumbnail = (fileId, size = 800) => api.get(`/api/media/drive/${fileId}/thumbnail`, { params: { size } });
export const getDriveDirectUrl = (fileId) => api.get(`/api/media/drive/${fileId}/direct`);
export const getDriveEmbedUrl = (fileId) => api.get(`/api/media/drive/${fileId}/embed`);
export const extractDriveFileId = (url) => api.post('/api/media/drive/extract-id', { url });
export const listDriveFolderFiles = (folderId, pageSize = 100) => api.get(`/api/media/drive/folder/${folderId}/files`, { params: { page_size: pageSize } });

// Helper Functions For Google Drive
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
   * Extract File ID From Google Drive URL
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
  },
  
  /**
   * Check If URL Is A Google Drive URL
   */
  isDriveUrl: (url) => {
    return url && url.includes('drive.google.com');
  }
};

// Export API_URL For Use In Components
export { API_URL };

export default api;