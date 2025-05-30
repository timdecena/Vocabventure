import React from 'react';
import '../styles/Adventure.css';

export default function VictoryScene({ onComplete }) {
  const handleContinue = () => {
    localStorage.setItem('victorySceneSeen', 'true');
    onComplete();
  };

  return (
    <div className="story-scene">
      <h1>Victory!</h1>
      <p>
        Congratulations! You've braved the Jungle Lush and emerged victorious against all odds!
      </p>
      <button onClick={handleContinue}>Finish Adventure</button>
    </div>
  );
}
