import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sendContactMessage } from '../services/Api.js';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please Fill In All Fields',
      });
      return;
    }
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        type: 'error',
        message: 'Please Enter A Valid Email Address',
      });
      return;
    }
    
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await sendContactMessage(formData);
      setStatus({
        type: 'success',
        message: 'Message Sent Successfully! I\'ll Get Back To You Soon.',
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error Sending Message:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed To Send Message. Please Try Again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's Create Something Extraordinary Together
          </motion.p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Let's Collaborate</h2>
              <p>
                Whether you need Photography, Videography, or Video Editing Services, 
                I'm Here To Bring Your Vision To Life. Get In Touch To Discuss Your Project.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <h3>Follow Me</h3>
                  <div className="social-links">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                      YouTube
                    </a>
                    <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer">
                      Vimeo
                    </a>
                    <a href="https://behance.net" target="_blank" rel="noopener noreferrer">
                      Behance
                    </a>
                  </div>
                </div>

                <div className="contact-item">
                  <h3>Response Time</h3>
                  <p>I Typically Respond Within 24-48 Hours</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="contact-form-wrapper"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {status.message && (
                  <div className={`form-status ${status.type}`}>
                    {status.message}
                  </div>
                )}

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}