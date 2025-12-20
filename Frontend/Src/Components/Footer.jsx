import React from 'react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>PRANJAL</h3>
            <p>Visual Storyteller</p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Portfolio</h4>
              <ul>
                <li><a href="/photography">Photography</a></li>
                <li><a href="/videography">Videography</a></li>
                <li><a href="/video-editing">Video Editing</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Connect</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section footer-social">
              <h4>Follow</h4>
              <ul className="social-links">
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                <li><a href="https://vimeo.com" target="_blank" rel="noopener noreferrer">Vimeo</a></li>
                <li><a href="https://behance.net" target="_blank" rel="noopener noreferrer">Behance</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        {/* PERMANENT CREDIT SECTION - HARD CODED - NOT EDITABLE FROM ADMIN */}
        <div className="footer-credit">
          <p className="credit-text">
            Portfolio Designed And Developed By <span className="credit-highlight">Anubhav Chaurasia</span> | 
            Also Known As <a href="https://github.com/i8o8i-Developer" target="_blank" rel="noopener noreferrer">i8o8i-Developer</a> In The Social Media World
          </p>
          <p className="credit-tech">
            Built With Python, FastAPI, React, MongoDB, And Three.js
          </p>
        </div>
        {/* END OF PERMANENT CREDIT SECTION */}

        <div className="footer-bottom">
          <p>&copy; {currentYear} Pranjal. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}