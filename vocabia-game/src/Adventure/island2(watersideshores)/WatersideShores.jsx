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
    name: "Corallex's Reef of Riddles",
    description: "Navigate the coral reef where double letters and spelling traps await the unwary.",
    icon: "🦑",
    theme: "spelling",
    difficulty: "Intermediate",
    cssTheme: "tide"
  },
  {
    id: 3,
    name: "Silentscale's Whispered Words",
    description: "Navigate the lagoon of whispers where silent letters vanish like ghosts.",
    icon: "🐍",
    theme: "silent letters",
    difficulty: "Hard",
    cssTheme: "coral"
  },
  {
    id: 4,
    name: "Homophibian's Dock of Deception",
    description: "Navigate the treacherous dock where homophones trick the unwary adventurer.",
    icon: "🐸",
    theme: "homophones",
    difficulty: "Hard",
    cssTheme: "siren"
  },
  {
    id: 5,
    name: "Spellisk's Lair of Spelling",
    description: "Face the serpent of shattered words in her lair. The Scroll of Spelling awaits the worthy.",
    icon: "🐍",
    theme: "spelling mastery",
    difficulty: "Boss",
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
        const res = await axios.get("/api/adventure/level-progress", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // Map progress by level name - using the level names that are saved by the levels
        const progressMap = {};
        res.data.forEach(stat => {
          progressMap[stat.levelName] = stat;
        });

        // Map our level names to the saved progress
        const levelNameMap = {
          "Scribblash's Sandy Scrawl": "Scribblash",
          "Corallex's Reef of Riddles": "Corallex",
          "Silentscale's Whispered Words": "Silentscale",
          "Homophibian's Dock of Deception": "Homophibian",
          "Spellisk's Lair of Spelling": "Spellisk"
        };

        const starsArr = levels.map(lvl => {
          const savedLevelName = levelNameMap[lvl.name];
          return progressMap[savedLevelName]?.starsEarned || 0;
        });
        
        let maxUnlocked = 1;
        levels.forEach((lvl, idx) => {
          const savedLevelName = levelNameMap[lvl.name];
          if (progressMap[savedLevelName]?.completed && idx + 2 > maxUnlocked) {
            maxUnlocked = idx + 2;
          }
        });
        
        setStars(starsArr);
        setUnlocked(maxUnlocked);
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
    } else if (id === 2) {
      navigate('/waterside-shores/level2');
    } else if (id === 3) {
      navigate('/waterside-shores/level3');
    } else if (id === 4) {
      navigate('/waterside-shores/level4');
    } else if (id === 5) {
      navigate('/waterside-shores/level5');
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