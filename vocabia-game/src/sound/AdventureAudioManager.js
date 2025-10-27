// src/sound/AdventureAudioManager.js
// Manages route-specific BGM for Adventure mode

const PUBLIC = process.env.PUBLIC_URL || '';

const TRACKS = {
  map: `${PUBLIC}/adventure_mode_sound/map_background_music.mp3`,
  jungle_world: `${PUBLIC}/adventure_mode_sound/forest_lush_background_music.mp3`,
  jungle_gameplay: `${PUBLIC}/adventure_mode_sound/forest_gameplay_music.mp3`,
};

class AdventureAudioManager {
  static _instance;
  static get instance() {
    if (!AdventureAudioManager._instance) AdventureAudioManager._instance = new AdventureAudioManager();
    return AdventureAudioManager._instance;
  }

  constructor() {
    this.bgm = null;
    this.currentKey = null;
    this.bgmEnabled = true;
    this.bgmVolume = 0.5;
    this._firstGestureBound = false;
    this._initialized = false;
    this.loadSettings();
    this.initialize();
  }

  initialize() {
    if (this._initialized) return;
    
    // Initialize on next tick to allow DOM to be ready
    setTimeout(() => {
      this.ensureBgm();
      this._initialized = true;
      console.log('[AdventureAudioManager] Initialized successfully');
    }, 100);
  }

  loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('adventure_audio_settings') || '{}');
      this.bgmEnabled = s.bgmEnabled ?? true;
      this.bgmVolume = s.bgmVolume ?? 0.5;
    } catch (e) {
      console.warn('[AdventureAudioManager] Failed to load settings:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('adventure_audio_settings', JSON.stringify({
        bgmEnabled: this.bgmEnabled,
        bgmVolume: this.bgmVolume,
      }));
    } catch {}
  }

  ensureBgm() {
    if (!this.bgm) {
      this.bgm = new Audio();
      this.bgm.loop = true;
      this.bgm.preload = 'auto';
      this.bgm.volume = this.bgmEnabled ? this.bgmVolume : 0;
      this.bgm.addEventListener('error', () => {
        console.warn('[AdventureAudioManager] BGM failed to load', this.bgm?.src);
      });
    }
  }

  async playKey(key) {
    const src = TRACKS[key];
    if (!src) {
      console.warn('[AdventureAudioManager] No track found for key:', key);
      return;
    }
    
    this.ensureBgm();
    try {
      if (this.currentKey !== key) {
        this.currentKey = key;
        this.bgm.src = src;
        console.log('[AdventureAudioManager] Switched to track:', key);
      }
      if (this.bgmEnabled && this.bgm.paused) {
        this.bgm.volume = this.bgmVolume;
        await this.bgm.play();
        console.log('[AdventureAudioManager] Playing track:', key);
      }
    } catch (e) {
      console.warn('[AdventureAudioManager] Autoplay blocked for track:', key, e.message);
      if (!this._firstGestureBound) {
        this._firstGestureBound = true;
        const resume = () => {
          this.playKey(key).finally(() => {
            document.removeEventListener('click', resume, true);
            document.removeEventListener('keydown', resume, true);
            document.removeEventListener('touchstart', resume, true);
            this._firstGestureBound = false;
          });
        };
        document.addEventListener('click', resume, true);
        document.addEventListener('keydown', resume, true);
        document.addEventListener('touchstart', resume, true);
      }
    }
  }

  pause() {
    if (this.bgm && !this.bgm.paused) {
      try { this.bgm.pause(); } catch {}
    }
  }

  stop() {
    if (this.bgm) {
      try { 
        this.bgm.pause(); 
        this.bgm.currentTime = 0; 
        console.log('[AdventureAudioManager] BGM stopped completely');
      } catch {}
    }
  }

  // Force stop all audio - for debugging mute issues
  forceStopAll() {
    console.log('[AdventureAudioManager] FORCE STOPPING ALL AUDIO');
    if (this.bgm) {
      try {
        this.bgm.pause();
        this.bgm.volume = 0;
        this.bgm.currentTime = 0;
        console.log('[AdventureAudioManager] BGM force stopped');
      } catch (e) {
        console.warn('[AdventureAudioManager] Error force stopping BGM:', e);
      }
    }
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = !!enabled;
    if (!this.bgmEnabled) {
      // Force stop everything when disabled
      this.forceStopAll();
      console.log('[AdventureAudioManager] BGM DISABLED - force stopped all audio');
    } else {
      if (this.bgm) {
        this.bgm.volume = this.bgmVolume;
      }
      if (this.currentKey) {
        this.playKey(this.currentKey);
      }
      console.log('[AdventureAudioManager] BGM ENABLED - volume restored and playing');
    }
    this.saveSettings();
  }

  setBgmVolume(v) {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    if (this.bgm && this.bgmEnabled) {
      this.bgm.volume = this.bgmVolume;
    }
    this.saveSettings();
  }

  isBgmEnabled() { return this.bgmEnabled; }
  getBgmVolume() { return this.bgmVolume; }
}

export default AdventureAudioManager.instance;
