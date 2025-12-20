import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadImage, API_URL } from '../services/Api.js';
import './Manager.css';

// Helper To Get Full URL
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadImage(file);
      setProfile(prev => ({ ...prev, profile_image: response.data.url }));
      showMessage('success', 'Image Uploaded Successfully');
    } catch (error) {
      console.error('Upload Error:', error);
      showMessage('error', 'Failed To Upload Image');
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
          <div className="image-upload-container">
            <div className="image-preview">
              {profile.profile_image ? (
                <img src={getFullUrl(profile.profile_image)} alt="Profile" />
              ) : (
                <div className="image-placeholder">
                  <span>{profile.full_name?.[0] || 'P'}</span>
                </div>
              )}
            </div>
            <div className="image-upload-actions">
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
                Upload New Image
              </label>
              {profile.profile_image && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => setProfile(prev => ({ ...prev, profile_image: '' }))}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBrand())}
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftware())}
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