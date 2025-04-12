import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ShareXP.css';
import experienceImage from '../assets/experience.jpg';
import globeImage from '../assets/globe.png';
import connectImage from '../assets/connect.png';

const ShareXP = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="sharexp-container">
      {/* Header Section */}
      <header className="sharexp-header">
        <h1 className="sharexp-title">ShareXP</h1>
        <p className="sharexp-tagline">Your Journey, Our Community.</p>
      </header>

      {/* Main Content */}
      <main className="sharexp-main">
        {/* Frameset Section */}
        <section className="frameset">
          <div className="frame">
            <img src={experienceImage} alt="Experience" className="frame-image small-image" />
            <div className="frame-overlay">
              <h3>Share Your Journey</h3>
            </div>
          </div>

          <div className="frame">
            <img src={globeImage} alt="Global" className="frame-image small-image" />
            <div className="frame-overlay">
              <h3>Connect Globally</h3>
            </div>
          </div>

          <div className="frame">
            <img src={connectImage} alt="Connect" className="frame-image small-image" />
            <div className="frame-overlay">
              <h3>Inspire Others</h3>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="sharexp-description">
          <p className="font-[200] text-[30px]">
            ShareXP is your platform to share experiences, connect with inspiring people, and discover amazing stories. Your journey matters here.
          </p>
        </section>

        {/* Call-to-Action */}
        <section className="sharexp-cta">
          <button className="cta-button" onClick={() => navigate('/LoginXP')}> {/* Navigate to Home */}
            🚀 Join Now
          </button>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="sharexp-footer">
        © 2025 ShareXP. All rights reserved.
      </footer>
    </div>
  );
};

export default ShareXP;