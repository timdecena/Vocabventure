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
    this.loadSettings();
  }

  loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('adventure_audio_settings') || '{}');
      this.bgmEnabled = s.bgmEnabled ?? true;
      this.bgmVolume = s.bgmVolume ?? 0.5;
    } catch {}
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
    if (!src) return;
    this.ensureBgm();
    try {
      if (this.currentKey !== key) {
        this.currentKey = key;
        this.bgm.src = src;
      }
      if (this.bgmEnabled) {
        await this.bgm.play();
      }
    } catch (e) {
      if (!this._firstGestureBound) {
        this._firstGestureBound = true;
        const resume = () => {
          this.playKey(key).finally(() => {
            document.removeEventListener('click', resume, true);
            document.removeEventListener('keydown', resume, true);
            this._firstGestureBound = false;
          });
        };
        document.addEventListener('click', resume, true);
        document.addEventListener('keydown', resume, true);
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
      try { this.bgm.pause(); this.bgm.currentTime = 0; } catch {}
    }
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = !!enabled;
    if (!this.bgmEnabled) this.pause();
    else if (this.currentKey) this.playKey(this.currentKey);
    this.saveSettings();
  }

  setBgmVolume(v) {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    if (this.bgm) this.bgm.volume = this.bgmEnabled ? this.bgmVolume : 0;
    this.saveSettings();
  }

  isBgmEnabled() { return this.bgmEnabled; }
  getBgmVolume() { return this.bgmVolume; }
}

export default AdventureAudioManager.instance;
