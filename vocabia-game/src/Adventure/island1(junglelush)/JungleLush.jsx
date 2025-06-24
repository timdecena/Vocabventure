import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import "../../styles/JungleLush.css";

// Jungle-themed CSS background with more color variety
const backgroundStyle = {
  background: `
    linear-gradient(135deg, 
      rgba(139, 69, 19, 0.6) 0%, 
      rgba(34, 139, 34, 0.7) 25%,
      rgba(85, 107, 47, 0.8) 50%,
      rgba(160, 82, 45, 0.6) 75%,
      rgba(0, 128, 0, 0.7) 100%
    ),
    radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(85, 107, 47, 0.3) 0%, transparent 50%),
    linear-gradient(45deg, #8B4513 0%, #228B22 50%, #6B8E23 100%)
  `
};

const levels = [
  {
    id: 1,
    name: "Commawidow's Web",
    description: "Face the Commawidow in her ancient web and master the art of punctuation!",
    icon: "🕷️",
    theme: "punctuation",
    difficulty: "Novice",
    cssTheme: "web" // For CSS-based styling
  },
  {
    id: 2,
    name: "Tensephant's Domain",
    description: "Battle the time-warping Tensephant and master verb tenses in the enchanted grove!",
    icon: "🐘",
    theme: "tenses",
    difficulty: "Apprentice",
    cssTheme: "forest"
  },
  {
    id: 3,
    name: "Pluribog's Pit",
    description: "Descend into the murky depths to defeat Pluribog, the Bog Beast of Broken Words!",
    icon: "🐸",
    theme: "plurals",
    difficulty: "Adept",
    cssTheme: "swamp"
  },
  {
    id: 4,
    name: "Grammowl's Tower",
    description: "Ascend the mystical tower and face the wisdom of Grammowl in this penultimate challenge!",
    icon: "🗼",
    theme: "grammar",
    difficulty: "Expert",
    cssTheme: "tower"
  },
  {
    id: 5,
    name: "Grammowl",
    description: "The final battle against the corrupted Guardian of Grammar! Only the bravest adventurers may proceed!",
    icon: "🦉",
    theme: "boss",
    difficulty: "Master",
    cssTheme: "boss"
  }
];

export default function JungleLush() {
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

        // Map progress by level name
        const progressMap = {};
        res.data.forEach(stat => {
          progressMap[stat.levelName] = stat;
        });

        const starsArr = levels.map(lvl => progressMap[lvl.name]?.starsEarned || 0);
        let maxUnlocked = 1;
        levels.forEach((lvl, idx) => {
          if (progressMap[lvl.name]?.completed && idx + 2 > maxUnlocked) {
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
    navigate(`/jungle-lush/level${id}`);
  };

  return (
    <div className="junglelush-bg" style={backgroundStyle}>
      {/* Jungle decorative elements */}
      <div className="jungle-vines jungle-vine-1"></div>
      <div className="jungle-vines jungle-vine-2"></div>
      <div className="jungle-leaves"></div>
      
      <div className="jl-bg-overlay">
        <h1 className="jl-header">🌿 Grammowl's Territory 🌿</h1>
        <div className="jl-subtitle">Your Adventure Begins Here</div>

        <div className="jl-levels-row">
          {levels.map((level, idx) => {
            const locked = idx + 1 > unlocked;
            const isUnlocked = idx + 1 <= unlocked;
            const hasStars = stars[idx] > 0;
            const isBoss = level.id === 5;

            const content = (
              <button
                key={level.id}
                className={`jl-level-btn jl-level-${level.cssTheme}${locked ? " locked" : ""}${isBoss ? " boss" : ""}`}
                disabled={locked}
                onClick={() => handleLevelClick(level.id)}
                title={`${level.description} | Difficulty: ${level.difficulty}`}
              >
                <div className="jl-level-background"></div>
                <div className="jl-level-animation"></div>
                <span className="jl-btn-overlay" />
                <span className="jl-icon">{level.icon}</span>
                <div className="jl-level-info">
                  {isBoss ? (
                    <span className="jl-boss-label jl-btn-text-shadow">
                      👹<br />{level.name}
                    </span>
                  ) : (
                    <>
                      <span className="jl-btn-text jl-btn-text-shadow">{level.name}</span>
                      <span className="jl-difficulty">{level.difficulty}</span>
                    </>
                  )}
                </div>
                {locked && <span className="jl-lock">🔒</span>}
                {isUnlocked && (
                  <span className="jl-stars jl-btn-text-shadow">
                    {[0,1,2].map(i => (
                      <span
                        key={i}
                        style={{
                          color: i < stars[idx] ? '#FFD700' : '#555',
                          textShadow: i < stars[idx] ? '0 0 8px #FFD700' : 'none',
                          margin: '0 1px',
                          fontWeight: 900,
                        }}
                      >
                        {i < stars[idx] ? '★' : '☆'}
                      </span>
                    ))}
                  </span>
                )}
                {!locked && (
                  <div className="jl-level-glow"></div>
                )}
              </button>
            );

            return locked ? (
              <Tooltip key={level.id} title="Complete previous level to unlock!" arrow>
                <span>{content}</span>
              </Tooltip>
            ) : (
              <Tooltip key={level.id} title={`${level.description} | Theme: ${level.theme} | Difficulty: ${level.difficulty}`} arrow>
                <span>{content}</span>
              </Tooltip>
            );
          })}
        </div>

        <div className="jl-progress-indicator">
          <span className="jl-progress-text">🌱 Progress: {Math.max(0, unlocked - 1)} / {levels.length} levels completed 🌱</span>
          <div className="jl-progress-bar">
            <div 
              className="jl-progress-fill" 
              style={{ width: `${(Math.max(0, unlocked - 1) / levels.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <button className="jl-return-btn" onClick={() => navigate("/map")}>
          🗺️ Return to Vocabia Map
        </button>
      </div>
    </div>
  );
}
