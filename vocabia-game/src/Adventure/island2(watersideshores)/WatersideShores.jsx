import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import "../../styles/WatersideShores.css";

// Beautiful waterside background with image overlay
const backgroundStyle = {
  backgroundImage: `
    linear-gradient(rgba(0, 50, 80, 0.3), rgba(0, 100, 150, 0.4)),
    url("https://img.freepik.com/premium-photo/pixel-art-landscape-colorful-beach-digital-art-illustration_783299-393.jpg")
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh'
};

const levels = [
  {
    id: 1,
    name: "Scribblash's Sandy Scrawl",
    description: "Face the sand golem of broken letters in your first spelling challenge by the shores.",
    icon: "🏖️",
    theme: "spelling",
    difficulty: "Intermediate",
    cssTheme: "shore"
  },
  {
    id: 2,
    name: "Tidecaller's Test",
    description: "Navigate the tidal pools where words ebb and flow with the ocean's rhythm.",
    icon: "🌊",
    theme: "vocabulary",
    difficulty: "Intermediate",
    cssTheme: "tide"
  },
  {
    id: 3,
    name: "Coral Keeper's Challenge",
    description: "Dive deep into the coral gardens where ancient vocabulary secrets lie hidden.",
    icon: "🪸",
    theme: "comprehension",
    difficulty: "Intermediate",
    cssTheme: "coral"
  },
  {
    id: 4,
    name: "Siren's Spelling Storm",
    description: "Weather the spelling storm conjured by the mystical siren of the deep waters.",
    icon: "🧜‍♀️",
    theme: "spelling",
    difficulty: "Intermediate",
    cssTheme: "siren"
  },
  {
    id: 5,
    name: "Leviathan's Lexicon",
    description: "Face the ultimate sea beast in the deepest waters where vocabulary mastery is tested.",
    icon: "🐋",
    theme: "vocabulary",
    difficulty: "Advanced",
    cssTheme: "leviathan"
  }
];

export default function WatersideShores() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(1);
  const [stars, setStars] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    async function loadProgress() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/api/adventure/island-progress/Waterside Shores', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        const progress = response.data;
        const completedLevel = progress.completedLevel || 0;
        
        // For now, set all completed levels to 3 stars
        const starsArr = levels.map((level, idx) => 
          idx < completedLevel ? 3 : 0
        );
        
        setStars(starsArr);
        setUnlocked(completedLevel + 1); // Next level is unlocked
      } catch (err) {
        console.error("Progress fetch failed", err);
        setUnlocked(1);
        setStars([0, 0, 0, 0, 0]);
      }
    }

    loadProgress();
  }, []);

  const handleLevelClick = (id) => {
    if (id === 1) {
      navigate('/waterside-shores/level1');
    } else {
      alert(`Level ${id} coming soon!`);
    }
  };

  return (
    <div className="watersideshores-bg" style={backgroundStyle}>
      
      <div className="ws-content-wrapper">
        <div className="ws-main-header">
          <h1 className="ws-title">Waterside Shores</h1>
          <p className="ws-tagline">Master the mysteries of the mystical waters</p>
        </div>

        <div className="ws-levels-row">
          {levels.map((level, idx) => {
            const locked = idx + 1 > unlocked;
            const isUnlocked = idx + 1 <= unlocked;
            const hasStars = stars[idx] > 0;
            const isBoss = level.id === 5;

            const content = (
              <button
                key={level.id}
                className={`ws-level-btn ws-level-${level.cssTheme}${locked ? " locked" : ""}${isBoss ? " boss" : ""}`}
                disabled={locked}
                onClick={() => handleLevelClick(level.id)}
                title={`${level.description} | Difficulty: ${level.difficulty}`}
              >
                <div className="ws-level-background"></div>
                <div className="ws-level-animation"></div>
                <span className="ws-btn-overlay" />
                <span className="ws-icon">{level.icon}</span>
                <div className="ws-level-info">
                  {isBoss ? (
                    <span className="ws-boss-label ws-btn-text-shadow">
                      🌊<br />{level.name}
                    </span>
                  ) : (
                    <>
                      <span className="ws-btn-text ws-btn-text-shadow">{level.name}</span>
                    </>
                  )}
                </div>
                {locked && <span className="ws-lock">🔒</span>}
                {isUnlocked && (
                  <span className="ws-stars ws-btn-text-shadow">
                    {[0,1,2].map(i => (
                      <span
                        key={i}
                        style={{
                          color: i < stars[idx] ? '#FFD700' : '#666',
                          textShadow: i < stars[idx] ? '0 0 10px #FFD700, 0 0 20px #FFD700' : '0 1px 2px rgba(0,0,0,0.8)',
                          margin: '0',
                          fontSize: '1.2rem',
                          filter: i < stars[idx] ? 'drop-shadow(0 0 6px #FFD700)' : 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </span>
                )}
              </button>
            );

            return (
              <Tooltip
                key={level.id}
                title={level.description}
                placement="top"
                arrow
              >
                <div>{content}</div>
              </Tooltip>
            );
          })}
        </div>

        <div className="ws-progress-summary">
          🏆 Progress: {stars.filter(s => s > 0).length} / 5 levels completed 🏆
        </div>

        <button className="ws-back-btn" onClick={() => navigate('/map')}>
          🗺️ Return to Vocabia Map
        </button>
      </div>
    </div>
  );
}