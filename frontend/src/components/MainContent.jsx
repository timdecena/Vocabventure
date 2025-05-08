// src/components/MainContent.jsx
import React, { useState, useEffect } from 'react'
import ProgressStats from './ProgressStats'
import GameModeCard  from './GameModeCard'
import '../styles/Homepage.css'   // make sure this import lives *after* any resets

export default function MainContent() {
  const [username, setUsername] = useState('Explorer')
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    // pull user info from localStorage (from your Login/Register flows)
    const stored = localStorage.getItem('user')
    if (stored) {
      const user = JSON.parse(stored)
      setUsername(user.username || user.name || 'Explorer')
      setAvatarUrl(user.avatarUrl || user.avatar)  // adjust to whatever your API returns
    }
  }, [])

  return (
    <>
      <div className="homepage-greeting">
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} className="homepage-avatar" />
        ) : (
          <div className="homepage-avatar placeholder">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="homepage-welcome">
          <h1>Welcome to VocabVenture, {username}</h1>
          <p className="homepage-subtitle">Your adventure stats at a glance:</p>
        </div>
      </div>

      <h3 className="game-modes-title">Game Modes:</h3>
      <div className="game-modes-grid">
        <GameModeCard
          title="Adventure Mode"
          description="Explore word worlds at your own pace."
          image="/assets/adventure.jpg"
          to="/adventure"
        />
        <GameModeCard
          title="Time Attack Mode"
          description="Race the clock to score high!"
          image="/assets/timeattack.jpg"
          to="/time-attack"
        />
        <GameModeCard
          title="4pics1Word Mode"
          description="Guess the word from four pics."
          image="/assets/4pics1word.jpg"
          to="/four-pics"
        />
      </div>
    </>
  )
}
