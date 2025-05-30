import React, { useEffect, useState } from 'react';
import '../styles/Adventure.css';

export default function ProgressStats() {
  const [profile, setProfile] = useState({
    adventurerName: 'Adventurer',
    level: 1,
    experiencePoints: 0,
  });

  useEffect(() => {
    // Normally you'd fetch this from an API
    const savedProfile = JSON.parse(localStorage.getItem('adventureProfile'));
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  const calculateXPPercent = () => {
    const xpForNextLevel = profile.level * 100; // Example: 100 XP per level
    return Math.min((profile.experiencePoints / xpForNextLevel) * 100, 100);
  };

  return (
    <div className="progress-stats">
      <h2>{profile.adventurerName}</h2>
      <p>Level: {profile.level}</p>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${calculateXPPercent()}%` }}></div>
      </div>
      <p>{profile.experiencePoints} XP</p>
    </div>
  );
}
