// src/sound/TextToSpeechManager.js
// Text-to-Speech manager for Adventure Mode dialogues with character-specific voices

class TextToSpeechManager {
  static _instance;
  static get instance() {
    if (!TextToSpeechManager._instance) {
      TextToSpeechManager._instance = new TextToSpeechManager();
    }
    return TextToSpeechManager._instance;
  }

  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.enabled = true;
    this.currentUtterance = null;
    this.loadSettings();
    this.loadVoices();

    // Load voices when they become available
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('tts_settings') || '{}');
      this.enabled = settings.enabled ?? true;
    } catch (e) {
      console.warn('[TTS] Failed to load settings', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('tts_settings', JSON.stringify({
        enabled: this.enabled
      }));
    } catch (e) {
      console.warn('[TTS] Failed to save settings', e);
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
  }

  // Character voice profiles with fallback options
  getVoiceForCharacter(characterName) {
    if (!this.voices.length) {
      this.loadVoices();
    }

    const profiles = {
      'Adventurer': {
        // Young male hero voice
        preferredNames: ['Google US English', 'Microsoft David', 'Alex', 'Daniel'],
        pitch: 0.95,
        rate: 1.05,
        volume: 1.0
      },
      'Wizard': {
        // Older, wise voice
        preferredNames: ['Google UK English Male', 'Microsoft George', 'Daniel', 'Fred'],
        pitch: 0.8,
        rate: 0.9,
        volume: 1.0
      },
      'Commawidow': {
        // Sinister, creepy spider voice
        preferredNames: ['Google UK English Female', 'Microsoft Zira', 'Victoria', 'Karen'],
        pitch: 0.55,
        rate: 0.75,
        volume: 1.0
      },
      'Tensaphant': {
        // Deep, menacing elephant voice
        preferredNames: ['Google UK English Male', 'Microsoft David', 'Daniel'],
        pitch: 0.45,
        rate: 0.7,
        volume: 1.0
      },
      'Pluribog': {
        // Guttural, terrifying toad voice
        preferredNames: ['Google UK English Male', 'Microsoft George', 'Daniel'],
        pitch: 0.4,
        rate: 0.65,
        volume: 1.0
      },
      'Grammowl': {
        // Dark, ominous owl voice
        preferredNames: ['Google UK English Male', 'Microsoft George', 'Daniel'],
        pitch: 0.5,
        rate: 0.75,
        volume: 1.0
      },
      'Orc': {
        // Brutal orc minion voice
        preferredNames: ['Google UK English Male', 'Microsoft David', 'Daniel'],
        pitch: 0.6,
        rate: 0.8,
        volume: 1.0
      },
      'Orc Minion': {
        // Brutal orc minion voice (alias)
        preferredNames: ['Google UK English Male', 'Microsoft David', 'Daniel'],
        pitch: 0.6,
        rate: 0.8,
        volume: 1.0
      },
      'System': {
        // Neutral narrator voice
        preferredNames: ['Google US English', 'Microsoft David', 'Alex'],
        pitch: 1.0,
        rate: 1.0,
        volume: 0.9
      }
    };

    const profile = profiles[characterName] || profiles['System'];
    
    // Try to find a preferred voice
    let selectedVoice = null;
    for (const preferredName of profile.preferredNames) {
      selectedVoice = this.voices.find(voice => 
        voice.name.includes(preferredName)
      );
      if (selectedVoice) break;
    }

    // Fallback to first available English voice
    if (!selectedVoice) {
      selectedVoice = this.voices.find(voice => 
        voice.lang.startsWith('en')
      ) || this.voices[0];
    }

    return {
      voice: selectedVoice,
      ...profile
    };
  }

  speak(text, characterName = 'System', onEnd = null) {
    if (!this.enabled || !text) return;

    // Cancel any ongoing speech immediately
    this.stop();

    // Small delay to ensure previous speech is fully stopped
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voiceConfig = this.getVoiceForCharacter(characterName);

        if (voiceConfig.voice) {
          utterance.voice = voiceConfig.voice;
        }
        utterance.pitch = voiceConfig.pitch;
        utterance.rate = voiceConfig.rate;
        utterance.volume = voiceConfig.volume;

        // Handle completion
        utterance.onend = () => {
          this.currentUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onerror = (event) => {
          console.warn('[TTS] Speech error:', event);
          this.currentUtterance = null;
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (error) {
        console.warn('[TTS] Failed to speak:', error);
        if (onEnd) onEnd();
      }
    }, 50);
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (!this.enabled) {
      this.stop();
    }
    this.saveSettings();
  }

  isEnabled() {
    return this.enabled;
  }

  isSpeaking() {
    return this.synth.speaking;
  }

  // Test voice for a character
  testVoice(characterName) {
    const testPhrases = {
      'Adventurer': 'I am ready for this adventure! Let\'s defeat these monsters!',
      'Wizard': 'Welcome, young adventurer. Your journey begins here.',
      'Commawidow': 'You dare challenge me? Your grammar will be your downfall!',
      'Tensaphant': 'I am the master of tense! You cannot defeat me!',
      'Pluribog': 'Foolish mortal! I am the pit of plurals!',
      'Grammowl': 'The shadows have consumed this place... You will fall!',
      'Orc': 'Graaah! You will not pass!',
      'Orc Minion': 'Graaah! You will not pass!',
      'System': 'This is a system narration message.'
    };

    const phrase = testPhrases[characterName] || testPhrases['System'];
    this.speak(phrase, characterName);
  }
}

export default TextToSpeechManager.instance;
