import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose, trigger }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGiveFeedback = () => {
    navigate('/student/feedback');
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'boss':
        return '🎉 Congratulations on defeating the boss! 🎉';
      case 'playtime':
        return '⏰ You\'ve been playing for a while!';
      default:
        return '👋 Hey there, adventurer!';
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="feedback-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="feedback-modal-content">
          <div className="feedback-modal-icon">
            {trigger === 'boss' ? '🏆' : '⭐'}
          </div>
          
          <h2 className="feedback-modal-title">
            {getTriggerMessage()}
          </h2>
          
          <p className="feedback-modal-message">
            We'd love to hear your thoughts about VocabVenture! Your feedback helps us make the game even better.
          </p>
          
          <div className="feedback-modal-features">
            <div className="feedback-feature">
              <span className="feature-icon">💬</span>
              <span>Share your experience</span>
            </div>
            <div className="feedback-feature">
              <span className="feature-icon">⭐</span>
              <span>Rate your adventure</span>
            </div>
            <div className="feedback-feature">
              <span className="feature-icon">💡</span>
              <span>Suggest improvements</span>
            </div>
          </div>
          
          <div className="feedback-modal-actions">
            <button className="feedback-btn feedback-btn-primary" onClick={handleGiveFeedback}>
              <span className="btn-glow"></span>
              Give Feedback
            </button>
            <button className="feedback-btn feedback-btn-secondary" onClick={onClose}>
              Maybe Later
            </button>
          </div>
          
          <p className="feedback-modal-note">
            Takes less than 2 minutes ⏱️
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

