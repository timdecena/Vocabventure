import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MapView.css";
import TutorialSequence from "./tutorial/TutorialSequence";
import axios from 'axios';

const oceanBg = "https://cdna.artstation.com/p/assets/images/images/061/904/456/large/milan-vasek-worldmap-wip.jpg?1681900161";

// Base island configuration
const baseIslands = [
  { 
    id: 1, 
    name: "Jungle Lush", 
    img: "https://img.freepik.com/free-vector/empty-background-nature-scenery_1308-34521.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "15%", left: "12%" }, 
    description: "Begin your vocabulary adventure in the lush tropical jungle filled with ancient mysteries",
    treasures: 5,
    biome: "jungle",
    levels: 5,
    difficulty: "Beginner",
    route: "/jungle-lush"
  },
  { 
    id: 2, 
    name: "Waterside Shores", 
    img: "https://img.freepik.com/premium-vector/cartoon-illustration-beach-scene-with-palm-trees-beach-scene_937058-206.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "45%", left: "40%" }, 
    description: "Master spelling challenges along the crystal-clear waterside shores with gentle waves",
    treasures: 7,
    biome: "beach",
    levels: 5,
    difficulty: "Intermediate",
    route: "/waterside-shores"
  },
  { 
    id: 3, 
    name: "The Shadow Isles", 
    img: "https://img.freepik.com/premium-vector/sunset-erupting-volcano-vector-landscape-illustration_147887-376.jpg?ga=GA1.1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", 
    style: { top: "25%", left: "75%" }, 
    description: "Face the ultimate vocabulary challenges in the dark volcanic realm of shadows and fire",
    treasures: 10,
    biome: "volcano",
    levels: 5,
    difficulty: "Advanced",
    route: "/shadow-isles"
  },
];

const pathCoords = [
  [0, 1], // Jungle Lush to Waterside Shores
  [1, 2], // Waterside Shores to The Shadow Isles
];

// Adventure decorations positioned around the 3 islands
const treasureMarks = [
  { id: 1, x: 20, y: 30, type: "treasure" },   // Near Jungle Lush
  { id: 2, x: 50, y: 60, type: "compass" },    // Near Waterside Shores
  { id: 3, x: 80, y: 40, type: "scroll" },     // Near The Shadow Isles
  { id: 4, x: 35, y: 20, type: "artifact" },   // Between islands
  { id: 5, x: 65, y: 50, type: "treasure" },   // Between Waterside and Shadow
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
  const [islands, setIslands] = useState(baseIslands);
  const [islandProgress, setIslandProgress] = useState({});
  const [totalStars, setTotalStars] = useState(0);

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

  // Fetch island progress function
  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('🔄 Fetching island progress...');

      // Fetch all island progress
      const progressResponse = await axios.get('/api/adventure/island-progress', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      console.log('🔍 Raw progress response:', progressResponse);

      // Fetch total stars
      const starsResponse = await axios.get('/api/adventure/island-progress/total-stars', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      console.log('⭐ Raw stars response:', starsResponse);

      const progressData = progressResponse.data;
      console.log('📊 Island progress data:', progressData);

      // Check if we need to migrate old progress for this user
      let shouldMigrate = false;
      try {
        const oldProgressResponse = await axios.get('/api/adventure/level-progress', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        console.log('🔍 Old level progress data:', oldProgressResponse.data);
        
        // If we have old progress but no new progress, trigger migration
        if (oldProgressResponse.data.length > 0 && progressData.length === 0) {
          console.log('🚨 Detected old progress without new progress - triggering migration');
          shouldMigrate = true;
        }
      } catch (error) {
        console.log('🔍 Old level progress API error:', error);
      }

      // Auto-migrate if needed
      if (shouldMigrate) {
        try {
          console.log('🔄 Auto-migrating progress...');
          await axios.post('/api/adventure/island-progress/migrate', {}, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          
          // Refetch progress after migration
          const newProgressResponse = await axios.get('/api/adventure/island-progress', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          
          const newStarsResponse = await axios.get('/api/adventure/island-progress/total-stars', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          
          // Update with migrated data
          const migratedProgressData = newProgressResponse.data;
          setTotalStars(newStarsResponse.data.totalStars || 0);
          console.log('✅ Migration completed, using migrated data:', migratedProgressData);
          
          // Use migrated data for the rest of the function
          progressData.length = 0; // Clear original array
          progressData.push(...migratedProgressData); // Add migrated data
        } catch (migrationError) {
          console.error('❌ Auto-migration failed:', migrationError);
        }
      } else {
        setTotalStars(starsResponse.data.totalStars || 0);
      }

      // Convert progress array to object for easier lookup
      const progressMap = {};
      progressData.forEach(progress => {
        progressMap[progress.islandName] = progress;
      });
      setIslandProgress(progressMap);

      // Update islands with unlock status
      const updatedIslands = baseIslands.map((island, index) => {
        const progress = progressMap[island.name];
        
        // Island 1 is always unlocked
        if (index === 0) {
          return {
            ...island,
            unlocked: true,
            completed: progress ? progress.completedLevel >= island.levels : false,
            completedLevel: progress ? progress.completedLevel : 0,
            starsEarned: progress ? progress.totalStars : 0
          };
        }
        
        // Other islands unlock when previous island is completed
        const previousIsland = baseIslands[index - 1];
        const previousProgress = progressMap[previousIsland.name];
        const previousCompleted = previousProgress ? previousProgress.completedLevel >= previousIsland.levels : false;
        
        console.log(`🏝️ Island ${island.name}:`, {
          previousIsland: previousIsland.name,
          previousProgress: previousProgress,
          previousCompleted,
          willUnlock: previousCompleted
        });
        
        return {
          ...island,
          unlocked: previousCompleted,
          completed: progress ? progress.completedLevel >= island.levels : false,
          completedLevel: progress ? progress.completedLevel : 0,
          starsEarned: progress ? progress.totalStars : 0
        };
      });

      console.log('🏝️ Updated islands:', updatedIslands);
      setIslands(updatedIslands);
    } catch (error) {
      console.error('❌ Failed to fetch island progress:', error);
      // If there's an error, just use default unlocked state for Island 1
      const defaultIslands = baseIslands.map((island, index) => ({
        ...island,
        unlocked: index === 0,
        completed: false,
        completedLevel: 0,
        starsEarned: 0
      }));
      setIslands(defaultIslands);
    }
  };

  // Cleanup inflated star counts automatically (no UI button)
  const cleanupStars = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('/api/adventure/island-progress/cleanup-stars', {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    } catch (error) {}
  };

  // Fetch island progress on component mount (auto-clean first)
  useEffect(() => {
    cleanupStars().then(fetchProgress);
  }, []);

  // Refresh progress when window gains focus (user returns from a level)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Window gained focus, refreshing island progress...');
      fetchProgress();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
            <span className="log-text">Islands Explored: {islands.filter(island => island.completed).length}/3</span>
          </div>
          <div className="log-item">
            <span className="log-text">Stars Earned: {totalStars}</span>
          </div>
          <div className="log-item">
            <span className="log-text">Total Progress: {Math.round((islands.filter(island => island.completed).length / 3) * 100)}%</span>
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
          onClick={island.unlocked ? () => navigate(island.route) : undefined}
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
                  <div className="island-stats">
                    <div className="stat-item">🏆 Levels: {island.levels}</div>
                    <div className="stat-item">⚔️ Difficulty: {island.difficulty}</div>
                  </div>
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