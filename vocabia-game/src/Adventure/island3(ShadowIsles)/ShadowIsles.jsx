import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import "../../styles/WatersideShores.css";

// Shadow Isles hub styled like Waterside Shores but with placeholder background
const backgroundStyle = {
  backgroundImage: `
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(10, 10, 25, 0.6)),
    url("https://art.pixilart.com/f9c4ae051a23.png")
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh'
};

const levels = [
  { id: 1, name: "Murkmind's Veil", description: "Silence-weaver of thought—face the devourer of words.", icon: "👾", theme: "spelling", difficulty: "Hard", cssTheme: "shore" },
  { id: 2, name: "Echojack's Echoes", description: "Homophone trickster—words that sound the same but spell doom.", icon: "🌫️", theme: "homophones", difficulty: "Hard", cssTheme: "tide" },
  { id: 3, name: "Shardling's Fracture", description: "Broken word creature—where meaning itself is torn apart.", icon: "🔧", theme: "fragments", difficulty: "Hard", cssTheme: "coral" },
  { id: 4, name: "Umbrosk's Gate", description: "Dysauron's right hand—the shadow that silences even light.", icon: "👹", theme: "silence", difficulty: "Hard", cssTheme: "siren" },
  { id: 5, name: "Dysauron's Lair", description: "The final battle—face the devourer of words himself.", icon: "💀", theme: "final", difficulty: "Boss", cssTheme: "leviathan" },
];

export default function ShadowIsles() {
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

        // Map our display names to backend level identifiers
        const levelNameMap = { 
          "Murkmind's Veil": "Murkmind",
          "Echojack's Echoes": "Echojack",
          "Shardling's Fracture": "Shardling",
          "Umbrosk's Gate": "Umbrosk",
          "Dysauron's Lair": "Dysauron"
        };

        const starsArr = levels.map(lvl => progressMap[levelNameMap[lvl.name]]?.starsEarned || 0);
        
        let maxUnlocked = 1;
        levels.forEach((lvl, idx) => {
          const key = levelNameMap[lvl.name];
          if (progressMap[key]?.completed && idx + 2 > maxUnlocked) {
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
    if (id === 1) navigate('/shadow-isles/level1');
    else if (id === 2) navigate('/shadow-isles/level2');
    else if (id === 3) navigate('/shadow-isles/level3');
    else if (id === 4) navigate('/shadow-isles/level4');
    else if (id === 5) navigate('/shadow-isles/level5');
    else alert(`Level ${id} coming soon!`);
  };

  return (
    <div className="watersideshores-bg" style={backgroundStyle}>
      
      <div className="ws-content-wrapper">
        <div className="ws-main-header">
          <h1 className="ws-title">Shadow Isles</h1>
          <p className="ws-tagline">Walk where even knowledge fears to tread</p>
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