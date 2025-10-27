// src/sound/AudioUtils.js
// Utility functions for managing multiple audio managers

import MainAudioManager from './MainAudioManager';
import AdventureAudioManager from './AdventureAudioManager';
import SoundManager from './SoundManager';

class AudioUtils {
  // Force stop ALL audio managers - nuclear option for mute issues
  static forceStopAllAudio() {
    console.log('[AudioUtils] FORCE STOPPING ALL AUDIO MANAGERS');
    
    try {
      // Stop Main Audio Manager
      if (MainAudioManager.forceStopAll) {
        MainAudioManager.forceStopAll();
      } else {
        MainAudioManager.pauseBgm();
        if (MainAudioManager.bgm) {
          MainAudioManager.bgm.volume = 0;
        }
      }
    } catch (e) {
      console.warn('[AudioUtils] Error stopping MainAudioManager:', e);
    }

    try {
      // Stop Adventure Audio Manager
      if (AdventureAudioManager.forceStopAll) {
        AdventureAudioManager.forceStopAll();
      } else {
        AdventureAudioManager.pause();
        if (AdventureAudioManager.bgm) {
          AdventureAudioManager.bgm.volume = 0;
        }
      }
    } catch (e) {
      console.warn('[AudioUtils] Error stopping AdventureAudioManager:', e);
    }

    try {
      // Stop FPOW Sound Manager
      SoundManager.stopBgm();
      if (SoundManager.bgm) {
        SoundManager.bgm.volume = 0;
      }
    } catch (e) {
      console.warn('[AudioUtils] Error stopping SoundManager:', e);
    }

    console.log('[AudioUtils] All audio managers stopped');
  }

  // Get status of all audio managers for debugging
  static getAudioStatus() {
    const status = {
      main: {
        enabled: MainAudioManager.isBgmEnabled(),
        volume: MainAudioManager.getBgmVolume(),
        playing: MainAudioManager.bgm && !MainAudioManager.bgm.paused,
        actualVolume: MainAudioManager.bgm?.volume || 0
      },
      adventure: {
        enabled: AdventureAudioManager.isBgmEnabled(),
        volume: AdventureAudioManager.getBgmVolume(),
        playing: AdventureAudioManager.bgm && !AdventureAudioManager.bgm.paused,
        actualVolume: AdventureAudioManager.bgm?.volume || 0,
        currentTrack: AdventureAudioManager.currentKey
      },
      fpow: {
        enabled: SoundManager.isBgmEnabled(),
        volume: SoundManager.getBgmVolume(),
        playing: SoundManager.bgm && !SoundManager.bgm.paused,
        actualVolume: SoundManager.bgm?.volume || 0
      }
    };
    
    console.log('[AudioUtils] Audio Status:', status);
    return status;
  }

  // Find which audio manager is currently playing
  static getActiveAudioManager() {
    const playing = [];
    
    if (MainAudioManager.bgm && !MainAudioManager.bgm.paused) {
      playing.push('MainAudioManager');
    }
    
    if (AdventureAudioManager.bgm && !AdventureAudioManager.bgm.paused) {
      playing.push('AdventureAudioManager');
    }
    
    if (SoundManager.bgm && !SoundManager.bgm.paused) {
      playing.push('SoundManager');
    }
    
    console.log('[AudioUtils] Currently playing audio managers:', playing);
    return playing;
  }
}

export default AudioUtils;
