import React from 'react';
import '../styles/Adventure.css';

export default function DreamIntro({ onComplete }) {
  const handleContinue = () => {
    // Save progress that DreamIntro was seen
    localStorage.setItem('dreamIntroSeen', 'true');
    onComplete();
  };

  return (
    <div className="story-scene">
      <h1>Dream Intro</h1>
      <p>
        As you close your eyes, a strange jungle appears in your dreams — a place full of mysteries and untold adventures.
      </p>
      <button onClick={handleContinue}>Continue</button>
    </div>
  );
}
