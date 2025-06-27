import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MapView.css";
import TutorialSequence from "./tutorial/TutorialSequence";

const oceanBg = "https://cdna.artstation.com/p/assets/images/images/061/904/456/large/milan-vasek-worldmap-wip.jpg?1681900161";

const islands = [
  { 
    id: 1, 
    name: "Jungle Lush", 
    img: "https://img.freepik.com/free-vector/empty-background-nature-scenery_1308-34521.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "8%", left: "8%" }, 
    unlocked: true,
    description: "Begin your vocabulary adventure in the mysterious jungle",
    treasures: 3,
    completed: false,
    biome: "jungle"
  },
  { 
    id: 2, 
    name: "Spelling Shores", 
    img: "https://img.freepik.com/premium-vector/cartoon-illustration-beach-scene-with-palm-trees-beach-scene_937058-206.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "38%", left: "18%" }, 
    unlocked: false,
    description: "Discover spelling secrets along the golden shores",
    treasures: 5,
    completed: false,
    biome: "beach"
  },
  { 
    id: 3, 
    name: "Sentence Swamp", 
    img: "https://img.freepik.com/free-vector/mangrove-forest-outdoor-background_1308-129123.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "28%", left: "45%" }, 
    unlocked: false,
    description: "Navigate treacherous grammar through the swamplands",
    treasures: 7,
    completed: false,
    biome: "swamp"
  },
  { 
    id: 4, 
    name: "Focus Forest", 
    img: "https://img.freepik.com/free-vector/flat-design-winter-landscape_23-2148707345.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "60%", left: "60%" }, 
    unlocked: false,
    description: "Master advanced language skills in the ancient forest",
    treasures: 9,
    completed: false,
    biome: "forest"
  },
  { 
    id: 5, 
    name: "The Shadow Isles", 
    img: "https://img.freepik.com/premium-vector/sunset-erupting-volcano-vector-landscape-illustration_147887-376.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "38%", left: "80%" }, 
    unlocked: false,
    description: "Face the ultimate vocabulary challenges in the volcanic realm",
    treasures: 12,
    completed: false,
    biome: "volcano"
  },
];

const pathCoords = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
];

// Adventure decorations
const treasureMarks = [
  { id: 1, x: 15, y: 25, type: "treasure" },
  { id: 2, x: 35, y: 15, type: "compass" },
  { id: 3, x: 65, y: 70, type: "scroll" },
  { id: 4, x: 85, y: 45, type: "artifact" },
];

// Particle system for background effects
const generateParticles = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.5 + 0.1,
    opacity: Math.random() * 0.5 + 0.2,
  }));
};

function getIslandCenter(island) {
  const x = parseFloat(island.style.left) + 7;
  const y = parseFloat(island.style.top) + 5;
  return { x, y };
}

export default function MapView() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [hoveredIsland, setHoveredIsland] = useState(null);
  const [compassRotation, setCompassRotation] = useState(0);
  const [particles, setParticles] = useState(generateParticles(50));

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y + particle.speed) % 105,
        x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.1,
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Animate compass
  useEffect(() => {
    const rotateCompass = () => {
      setCompassRotation(prev => (prev + 1) % 360);
    };
    const interval = setInterval(rotateCompass, 100);
    return () => clearInterval(interval);
  }, []);

  // Adventure path lines
  const lines = pathCoords.map(([fromIdx, toIdx], i) => {
    const from = getIslandCenter(islands[fromIdx]);
    const to = getIslandCenter(islands[toIdx]);
    const isUnlocked = islands[toIdx].unlocked;
    
    return (
      <g key={i}>
        {/* Dark outline for better contrast */}
        <line
          x1={`${from.x}%`} y1={`${from.y}%`}
          x2={`${to.x}%`} y2={`${to.y}%`}
          stroke="#000000"
          strokeWidth={isUnlocked ? "12" : "8"}
          strokeDasharray={isUnlocked ? "25,10" : "20,12"}
          opacity="0.8"
        />
        
        {/* Main path line */}
        <line
          x1={`${from.x}%`} y1={`${from.y}%`}
          x2={`${to.x}%`} y2={`${to.y}%`}
          stroke={isUnlocked ? "#FFD700" : "#8B4513"}
          strokeWidth={isUnlocked ? "10" : "6"}
          strokeDasharray={isUnlocked ? "25,10" : "20,12"}
          opacity="1"
          filter={isUnlocked ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" : "drop-shadow(2px 2px 4px rgba(0,0,0,0.4))"}
        />
        
        {/* Bright glowing overlay for unlocked paths */}
        {isUnlocked && (
          <line
            x1={`${from.x}%`} y1={`${from.y}%`}
            x2={`${to.x}%`} y2={`${to.y}%`}
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeDasharray="25,10"
            opacity="0.7"
            filter="blur(1px)"
          />
        )}
        

      </g>
    );
  });

  const getBiomeIcon = (biome) => {
    switch(biome) {
      case "jungle": return "🌿";
      case "beach": return "🏖️";
      case "swamp": return "🐊";
      case "forest": return "🌲";
      case "volcano": return "🌋";
      default: return "🗺️";
    }
  };

  const getDecorationIcon = (type) => {
    switch(type) {
      case "treasure": return "💰";
      case "compass": return "🧭";
      case "scroll": return "📜";
      case "artifact": return "🏺";
      default: return "⭐";
    }
  };

  return (
    <div className="adventure-map">
      {/* Parchment overlay for authentic feel */}
      <div className="parchment-overlay"></div>
      
      {/* Enhanced VOCABIA title */}
      <div className="adventure-header">
        <div className="vocabia-title">VOCABIA</div>
        <div className="adventure-subtitle">Explorers Map</div>
      </div>

      {/* Adventure controls */}
      <div className="adventure-controls">
        <button className="adventure-btn primary" onClick={() => setShowTutorial(true)}>
          Replay Tutorial
        </button>
        <button className="adventure-btn secondary" onClick={() => navigate('/home')}>
          Quit to Homepage
        </button>
      </div>

      {/* Adventure log - moved to bottom left */}
      <div className="adventure-log">
        <div className="log-header">
          <span className="log-title">Adventure Log</span>
        </div>
        <div className="log-stats">
          <div className="log-item">
            <span className="log-text">Islands Explored: 0/5</span>
          </div>
          <div className="log-item">
            <span className="log-text">Scrolls Earned: 0</span>
          </div>
          <div className="log-item">
            <span className="log-text">Total Progress: 0%</span>
          </div>
        </div>
      </div>

      {/* Adventure paths */}
      <svg className="adventure-paths">
        {lines}
      </svg>

      {/* Adventure islands */}
      {islands.map(island => (
        <div
          key={island.id}
          className={`adventure-island ${island.unlocked ? 'discovered' : 'undiscovered'} ${hoveredIsland === island.id ? 'highlighted' : ''}`}
          style={island.style}
          onClick={island.unlocked ? (island.id === 1 ? () => navigate('/jungle-lush') : () => {}) : undefined}
          onMouseEnter={() => setHoveredIsland(island.id)}
          onMouseLeave={() => setHoveredIsland(null)}
        >
          {/* Island frame */}
          <div className="island-frame">
            <img src={island.img} alt={island.name} className="island-picture" />
            
            {/* Biome indicator */}
            <div className="biome-indicator">
              {getBiomeIcon(island.biome)}
            </div>
            
            {/* Status overlay */}
            {!island.unlocked && (
              <div className="undiscovered-overlay">
                <div className="mystery-icon">❓</div>
                <div className="fog-effect"></div>
              </div>
            )}
            
            {island.completed && (
              <div className="completed-stamp">
                <span className="stamp-text">CLEARED</span>
              </div>
            )}
          </div>

          {/* Island nameplate */}
          <div className="island-nameplate">
            <div className="nameplate-bg">
              <span className="island-title">{island.name}</span>
            </div>
          </div>

          {/* Adventure tooltip */}
          {hoveredIsland === island.id && (
            <div className="adventure-tooltip">
              <div className="tooltip-scroll">
                <div className="scroll-header">
                  <h3 className="location-name">{island.name}</h3>
                  <div className="location-biome">{getBiomeIcon(island.biome)} {island.biome.toUpperCase()}</div>
                </div>
                <div className="scroll-content">
                  <p className="location-desc">{island.description}</p>
                  {island.unlocked ? (
                    <div className="action-prompt">Click to explore!</div>
                  ) : (
                    <div className="locked-prompt">Complete previous levels</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Tutorial modal */}
      {showTutorial && (
        <div className="adventure-modal">
          <TutorialSequence onClose={() => setShowTutorial(false)} />
        </div>
      )}
    </div>
  );
} 