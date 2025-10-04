# Text-to-Speech Integration Guide for Adventure Mode

## Overview
The TTS system provides immersive voice narration for Adventure Mode dialogues with character-specific voices.

## Features
- **Character-Specific Voices**: Different pitch, rate, and tone for each character
- **Automatic Voice Selection**: Intelligently selects appropriate voices based on character
- **User Control**: Enable/disable TTS via gear icon settings
- **Persistent Settings**: TTS preferences saved to localStorage

## Character Voice Profiles (Optimized)

| Character | Voice Type | Pitch | Rate | Description |
|-----------|------------|-------|------|-------------|
| **Adventurer** | Young male hero | 0.95 | 1.05 | Confident, masculine voice |
| **Wizard** | Older, wise | 0.8 | 0.9 | Deep, authoritative voice |
| **Commawidow** | Sinister spider | 0.55 | 0.75 | Very creepy, menacing voice |
| **Tensaphant** | Menacing elephant | 0.45 | 0.7 | Deep, terrifying voice |
| **Pluribog** | Terrifying toad | 0.4 | 0.65 | Extremely low, monstrous voice |
| **Grammowl** | Dark owl boss | 0.5 | 0.75 | Ominous, threatening voice |
| **Orc/Orc Minion** | Brutal warrior | 0.6 | 0.8 | Aggressive, brutish voice |
| **System** | Neutral narrator | 1.0 | 1.0 | Clear, neutral narration |

## How to Integrate TTS into Adventure Levels

### Step 1: Import TextToSpeechManager

```javascript
import TextToSpeechManager from '../../sound/TextToSpeechManager';
```

### Step 2: Add useEffect for Dialogue Speech

```javascript
// Speak dialogue when it changes
useEffect(() => {
  if (phase === 'dialogue' && dialogueSequence[dialogueIdx]) {
    const dialogue = dialogueSequence[dialogueIdx];
    // Map "User" to "Adventurer" for voice selection
    const speaker = dialogue.speaker === 'User' ? 'Adventurer' : dialogue.speaker;
    TextToSpeechManager.speak(dialogue.text, speaker);
  }
  return () => {
    // Stop speech when component unmounts or dialogue changes
    TextToSpeechManager.stop();
  };
}, [dialogueIdx, phase]);
```

### Step 3: Stop Speech on Dialogue Advance

```javascript
const handleDialogueClick = () => {
  setShowClickPrompt(false);
  if (idleTimeout.current) clearTimeout(idleTimeout.current);
  // Stop current speech when advancing dialogue
  TextToSpeechManager.stop();
  if (dialogueIdx < dialogueSequence.length - 1) {
    setDialogueIdx(dialogueIdx + 1);
  } else {
    setPhase('battle');
  }
};
```

### Step 4: Handle Multiple Dialogue Phases (if applicable)

For levels with multiple dialogue phases (e.g., victory dialogue, mid-battle dialogue):

```javascript
// Victory dialogue TTS
useEffect(() => {
  if (phase === 'victoryDialogue' && victoryDialogue[victoryDialogueIdx]) {
    const dialogue = victoryDialogue[victoryDialogueIdx];
    const speaker = dialogue.speaker === 'User' ? 'Adventurer' : dialogue.speaker;
    TextToSpeechManager.speak(dialogue.text, speaker);
  }
  return () => {
    TextToSpeechManager.stop();
  };
}, [victoryDialogueIdx, phase]);
```

## User Controls

Users can control TTS through the gear icon (bottom-left):
1. Click the gear icon
2. On Adventure pages, see "🎮 Adventure Audio"
3. Toggle "Voice Narration" on/off
4. Settings persist across sessions

## API Reference

### TextToSpeechManager Methods

#### `speak(text, characterName, onEnd)`
Speaks the given text with character-specific voice settings.
- **text**: String to speak
- **characterName**: Character name (Adventurer, Wizard, Commawidow, etc.)
- **onEnd**: Optional callback when speech completes

#### `stop()`
Stops any ongoing speech immediately.

#### `pause()`
Pauses current speech (can be resumed).

#### `resume()`
Resumes paused speech.

#### `setEnabled(enabled)`
Enable or disable TTS globally.

#### `isEnabled()`
Returns whether TTS is currently enabled.

#### `isSpeaking()`
Returns whether TTS is currently speaking.

#### `testVoice(characterName)`
Plays a test phrase for the specified character.

## Browser Compatibility

The TTS system uses the Web Speech API, which is supported in:
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ✅ Firefox (partial support)
- ⚠️ Opera (partial support)

## Best Practices

1. **Always stop speech** when advancing dialogue or changing phases
2. **Map character names** consistently (e.g., "User" → "Adventurer")
3. **Clean up on unmount** to prevent memory leaks
4. **Test with different browsers** to ensure compatibility
5. **Provide visual feedback** when TTS is speaking (optional)

## Troubleshooting

### Speech not working?
- Check if TTS is enabled in settings
- Verify browser supports Web Speech API
- Check browser console for errors
- Ensure voices are loaded (may take a moment on first load)

### Wrong voice for character?
- Voice selection depends on available system voices
- Different operating systems have different voices
- The system automatically falls back to available voices

### Speech cuts off?
- Ensure `TextToSpeechManager.stop()` is called before new speech
- Check that useEffect cleanup is properly implemented

## Example: Complete Integration

```javascript
import React, { useState, useEffect } from 'react';
import TextToSpeechManager from '../../sound/TextToSpeechManager';

const JungleLushLevel = () => {
  const [phase, setPhase] = useState('dialogue');
  const [dialogueIdx, setDialogueIdx] = useState(0);

  const dialogueSequence = [
    { speaker: "Wizard", text: "Welcome to the jungle." },
    { speaker: "User", text: "I'm ready for this challenge!" },
    { speaker: "Commawidow", text: "You dare enter my domain?" }
  ];

  // TTS for dialogue
  useEffect(() => {
    if (phase === 'dialogue' && dialogueSequence[dialogueIdx]) {
      const dialogue = dialogueSequence[dialogueIdx];
      const speaker = dialogue.speaker === 'User' ? 'Adventurer' : dialogue.speaker;
      TextToSpeechManager.speak(dialogue.text, speaker);
    }
    return () => TextToSpeechManager.stop();
  }, [dialogueIdx, phase]);

  const handleDialogueClick = () => {
    TextToSpeechManager.stop();
    if (dialogueIdx < dialogueSequence.length - 1) {
      setDialogueIdx(dialogueIdx + 1);
    } else {
      setPhase('battle');
    }
  };

  return (
    // Your JSX here
  );
};
```

## Files Modified/Created

- ✅ **Created**: `src/sound/TextToSpeechManager.js`
- ✅ **Modified**: `src/components/SiteAudioControls.jsx` (added TTS toggle)
- ✅ **Modified**: `src/Adventure/island1(junglelush)/JungleLushLevel1.jsx` (TTS integration example)

## Next Steps

To add TTS to remaining levels:
1. Follow Steps 1-4 above for each level file
2. Test with different character dialogues
3. Adjust voice profiles if needed (in TextToSpeechManager.js)
4. Consider adding visual indicators for when TTS is speaking (optional enhancement)
