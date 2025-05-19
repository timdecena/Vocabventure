import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MapView.css';

const API_BASE_URL = 'http://localhost:8081';

const ISLANDS = [
  {
    id: 1,
    name: "Vocabulary Cove",
    description: "Begin your journey in the peaceful cove of basic words",
    color: "#4CAF50",
    position: { x: 20, y: 60 }
  },
  {
    id: 2,
    name: "Synonym Sands",
    description: "Discover words that share similar meanings",
    color: "#FFC107",
    position: { x: 35, y: 40 }
  },
  {
    id: 3,
    name: "Antonym Archipelago",
    description: "Master the art of opposite meanings",
    color: "#2196F3",
    position: { x: 50, y: 60 }
  },
  {
    id: 4,
    name: "Context Cliffs",
    description: "Learn to use words in the right situations",
    color: "#9C27B0",
    position: { x: 65, y: 40 }
  },
  {
    id: 5,
    name: "Vocabulary Volcano",
    description: "The ultimate challenge of word mastery",
    color: "#F44336",
    position: { x: 80, y: 60 }
  }
];

export default function MapView() {
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIsland, setSelectedIsland] = useState(null);
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user data found');
      }
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Error accessing user data:', err);
      setError('Unable to access user data. Please try logging in again.');
      return null;
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const user = getUserData();
        if (!user || !user.id) {
          setError('User not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/adventure-profile?userId=${user.id}`, {
          withCredentials: true
        });
        setUserProgress(response.data);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleIslandClick = (island) => {
    if (island.id <= (userProgress?.current_island || 0)) {
      setSelectedIsland(island);
    }
  };

  const handleLevelSelect = (islandId) => {
    navigate(`/game/levels/${islandId}`);
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
        Loading your adventure map...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Return to Login</button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0a0a2e',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background with stars */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, #1a1a40 0%, #0a0a2e 100%)',
        zIndex: 1
      }} />

      {/* Islands and paths */}
      <div style={{
        position: 'relative',
        height: '100%',
        zIndex: 2
      }}>
        {/* Paths between islands */}
        {ISLANDS.slice(0, -1).map((island, index) => {
          const nextIsland = ISLANDS[index + 1];
          const isUnlocked = island.id < (userProgress?.current_island || 0);
          
          return (
            <div
              key={`path-${island.id}`}
              style={{
                position: 'absolute',
                left: `${island.position.x}%`,
                top: `${island.position.y}%`,
                width: `${nextIsland.position.x - island.position.x}%`,
                height: '4px',
                backgroundColor: isUnlocked ? '#4CAF50' : '#444',
                transform: 'rotate(45deg)',
                transformOrigin: 'left center',
                zIndex: 1
              }}
            />
          );
        })}

        {/* Islands */}
        {ISLANDS.map((island) => {
          const isUnlocked = island.id <= (userProgress?.current_island || 0);
          const isCompleted = island.id < (userProgress?.current_island || 0);
          
          return (
            <div
              key={island.id}
              onClick={() => handleIslandClick(island)}
              style={{
                position: 'absolute',
                left: `${island.position.x}%`,
                top: `${island.position.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                zIndex: 2
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: isUnlocked ? island.color : '#444',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: isUnlocked ? '0 0 20px rgba(255, 255, 255, 0.3)' : 'none',
                transition: 'all 0.3s ease-in-out',
                transform: selectedIsland?.id === island.id ? 'scale(1.1)' : 'scale(1)'
              }}>
                {isCompleted ? (
                  <span style={{ fontSize: '2rem', color: '#fff' }}>✓</span>
                ) : (
                  <span style={{ fontSize: '1.5rem', color: '#fff' }}>{island.id}</span>
                )}
              </div>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '10px',
                textAlign: 'center',
                color: '#fff',
                width: '150px'
              }}>
                <div style={{ fontWeight: 'bold' }}>{island.name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{island.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Select Modal */}
      {selectedIsland && (
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
            color: '#fff'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>{selectedIsland.name}</h2>
            <p style={{ marginBottom: '2rem' }}>{selectedIsland.description}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setSelectedIsland(null)}
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
                onClick={() => handleLevelSelect(selectedIsland.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedIsland.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Start Adventure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 