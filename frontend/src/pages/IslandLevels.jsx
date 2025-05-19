import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ISLANDS = {
  1: { name: "Vocabulary Cove", color: "#4CAF50" },
  2: { name: "Synonym Sands", color: "#FFC107" },
  3: { name: "Antonym Archipelago", color: "#2196F3" },
  4: { name: "Context Cliffs", color: "#9C27B0" },
  5: { name: "Vocabulary Volcano", color: "#F44336" }
};

const LEVEL_DESCRIPTIONS = {
  1: "Basic word recognition",
  2: "Simple word meanings",
  3: "Word usage in sentences",
  4: "Word relationships",
  5: "Island Master Challenge"
};

export default function IslandLevels() {
  const { islandId } = useParams();
  const navigate = useNavigate();
  const [levelStats, setLevelStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    const fetchLevelStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          setError('User not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/adventure-level-stats?user_id=${user.id}&island=${islandId}`);
        setLevelStats(response.data);
      } catch (err) {
        setError('Failed to load level progress');
      } finally {
        setLoading(false);
      }
    };

    fetchLevelStats();
  }, [islandId]);

  const handleLevelClick = (levelNumber) => {
    // Check if level is unlocked
    const previousLevel = levelNumber > 1 ? levelStats.find(stat => stat.level_number === levelNumber - 1) : null;
    const isUnlocked = levelNumber === 1 || (previousLevel && previousLevel.stars > 0);
    
    if (isUnlocked) {
      setSelectedLevel(levelNumber);
    }
  };

  const handleStartLevel = (levelNumber) => {
    navigate(`/game/play/${islandId}/${levelNumber}`);
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a2e',
        color: '#fff'
      }}>
        Loading island levels...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a2e',
        color: '#ff4444'
      }}>
        {error}
      </div>
    );
  }

  const island = ISLANDS[islandId];
  if (!island) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a2e',
        color: '#ff4444'
      }}>
        Island not found
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a2e',
      padding: '2rem',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: island.color
        }}>
          {island.name}
        </h1>
        <button
          onClick={() => navigate('/map')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Map
        </button>
      </div>

      {/* Levels Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {[1, 2, 3, 4, 5].map((levelNumber) => {
          const levelStat = levelStats.find(stat => stat.level_number === levelNumber);
          const previousLevel = levelNumber > 1 ? levelStats.find(stat => stat.level_number === levelNumber - 1) : null;
          const isUnlocked = levelNumber === 1 || (previousLevel && previousLevel.stars > 0);
          const isMiniboss = levelNumber === 5;

          return (
            <div
              key={levelNumber}
              onClick={() => handleLevelClick(levelNumber)}
              style={{
                backgroundColor: isUnlocked ? '#1a1a40' : '#0f0f2a',
                borderRadius: '8px',
                padding: '1.5rem',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.6,
                transition: 'all 0.3s ease-in-out',
                transform: selectedLevel === levelNumber ? 'scale(1.05)' : 'scale(1)',
                border: `2px solid ${isUnlocked ? island.color : '#444'}`,
                position: 'relative'
              }}
            >
              {isMiniboss && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: '#ff4444',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  MINIBOSS
                </div>
              )}
              
              <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: isUnlocked ? '#fff' : '#666'
              }}>
                Level {levelNumber}
              </h2>
              
              <p style={{
                fontSize: '0.9rem',
                marginBottom: '1rem',
                color: isUnlocked ? '#ccc' : '#666'
              }}>
                {LEVEL_DESCRIPTIONS[levelNumber]}
              </p>

              {/* Stars */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: '1.5rem',
                      color: levelStat?.stars >= star ? '#FFD700' : '#444'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Best Score */}
              {levelStat?.best_score && (
                <div style={{
                  fontSize: '0.9rem',
                  color: '#4CAF50'
                }}>
                  Best Score: {levelStat.best_score}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level Start Modal */}
      {selectedLevel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3
        }}>
          <div style={{
            backgroundColor: '#1a1a40',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            color: '#fff',
            border: `2px solid ${island.color}`
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Level {selectedLevel}</h2>
            <p style={{ marginBottom: '2rem' }}>{LEVEL_DESCRIPTIONS[selectedLevel]}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setSelectedLevel(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={() => handleStartLevel(selectedLevel)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: island.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Start Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 