import React from 'react';
import '../styles/Adventure.css';

export default function WizardScene({ onComplete }) {
  const handleContinue = () => {
    localStorage.setItem('wizardSceneSeen', 'true');
    onComplete();
  };

  return (
    <div className="story-scene">
      <h1>Wizard Encounter</h1>
      <p>
        A wise wizard greets you, offering guidance to help you conquer the challenges of Jungle Lush.
      </p>
      <button onClick={handleContinue}>Continue</button>
    </div>
  );
}
