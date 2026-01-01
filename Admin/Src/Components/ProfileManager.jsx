import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, createProfile, API_URL } from '../services/Api.js';
import './Manager.css';

// Helper To Get Profile Image URL (Cloudinary Or Direct)
const getProfileImageUrl = (profile) => {
  if (profile.profile_image) {
    return profile.profile_image;
  }
  return '';
};

export default function ProfileManager() {
  const [profile, setProfile] = useState({
    full_name: '',
    tagline: '',
    bio: '',
    profile_image: '',
    skills: [],
    experience: '',
    brands: [],
    software: [],
    social_instagram: '',
    social_youtube: '',
    social_vimeo: '',
    social_behance: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newSkill, setNewSkill] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newSoftware, setNewSoftware] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      if (response.data) {
        setProfile({
          full_name: response.data.full_name || '',
          tagline: response.data.tagline || '',
          bio: response.data.bio || '',
          profile_image: response.data.profile_image || '',
          skills: response.data.skills || [],
          experience: response.data.experience || '',
          brands: response.data.brands || [],
          software: response.data.software || [],
          social_instagram: response.data.social_instagram || '',
          social_youtube: response.data.social_youtube || '',
          social_vimeo: response.data.social_vimeo || '',
          social_behance: response.data.social_behance || ''
        });
      }
    } catch (error) {
      console.error('Error Loading Profile:', error);
      showMessage('error', 'Failed To Load Profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle Cloudinary Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setUploadingImage(true);
    try {
      // Try Upload, Auto-Create Profile if Needed
      let uploadAttempted = false;
      let uploadSuccess = false;
      let lastError = null;
      for (let attempt = 0; attempt < 2 && !uploadSuccess; attempt++) {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_URL}/api/profile/upload-image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        uploadAttempted = true;
        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({ ...prev, profile_image: data.profile_image }));
          showMessage('success', 'Profile Image Uploaded!');
          uploadSuccess = true;
          break;
        } else {
          let errorMsg = 'Failed To Upload Image';
          let errData = null;
          try {
            errData = await res.json();
          } catch {}
          if (errData && errData.detail && errData.detail.includes('Profile Not Found')) {
            // Auto-Create Profile With Minimal/Default Data
            try {
              await createProfile({
                full_name: profile.full_name || 'Your Name',
                tagline: profile.tagline || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                experience: profile.experience || '',
                brands: profile.brands || [],
                software: profile.software || [],
                social_instagram: profile.social_instagram || '',
                social_youtube: profile.social_youtube || '',
                social_vimeo: profile.social_vimeo || '',
                social_behance: profile.social_behance || ''
              });
              // Try Upload Again
              continue;
            } catch (createErr) {
              errorMsg = 'Failed To Auto-Create Profile';
              lastError = createErr;
              break;
            }
          } else {
            lastError = errData;
            showMessage('error', errorMsg);
            break;
          }
        }
      }
      if (!uploadSuccess && lastError) {
        showMessage('error', 'Failed To Upload Image');
      }
    } catch (err) {
      showMessage('error', 'Failed To Upload Image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addBrand = () => {
    if (newBrand.trim() && !profile.brands.includes(newBrand.trim())) {
      setProfile(prev => ({ ...prev, brands: [...prev.brands, newBrand.trim()] }));
      setNewBrand('');
    }
  };

  const removeBrand = (brandToRemove) => {
    setProfile(prev => ({
      ...prev,
      brands: prev.brands.filter(brand => brand !== brandToRemove)
    }));
  };

  const addSoftware = () => {
    if (newSoftware.trim() && !profile.software.includes(newSoftware.trim())) {
      setProfile(prev => ({ ...prev, software: [...prev.software, newSoftware.trim()] }));
      setNewSoftware('');
    }
  };

  const removeSoftware = (softwareToRemove) => {
    setProfile(prev => ({
      ...prev,
      software: prev.software.filter(sw => sw !== softwareToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    console.log('Submitting profile:', profile);

    try {
      const response = await updateProfile(profile);
      console.log('Update response:', response);
      showMessage('success', 'Profile Updated Successfully!');
      // Reload profile to ensure we have the latest data from server
      await loadProfile();
    } catch (error) {
      console.error('Save Error:', error);
      console.error('Error response:', error.response);
      showMessage('error', error.response?.data?.detail || 'Failed To Update Profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Profile Management</h2>
        <p>Update Your Portfolio Profile Information</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="manager-form">
        {/* Profile Image */}
        <div className="form-section">
          <h3>Profile Image</h3>
          <div className="form-group">
            <label htmlFor="profile_image">Upload Profile Image</label>
            <input
              type="file"
              id="profile_image"
              name="profile_image"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            <small>Upload An Image (Cloudinary)</small>
          </div>
          {uploadingImage && <div>Uploading Image...</div>}
          {profile.profile_image && (
            <div className="image-preview" style={{ marginTop: '1rem', maxWidth: '200px' }}>
              <img src={getProfileImageUrl(profile)} alt="Profile" style={{ width: '100%', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={profile.tagline}
                onChange={handleChange}
                placeholder="e.g., Visual Storyteller"
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience</label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                placeholder="e.g., 3+ Years Experience"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="6"
              placeholder="Tell Your Story..."
            />
          </div>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3>Skills & Expertise</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add A Skill..."
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" onClick={addSkill} className="add-tag-btn">Add</button>
          </div>
          <div className="tags-list">
            {profile.skills.map((skill, index) => (
              <span key={index} className="tag">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="form-section">
          <h3>Brands Worked With</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="Add A Brand..."
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBrand(); } }}
            />
            <button type="button" onClick={addBrand} className="add-tag-btn">Add</button>
          </div>
          <div className="tags-list">
            {profile.brands.map((brand, index) => (
              <span key={index} className="tag brand">
                {brand}
                <button type="button" onClick={() => removeBrand(brand)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Software */}
        <div className="form-section">
          <h3>Software & Tools</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newSoftware}
              onChange={(e) => setNewSoftware(e.target.value)}
              placeholder="Add Software..."
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSoftware(); } }}
            />
            <button type="button" onClick={addSoftware} className="add-tag-btn">Add</button>
          </div>
          <div className="tags-list">
            {profile.software.map((sw, index) => (
              <span key={index} className="tag software">
                {sw}
                <button type="button" onClick={() => removeSoftware(sw)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h3>Social Links</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="social_instagram">Instagram</label>
              <input
                type="url"
                id="social_instagram"
                name="social_instagram"
                value={profile.social_instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_youtube">YouTube</label>
              <input
                type="url"
                id="social_youtube"
                name="social_youtube"
                value={profile.social_youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_vimeo">Vimeo</label>
              <input
                type="url"
                id="social_vimeo"
                name="social_vimeo"
                value={profile.social_vimeo}
                onChange={handleChange}
                placeholder="https://vimeo.com/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_behance">Behance</label>
              <input
                type="url"
                id="social_behance"
                name="social_behance"
                value={profile.social_behance}
                onChange={handleChange}
                placeholder="https://behance.net/..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}