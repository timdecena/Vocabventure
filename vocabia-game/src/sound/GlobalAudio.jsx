// src/sound/GlobalAudio.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainAudioManager from './MainAudioManager';

// Component mounted once inside BrowserRouter.
// - Plays site BGM on student pages (except FPOW routes)
// - Pauses site BGM on FPOW routes or non-student pages
// - Adds a global click sound for buttons/links across the site (skips FPOW routes)
export default function GlobalAudio() {
  const location = useLocation();

  // Preload click sound pool on mount
  useEffect(() => {
    MainAudioManager.preloadEffects?.();
  }, []);

  // Route-based BGM control
  useEffect(() => {
    const path = location.pathname || '';
    const isFPOW = /\/4pic1word(\/|$)/.test(path);
    const isStudentArea = path === '/student-home' || path.startsWith('/student');
    const isAdventure = (
      path === '/map' ||
      path.startsWith('/adventure') ||
      path.startsWith('/student/adventure') ||
      path.startsWith('/jungle-lush') ||
      path.startsWith('/waterside-shores') ||
      path.startsWith('/shadow-isles') ||
      path.startsWith('/tutorial')
    );

    if (isFPOW || isAdventure) {
      // Pause site bgm while in the game, FPOW has its own BGM
      MainAudioManager.pauseBgm();
    } else if (isStudentArea) {
      // Ensure site bgm plays on student pages
      MainAudioManager.playBgm();
    } else {
      // No site BGM on other areas by default
      MainAudioManager.pauseBgm();
    }
  }, [location]);

  // Global click sound (skip while on FPOW routes)
  useEffect(() => {
    const handler = (ev) => {
      const path = location.pathname || '';
      if (/\/4pic1word(\/|$)/.test(path)) return; // FPOW handles its own sounds
      // Check if target or ancestors are clickable UI elements
      const target = ev.target;
      const clickable = target?.closest?.(
        'button, a[href], [role="button"], .MuiButtonBase-root, input[type="button"], input[type="submit"]'
      );
      if (!clickable) return;
      if (clickable.hasAttribute('data-no-click-sound')) return;
      if (clickable.disabled || clickable.getAttribute('aria-disabled') === 'true') return;
      MainAudioManager.playClick();
    };

    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [location]);

  return null;
}
