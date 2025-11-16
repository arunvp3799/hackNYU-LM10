import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="App">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-links">
          <a href="#medicare" className="nav-link">Medicare</a>
          <a href="#individual" className="nav-link">Individual & family</a>
          <a href="#medicaid" className="nav-link">Medicaid</a>
          <a href="#more" className="nav-link">
            More sites
            <span className="dropdown-icon">▼</span>
          </a>
        </div>
        <div className="nav-actions">
          <a href="#espanol" className="nav-link">Español</a>
          <a href="#signin" className="nav-link">
            <span className="user-icon">👤</span> Sign in
            <span className="dropdown-icon">▼</span>
          </a>
        </div>
      </nav>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <div className="logo-icon">HI</div>
          </div>
          <nav className="main-nav">
            <button className="nav-button">
              Shop insurance <span className="dropdown-icon">▼</span>
            </button>
            <button className="nav-button">
              Member resources <span className="dropdown-icon">▼</span>
            </button>
            <button className="nav-button icon-button">
              <span className="stethoscope-icon">🩺</span>
              Find a doctor
            </button>
            <div className="search-container">
              <input type="text" placeholder="Search" className="search-input" />
              <button className="search-button">🔍</button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">Health plans for life's moments</h1>
            <p className="hero-description">
              Our plans are made to deliver what matters, from quality coverage to caring support. 
              Find a plan or sign in to view your benefits.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Shop for a plan</button>
              <button className="btn btn-secondary">Member sign in</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-image-container">
              <div className="hero-image">
                <div className="family-illustration">
                  <div className="person person1">👨</div>
                  <div className="person person2">👩</div>
                  <div className="person person3">👦</div>
                </div>
              </div>
              <div className="decorative-arc"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Button */}
      {!isChatOpen && (
        <button className="chat-fab" onClick={handleChatToggle}>
          💬
          <span className="chat-label">Chat</span>
        </button>
      )}

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={handleChatToggle} />
    </div>
  );
}

export default App;
