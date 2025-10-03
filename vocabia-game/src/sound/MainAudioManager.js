// src/sound/MainAudioManager.js
// Global audio manager for the whole site (non-FPOW)
// Uses public/main_sound assets.

const PUBLIC = process.env.PUBLIC_URL || '';

const FILES = {
  bgm: `${PUBLIC}/main_sound/main_background_music.mp3`,
  click: `${PUBLIC}/main_sound/main_button_click.mp3`,
  // Global SFX requested
  correct_answer: `${PUBLIC}/adventure_mode_sound/correct_answer_sound_effect.mp3`,
  wrong_answer: `${PUBLIC}/adventure_mode_sound/wrong_answer_sound_effect.mp3`,
  level_completed: `${PUBLIC}/adventure_mode_sound/level_completed_music.mp3`,
};

class MainAudioManager {
  static _instance;
  static get instance() {
    if (!MainAudioManager._instance) MainAudioManager._instance = new MainAudioManager();
    return MainAudioManager._instance;
  }

  constructor() {
    this.bgm = null;
    this.bgmEnabled = true;
    this.bgmVolume = 0.35;

    this.effectsEnabled = true;
    this.effectsVolume = 0.9;

    this._pools = {
      click: [],
      correct_answer: [],
      wrong_answer: [],
      level_completed: [],
    };
    this._preloaded = false;

    this._firstGestureBound = false;

    this.loadSettings();
  }

  loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('main_audio_settings') || '{}');
      this.bgmEnabled = s.bgmEnabled ?? true;
      this.bgmVolume = s.bgmVolume ?? 0.35;
      this.effectsEnabled = s.effectsEnabled ?? true;
      this.effectsVolume = s.effectsVolume ?? 0.9;
    } catch {}
  }

  saveSettings() {
    try {
      localStorage.setItem('main_audio_settings', JSON.stringify({
        bgmEnabled: this.bgmEnabled,
        bgmVolume: this.bgmVolume,
        effectsEnabled: this.effectsEnabled,
        effectsVolume: this.effectsVolume,
      }));
    } catch {}
  }

  ensureBgm() {
    if (!this.bgm) {
      if (!FILES.bgm) return;
      this.bgm = new Audio(FILES.bgm);
      this.bgm.loop = true;
      this.bgm.preload = 'auto';
      this.bgm.volume = this.bgmEnabled ? this.bgmVolume : 0;
      this.bgm.addEventListener('error', () => {
        console.warn('[MainAudioManager] BGM failed to load', this.bgm?.src);
      });
    }
  }

  preloadEffects() {
    if (this._preloaded) return;
    const keys = Object.keys(this._pools);
    keys.forEach((key) => {
      const src = FILES[key];
      if (!src) return;
      for (let i = 0; i < 4; i++) {
        const a = new Audio(src);
        a.preload = 'auto';
        a.addEventListener('error', () => {
          console.warn(`[MainAudioManager] Sound failed to load for ${key}`, a?.src);
        });
        this._pools[key].push(a);
      }
    });
    this._preloaded = true;
  }

  async playBgm() {
    try {
      this.ensureBgm();
      if (this.bgm && this.bgmEnabled) {
        await this.bgm.play();
      }
    } catch (e) {
      // Autoplay policy – will succeed on next user gesture
      // Attach a one-time gesture listener if not yet bound
      if (!this._firstGestureBound) {
        this._firstGestureBound = true;
        const resume = () => {
          this.playBgm().finally(() => {
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

  pauseBgm() {
    if (this.bgm && !this.bgm.paused) {
      try { this.bgm.pause(); } catch {}
    }
  }

  stopBgm() {
    if (this.bgm) {
      try { this.bgm.pause(); this.bgm.currentTime = 0; } catch {}
    }
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = !!enabled;
    if (!this.bgmEnabled) this.pauseBgm();
    else this.playBgm();
    this.saveSettings();
  }

  setBgmVolume(v) {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    if (this.bgm) this.bgm.volume = this.bgmEnabled ? this.bgmVolume : 0;
    this.saveSettings();
  }

  setEffectsEnabled(enabled) {
    this.effectsEnabled = !!enabled;
    this.saveSettings();
  }

  setEffectsVolume(v) {
    this.effectsVolume = Math.max(0, Math.min(1, v));
    this.saveSettings();
  }

  playEffect(name) {
    if (!this.effectsEnabled) return;
    // alias map
    const map = {
      click: 'click',
      button: 'click',
      correct: 'correct_answer',
      correct_answer: 'correct_answer',
      success: 'correct_answer',
      wrong: 'wrong_answer',
      incorrect: 'wrong_answer',
      wrong_answer: 'wrong_answer',
      level_complete: 'level_completed',
      level_completed: 'level_completed',
    };
    const key = map[name] || name;
    if (!FILES[key]) return;

    const pool = this._pools[key] || (this._pools[key] = []);
    let a = pool.find(x => x.paused);
    if (!a) {
      a = new Audio(FILES[key]);
      pool.push(a);
    }
    try {
      a.currentTime = 0;
      a.volume = this.effectsVolume;
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {}
  }

  // Backward compatibility for previous code
  playClick() { this.playEffect('click'); }

  // --- API parity with FPOW SoundManager ---
  isBgmEnabled() { return this.bgmEnabled; }
  areEffectsEnabled() { return this.effectsEnabled; }
  getBgmVolume() { return this.bgmVolume; }
  getEffectsVolume() { return this.effectsVolume; }
  toggleBgm() {
    this.setBgmEnabled(!this.bgmEnabled);
    return this.bgmEnabled;
  }
  toggleEffects() {
    this.setEffectsEnabled(!this.effectsEnabled);
    return this.effectsEnabled;
  }

  // Alias methods for AdventureAudioControls compatibility
  isSfxEnabled() { return this.effectsEnabled; }
  setSfxEnabled(enabled) { this.setEffectsEnabled(enabled); }
  getSfxVolume() { return this.effectsVolume; }
  setSfxVolume(volume) { this.setEffectsVolume(volume); }
}

export default MainAudioManager.instance;
