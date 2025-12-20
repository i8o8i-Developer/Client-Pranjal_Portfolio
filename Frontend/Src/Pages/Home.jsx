import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeBackground from '../Components/ThreeBackground';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <ThreeBackground enableScroll={true} />
      
      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-panel">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="hero-title">PRANJAL</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <p className="hero-subtitle">Visual Storyteller</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <p className="hero-description">
                Photography • Videography • Video Editing
              </p>
            </motion.div>

            <motion.div
              className="hero-cta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Link to="/photography" className="cta-button primary">
                View Work
              </Link>
              <Link to="/about" className="cta-button secondary">
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="scroll-indicator" role="button" tabIndex={0} onClick={() => {
          const el = document.querySelector('.intro-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}>
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="intro-content"
          >
            <h2>Creating Visual Stories That Matter</h2>
            <p>
              From The Initial Capture To The Final Edit, I Bring Your Vision To Life With Cinematic Precision And Creative Excellence. 
              Specializing In End-To-End Visual Storytelling, I Handle Every Aspect Of Your Project—From Conceptual Planning And Professional Filming To Expert Post-Production And Delivery. 
              Whether It's Intimate Portraits, Dynamic Event Coverage, Or Compelling Brand Narratives, My Work Connects With Audiences, Inspires Action, And Endures As A Testament To Your Story. 
              With A Passion For Innovation And A Commitment To Quality, I Transform Ideas Into Visual Experiences That Captivate And Resonate.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <h2 className="section-title">What I Do</h2>
          
          <div className="services-grid">
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="service-icon">📸</div>
              <h3>Photography</h3>
              <p>
                Capturing Moments With Artistic Vision And Technical Excellence. 
                From Portraits To Landscapes, Each Frame Tells A Story.
              </p>
              <Link to="/photography" className="service-link">
                Explore Gallery →
              </Link>
            </motion.div>

            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="service-icon">🎥</div>
              <h3>Videography</h3>
              <p>
                Cinematic Videography That Brings Your Story To Life. 
                Professional Filming With Creative Composition And Lighting.
              </p>
              <Link to="/videography" className="service-link">
                Watch Videos →
              </Link>
            </motion.div>

            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="service-icon">✂️</div>
              <h3>Video Editing</h3>
              <p>
                Transforming Raw Footage Into Polished, Engaging Content. 
                Expert Editing With Color Grading And Sound Design.
              </p>
              <Link to="/video-editing" className="service-link">
                View Showreel →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}