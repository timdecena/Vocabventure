import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import "../../styles/JungleLush.css";

const backgroundImage = "https://www.shutterstock.com/image-vector/river-mountains-top-view-landscape-260nw-2137764849.jpg";

const levels = [
  {
    id: 1,
    name: "Commawidow's Web",
    image: "https://img.freepik.com/premium-photo/3d-pixel-art-scary-black-spider-with-white-fang-halloween-decorative-ornament-theme-design_477250-292.jpg",
    description: "Face the Commawidow and master the art of punctuation!",
    icon: "🕸️"
  },
  {
    id: 2,
    name: "Tensephant's Domain",
    image: "https://static.wikia.nocookie.net/hollowknight/images/a/a5/Tensephant.png",
    description: "Battle the time-warping Tensephant and master verb tenses!",
    icon: "🌱"
  },
  {
    id: 3,
    name: "Pluribog's Pit",
    image: "https://cdna.artstation.com/p/assets/images/images/072/803/668/large/blade-blackwood-frogmonster.jpg?1708254629",
    description: "Defeat Pluribog, the Bog Beast of Broken Words!",
    icon: "🐸"
  },
  {
    id: 4,
    name: "Grammowl's Tower",
    image: "https://static.wikia.nocookie.net/hollowknight/images/e/e9/Sprintmaster.png",
    description: "Face the final challenge in Grammowl's Tower!",
    icon: "🦉"
  },
  {
    id: 5,
    name: "Grammowl",
    image: "https://static.wikia.nocookie.net/hollowknight/images/e/e9/Sprintmaster.png",
    description: "The final battle against the corrupted owl!",
    icon: "🦉"
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
    <div className="junglelush-bg" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="jl-bg-overlay">
        <h1 className="jl-header">Grammowl's Territory</h1>

        <div className="jl-levels-row">
          {levels.map((level, idx) => {
            const locked = idx + 1 > unlocked;
            const isUnlocked = idx + 1 <= unlocked;
            const hasStars = stars[idx] > 0;
            const isBoss = level.id === 5;

            const content = (
              <button
                key={level.id}
                className={`jl-level-btn${locked ? " locked" : ""}${isBoss ? " boss" : ""}`}
                disabled={locked}
                onClick={() => handleLevelClick(level.id)}
                style={{
                  ...(level.image ? { backgroundImage: `url(${level.image})` } : {}),
                  position: 'relative',
                  overflow: 'visible',
                }}
                title={level.description || level.name}
              >
                <span className="jl-btn-overlay" />
                <span className="jl-icon">{level.icon}</span>
                {isBoss ? (
                  <span className="jl-boss-label jl-btn-text-shadow">👹<br />{level.name}</span>
                ) : (
                  <span className="jl-btn-text jl-btn-text-shadow">{level.name}</span>
                )}
                {locked && <span className="jl-lock">🔒</span>}
                {isUnlocked && (
                  <span className="jl-stars jl-btn-text-shadow" style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '2rem',
                    marginTop: 8,
                    marginBottom: 0,
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 8,
                  }}>
                    {[0,1,2].map(i => (
                      <span
                        key={i}
                        style={{
                          color: i < stars[idx] ? '#FFD700' : '#bbb',
                          textShadow: '0 2px 8px #222, 0 0 2px #fff',
                          margin: '0 1px',
                          fontWeight: 900,
                        }}
                      >
                        {i < stars[idx] ? '★' : '☆'}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            );

            return locked ? (
              <Tooltip key={level.id} title="Complete previous level to unlock!" arrow>
                <span>{content}</span>
              </Tooltip>
            ) : content;
          })}
        </div>

        <button className="jl-return-btn" onClick={() => navigate("/map")}>
          Return to Vocabia Map
        </button>
      </div>
    </div>
  );
}
