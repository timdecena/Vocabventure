// src/sound/SoundManager.js
// Centralized audio manager for FPOW
// Uses public/fpow_sound assets. Filenames taken from actual directory listing.

const PUBLIC = process.env.PUBLIC_URL || '';

const FILES = {
  bgm: `${PUBLIC}/fpow_sound/fpow_background_muic.mp3`, // note: filename is 'muic' in the folder
  button_press: `${PUBLIC}/fpow_sound/button_press.mp3`,
  hint_buy: `${PUBLIC}/fpow_sound/hint_buy.mp3`,
  level_complete: `${PUBLIC}/fpow_sound/level_complete.mp3`,
  category_complete: `${PUBLIC}/fpow_sound/category_complete.mp3`,
  wrong_answer: `${PUBLIC}/fpow_sound/wrong_answer.mp3`,
};

class SoundManager {
  static _instance;

  static get instance() {
    if (!SoundManager._instance) SoundManager._instance = new SoundManager();
    return SoundManager._instance;
  }

  constructor() {
    // Background music audio element (single instance)
    this.bgm = null;
    this.bgmVolume = 0.35;
    this.bgmEnabled = true;
    this.effectsEnabled = true;
    this.effectsVolume = 0.9;
    
    // Load settings from localStorage
    this.loadSettings();

    // Simple cache of effect buffers (HTMLAudio) to reduce creation overhead
    this.effects = {
      button_press: [],
      hint_buy: [],
      level_complete: [],
      category_complete: [],
      wrong_answer: [],
    };

    // Preload a few instances per effect for overlapping playback
    this._preloaded = false;
    this._initialized = false;
    this._firstGestureBound = false;
    
    this.initialize();
  }

  initialize() {
    if (this._initialized) return;
    
    // Initialize on next tick to allow DOM to be ready
    setTimeout(() => {
      this.preloadEffects();
      this.ensureBgm();
      this._initialized = true;
      console.log('[SoundManager] Initialized successfully');
    }, 100);
  }

  // Load audio settings from localStorage
  loadSettings() {
    try {
      const settings = localStorage.getItem('fpow_audio_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.bgmVolume = parsed.bgmVolume ?? 0.35;
        this.bgmEnabled = parsed.bgmEnabled ?? true;
        this.effectsEnabled = parsed.effectsEnabled ?? true;
        this.effectsVolume = parsed.effectsVolume ?? 0.9;
      }
    } catch (e) {
      console.warn('[SoundManager] Failed to load audio settings:', e);
    }
  }

  // Save audio settings to localStorage
  saveSettings() {
    try {
      const settings = {
        bgmVolume: this.bgmVolume,
        bgmEnabled: this.bgmEnabled,
        effectsEnabled: this.effectsEnabled,
        effectsVolume: this.effectsVolume
      };
      localStorage.setItem('fpow_audio_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save audio settings:', e);
    }
  }

  preloadEffects() {
    if (this._preloaded) return;
    const keys = Object.keys(this.effects);
    keys.forEach((key) => {
      // create 3 instances for light polyphony
      // Skip if mapping is missing
      if (!FILES[key]) {
        console.warn(`[SoundManager] No audio file mapping for effect "${key}"`);
        return;
      }
      for (let i = 0; i < 3; i++) {
        const a = new Audio(FILES[key]);
        a.preload = 'auto';
        a.addEventListener('error', () => {
          console.warn(`[SoundManager] Effect audio failed to load for key "${key}":`, a?.src);
        });
        this.effects[key].push(a);
      }
    });
    this._preloaded = true;
  }

  ensureBgm() {
    if (!this.bgm) {
      if (!FILES.bgm) {
        console.warn('[SoundManager] No BGM file mapping defined');
        return;
      }
      this.bgm = new Audio(FILES.bgm);
      this.bgm.loop = true;
      this.bgm.volume = this.bgmEnabled ? this.bgmVolume : 0;
      this.bgm.preload = 'auto';
      this.bgm.addEventListener('error', () => {
        console.warn('[SoundManager] BGM failed to load:', this.bgm?.src);
      });
    }
  }

  async playBgm() {
    try {
      this.ensureBgm();
      if (this.bgm && this.bgm.paused && this.bgmEnabled) {
        this.bgm.volume = this.bgmVolume;
        await this.bgm.play();
        console.log('[SoundManager] BGM started successfully');
      }
    } catch (e) {
      console.warn('[SoundManager] BGM autoplay blocked, will retry on user gesture:', e.message);
      // Attach a one-time gesture listener if not yet bound
      if (!this._firstGestureBound) {
        this._firstGestureBound = true;
        const resume = () => {
          this.playBgm().finally(() => {
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

  stopBgm() {
    if (this.bgm && !this.bgm.paused) {
      try {
        this.bgm.pause();
      } catch { /* noop */ }
    }
  }

  pauseBgm() {
    if (this.bgm && !this.bgm.paused) {
      try {
        this.bgm.pause();
      } catch { /* noop */ }
    }
  }

  resumeBgm() {
    if (this.bgm && this.bgm.paused && this.bgmEnabled) {
      try {
        this.bgm.play();
      } catch { /* noop */ }
    }
  }

  // Volume controls
  setBgmVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm && this.bgmEnabled) {
      this.bgm.volume = this.bgmVolume;
    }
    this.saveSettings();
  }

  setEffectsVolume(volume) {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  // Mute controls
  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgm) {
      if (this.bgmEnabled) {
        this.bgm.volume = this.bgmVolume;
        if (this.bgm.paused) {
          this.bgm.play().catch(() => {});
        }
      } else {
        this.bgm.volume = 0;
        this.bgm.pause();
      }
    }
    this.saveSettings();
    console.log('[SoundManager] BGM enabled:', this.bgmEnabled);
    return this.bgmEnabled;
  }

  toggleEffects() {
    this.effectsEnabled = !this.effectsEnabled;
    this.saveSettings();
    return this.effectsEnabled;
  }

  // Stop all audio (for cleanup when leaving FPOW)
  stopAllAudio() {
    this.stopBgm();
    // Stop all effect sounds
    Object.values(this.effects).forEach(pool => {
      pool.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    });
  }

  // Getters for UI
  isBgmEnabled() { return this.bgmEnabled; }
  areEffectsEnabled() { return this.effectsEnabled; }
  getBgmVolume() { return this.bgmVolume; }
  getEffectsVolume() { return this.effectsVolume; }

  // Play short sound effects by name
  playEffect(name) {
    if (!this.effectsEnabled) return;
    
    // Map potential aliases to correct filenames
    const map = {
      button: 'button_press',
      button_press: 'button_press',
      hint: 'hint_buy',
      hint_buy: 'hint_buy',
      level_complete: 'level_complete',
      category_complete: 'category_complete',
      wrong: 'wrong_answer',
      wrong_answer: 'wrong_answer',
      incorrect: 'wrong_answer',
    };
    const key = map[name] || name;
    if (!this.effects[key]) {
      console.warn(`[SoundManager] Unknown effect name: "${name}" (resolved key: "${key}")`);
      return;
    }

    // Ensure we have a valid file mapping
    if (!FILES[key]) {
      console.warn(`[SoundManager] No audio source for effect key: "${key}"`);
      return;
    }

    // Find an available audio instance or clone
    const pool = this.effects[key];
    let audio = pool.find((a) => a.paused || a.ended);
    if (!audio) {
      audio = new Audio(FILES[key]);
      audio.addEventListener('error', (e) => {
        console.warn(`[SoundManager] Effect audio failed to load for key "${key}":`, audio?.src, e);
      });
      pool.push(audio);
    }
    try {
      audio.currentTime = 0;
      audio.volume = this.effectsVolume;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          // Avoid unhandled promise rejection (e.g., unsupported source or autoplay restrictions)
          console.warn('[SoundManager] Effect play failed:', name, err.message);
        });
      }
    } catch (e) {
      console.warn('[SoundManager] Effect play error:', name, e.message);
    }
  }
}

export default SoundManager.instance;
