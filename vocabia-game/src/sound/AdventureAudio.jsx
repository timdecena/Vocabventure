// src/sound/AdventureAudio.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdventureAudioManager from './AdventureAudioManager';
import MainAudioManager from './MainAudioManager';

export default function AdventureAudio() {
  const location = useLocation();
  const path = location.pathname || '';

  useEffect(() => {
    const isAdventure = (
      path === '/map' ||
      path.startsWith('/adventure') ||
      path.startsWith('/jungle-lush') ||
      path.startsWith('/waterside-shores') ||
      path.startsWith('/shadow-isles') ||
      path.startsWith('/tutorial')
    );

    if (!isAdventure) {
      // Leaving adventure pages, pause adventure bgm
      AdventureAudioManager.pause();
      return;
    }

    // Ensure site BGM is paused while on adventure pages
    MainAudioManager.pauseBgm();

    // Choose track by route
    if (path === '/map') {
      AdventureAudioManager.playKey('map');
    } else if (path.startsWith('/jungle-lush/level')) {
      // Any jungle gameplay level route
      AdventureAudioManager.playKey('jungle_gameplay');
    } else if (path === '/jungle-lush') {
      AdventureAudioManager.playKey('jungle_world');
    } else {
      // Other adventure routes: keep paused or reuse map
      AdventureAudioManager.pause();
    }
  }, [location, path]);

  // No longer rendering controls here - they're integrated into SiteAudioControls
  return null;
}
