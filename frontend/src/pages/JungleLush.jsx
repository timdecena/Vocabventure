import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "../styles/MapView.css";
import Tooltip from '@mui/material/Tooltip';

const bossImg = "https://www.shutterstock.com/image-vector/river-mountains-top-view-landscape-260nw-2137764849.jpg";
const commawidowImg = "https://img.freepik.com/premium-photo/3d-pixel-art-scary-black-spider-with-white-fang-halloween-decorative-ornament-theme-design_477250-292.jpg";
const grammowlImg = "https://static.wikia.nocookie.net/hollowknight/images/e/e9/Sprintmaster.png/revision/latest/scale-to-width-down/72?cb=20171028131625";
const tensephantImg = "https://static.wikia.nocookie.net/hollowknight/images/a/a5/Tensephant.png/revision/latest/scale-to-width-down/72?cb=20171028131625";

const levels = [
  { 
    id: 1, 
    name: "Commawidow's Web",
    image: commawidowImg,
    description: "Face the Commawidow and master the art of punctuation!"
  },
  { 
    id: 2, 
    name: "Tensephant's Domain",
    image: tensephantImg,
    description: "Battle the time-warping Tensephant and master verb tenses!"
  },
  { id: 3, name: "Level 3" },
  { id: 4, name: "Level 4" },
  { 
    id: 5, 
    name: "Grammowl",
    image: grammowlImg,
    description: "The final battle against the corrupted owl!"
  },
];

const levelIcons = [
  '🌿', // Level 1
  '🌱', // Level 2
  '🍃', // Level 3
  '🍂', // Level 4
  '🦉', // Grammowl
];

export default function JungleLush() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(1);
  const [stars, setStars] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    async function loadProgress() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/progress/levels', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        // Set stars for each level (assuming levelId 1-5)
        const starsArr = [0, 0, 0, 0, 0];
        let maxUnlocked = 1;
        res.data.forEach(stat => {
          if (stat.levelId >= 1 && stat.levelId <= 5) {
            starsArr[stat.levelId - 1] = stat.starsEarned;
            if (stat.completed && stat.levelId + 1 > maxUnlocked) {
              maxUnlocked = stat.levelId + 1;
            }
          }
        });
        setStars(starsArr);
        setUnlocked(maxUnlocked);
      } catch (e) {
        setUnlocked(1);
        setStars([0,0,0,0,0]);
      }
    }
    loadProgress();
  }, []);

  const handleLevelClick = (level) => {
    if (level.id === 1) {
      navigate('/jungle-lush/level1');
    } else if (level.id === 2) {
      navigate('/jungle-lush/level2');
    } else if (level.id === 3) {
      navigate('/jungle-lush/level3');
    } else if (level.id === 4) {
      navigate('/jungle-lush/level4');
    } else if (level.id === 5) {
      navigate('/jungle-lush/level5');
    } else {
      alert(`Level ${level.id} coming soon!`);
    }
  };

  return (
    <div className="junglelush-bg" style={{ backgroundImage: `url(${bossImg})` }}>
      <div className="jl-bg-overlay">
        <h1 className="jl-header">Grammowl's Territory</h1>
        <div className="jl-levels-row">
          {levels.map((level, idx) => {
            const isLocked = idx + 1 > unlocked;
            const icon = level.id === 1 ? '🕸️' : (level.id === 5 ? '🦉' : levelIcons[idx] || '🌿');
            const showStars = stars[idx] > 0;
            const btn = (
              <button
                key={level.id}
                className={`jl-level-btn${isLocked ? ' locked' : ''}${level.id === 5 ? ' boss' : ''}`}
                disabled={isLocked}
                onClick={() => handleLevelClick(level)}
                style={level.image ? { backgroundImage: `url(${level.image})` } : {}}
                title={level.description || level.name}
              >
                <span className="jl-btn-overlay" />
                <span className="jl-icon">{icon}</span>
                {level.id === 5 ? (
                  <span className="jl-boss-label jl-btn-text-shadow">👹<br />{level.name}</span>
                ) : (
                  <span className="jl-btn-text jl-btn-text-shadow">{level.name}</span>
                )}
                {isLocked && <span className="jl-lock">🔒</span>}
                {showStars && (
                  <span className="jl-stars jl-btn-text-shadow">{'★'.repeat(stars[idx])}{'☆'.repeat(3 - stars[idx])}</span>
                )}
              </button>
            );
            return isLocked ? (
              <Tooltip key={level.id} title="Complete previous level to unlock!" arrow>
                <span>{btn}</span>
              </Tooltip>
            ) : btn;
          })}
        </div>
        <button className="jl-return-btn" onClick={() => navigate("/map")}>Return to Vocabia Map</button>
      </div>
    </div>
  );
} 