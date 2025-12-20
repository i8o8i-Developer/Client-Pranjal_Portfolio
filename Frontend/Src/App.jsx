import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import About from './Pages/About';
import Photography from './Pages/Photography';
import Videography from './Pages/Videography';
import VideoEditing from './Pages/VideoEditing';
import Contact from './Pages/Contact';
import { trackPageVisit } from './services/Api';

// Component To Track Page Views
function PageTracker() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname]);
  
  return null;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <PageTracker />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/videography" element={<Videography />} />
          <Route path="/video-editing" element={<VideoEditing />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;