import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProfile, API_URL } from '../services/Api.js';
import './About.css';

// Helper to get full URL for images
const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

export default function About() {
  const defaultProfile = {
    full_name: 'Pranjal',
    tagline: 'Visual Storyteller',
    bio: 'Passionate About Capturing Life\'s Fleeting Moments And Weaving Compelling Narratives Through The Art Of Photography, Videography, And Video Editing. With Years Of Experience In Visual Storytelling, I Specialize In Creating Content That Not Only Looks Stunning But Also Resonates Deeply With Audiences. From Intimate Portraits And Dynamic Event Coverage To Cinematic Video Edits, I Bring Creativity, Technical Expertise, And A Keen Eye For Detail To Every Project, Ensuring Your Vision Comes To Life In The Most Impactful Way.',
    skills: ['Photography', 'Videography', 'Video Editing', 'Color Grading', 'Sound Design'],
    experience: '3+ Years Experience',
    brands: ['Chetmani', 'OBraba', 'Taj Estate', 'Many Other Businesses'],
    software: ['Premiere Pro', 'Capcut']
  }; 

  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      console.log('Profile API Response:', response.data);
      if (response.data) {
        // Merge API Data With Defaults - But Keep Default Bio If API Bio Is Too Short
        const mergedProfile = { ...defaultProfile, ...response.data };
        // If API Bio Is Just Skills/Short, Use Default Bio Instead
        if (mergedProfile.bio && mergedProfile.bio.length < 100) {
          mergedProfile.bio = defaultProfile.bio;
        }
        console.log('Merged Profile:', mergedProfile);
        setProfile(mergedProfile);
      } else {
        console.log('Using Default Profile');
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error Loading Profile:', error);
      // Keep Default Profile Data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Me
          </motion.h1>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <motion.div
              className="about-image"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {profile?.profile_image ? (
                <img src={getFullImageUrl(profile.profile_image)} alt={profile.full_name} />
              ) : (
                <div className="image-placeholder">
                  <span>{profile?.full_name?.[0] || 'P'}</span>
                </div>
              )}
            </motion.div>

            <motion.div
              className="about-text"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>{profile.full_name}</h2>
              <p className="tagline">{profile.tagline}</p>
              {profile.experience && <p className="experience">{profile.experience}</p>}
              
              <div className="bio">
                <p>{profile.bio}</p>
              </div>

              <div className="skills">
                <h3>Expertise</h3>
                <div className="skills-list">
                  {profile.skills && profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="profile-extra">
                <div className="worked-with">
                  <h4>Worked With</h4>
                  <div className="brands-list">
                    {profile.brands && profile.brands.map((brand, index) => (
                      <span key={index} className="brand-tag">{brand}</span>
                    ))}
                  </div>
                </div>

                <div className="software">
                  <h4>Software</h4>
                  <div className="software-list">
                    {profile.software && profile.software.map((tool, index) => (
                      <span key={index} className="software-tag">{tool}</span>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div> 
          </div>
        </div>
      </section>

      <section className="philosophy-section">
        <div className="container">
          <motion.div
            className="philosophy-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>My Approach</h2>
            <p>
              Every Project Is An Opportunity To Create Something Extraordinary. 
              I Believe In End-To-End Creative Ownership – From The Initial Capture 
              Through The Final Edit. This Unified Approach Ensures Consistency, 
              Quality, And A Cohesive Visual Narrative That Truly Represents Your Vision.
            </p>
            <p>
              With Expertise Spanning Photography, Videography, And Video Editing, 
              I Bring A Comprehensive Perspective To Every Project, Ensuring That 
              Each Frame Serves The Larger Story We're Telling Together.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}