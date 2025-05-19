import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

const ISLANDS = {
  1: { name: "Vocabulary Cove", color: "#4CAF50" },
  2: { name: "Synonym Sands", color: "#FFC107" },
  3: { name: "Antonym Archipelago", color: "#2196F3" },
  4: { name: "Context Cliffs", color: "#9C27B0" },
  5: { name: "Vocabulary Volcano", color: "#F44336" }
};

export default function PlayerStats() {
  const [stats, setStats] = useState({
    totalStars: 0,
    scrollsCollected: 0,
    hearts: 3,
    currentIsland: 1,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          throw new Error('User not found');
        }

        // Fetch adventure profile
        const profileResponse = await axios.get(`/api/adventure-profile?userId=${user.id}`);
        
        // Fetch level stats for all islands
        const levelStatsPromises = Object.keys(ISLANDS).map(islandId =>
          axios.get(`/api/adventure-level-stats?user_id=${user.id}&island=${islandId}`)
        );
        
        const levelStatsResponses = await Promise.all(levelStatsPromises);
        
        // Calculate total stars
        const totalStars = levelStatsResponses.reduce((total, response) => {
          return total + response.data.reduce((islandTotal, level) => 
            islandTotal + (level.starsEarned || 0), 0);
        }, 0);

        // Calculate scrolls collected (completed levels)
        const scrollsCollected = levelStatsResponses.reduce((total, response) => {
          return total + response.data.filter(level => level.completed).length;
        }, 0);

        // Find current island (highest unlocked island)
        const currentIsland = levelStatsResponses.reduce((highest, response, index) => {
          const islandId = index + 1;
          const hasCompletedLevel = response.data.some(level => level.completed);
          return hasCompletedLevel ? islandId : highest;
        }, 1);

        setStats({
          totalStars,
          scrollsCollected,
          hearts: 3, // Default hearts
          currentIsland,
          loading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Loading your adventure stats...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Error loading stats</h1>
            <p>{stats.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Adventure Stats</h1>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.totalStars}</div>
            <div className="stat-label">Total Stars</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📜</div>
            <div className="stat-value">{stats.scrollsCollected}</div>
            <div className="stat-label">Scrolls Collected</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">{stats.hearts}</div>
            <div className="stat-label">Hearts</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏝️</div>
            <div className="stat-value">{ISLANDS[stats.currentIsland].name}</div>
            <div className="stat-label">Current Island</div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Island Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(ISLANDS).map(([id, island]) => (
              <div
                key={id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: `2px solid ${island.color}`,
                  opacity: parseInt(id) <= stats.currentIsland ? 1 : 0.5
                }}
              >
                <h3 style={{ color: island.color, margin: 0 }}>{island.name}</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: '#fff' }}>
                  {parseInt(id) <= stats.currentIsland ? 'Unlocked' : 'Locked'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 