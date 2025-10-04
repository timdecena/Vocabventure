# Text-to-Speech Troubleshooting Guide

## Common Issue: TTS Not Working After Git Pull

If your coworker pulled the latest code from GitHub and TTS isn't working, follow these steps:

### **Quick Fix Steps**

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for `[TTS]` messages in the console
   - Check if voices are loading: `[TTS] Loaded X voices`

2. **Enable TTS in Settings**
   - Click the gear icon (bottom-left)
   - Make sure "Voice Narration" is toggled ON (orange icon)
   - The toggle should show a microphone icon when enabled

3. **Clear Browser Cache**
   ```
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cached files and site data
   - Reload the page
   ```

4. **Check localStorage**
   - Open Console (F12)
   - Type: `localStorage.getItem('tts_settings')`
   - Should show: `{"enabled":true}`
   - If it shows `{"enabled":false}`, run: `localStorage.setItem('tts_settings', '{"enabled":true}')`

### **Diagnostic Commands**

Open browser console and run these commands:

```javascript
// Check TTS status
import('../../sound/TextToSpeechManager').then(m => {
  console.log(m.default.getDiagnostics());
});

// Test TTS manually
import('../../sound/TextToSpeechManager').then(m => {
  m.default.testVoice('Adventurer');
});

// Check if voices are available
console.log(window.speechSynthesis.getVoices());
```

### **Browser-Specific Issues**

#### **Chrome/Edge**
- TTS should work out of the box
- If not working, check if site permissions allow audio
- Go to: `chrome://settings/content/sound`

#### **Firefox**
- May need to enable TTS in `about:config`
- Search for: `media.webspeech.synth.enabled`
- Set to: `true`

#### **Safari**
- TTS works well on macOS
- May need to grant microphone permissions (even though TTS doesn't use mic)

### **Common Problems & Solutions**

#### **Problem 1: "Voices not loaded yet"**
**Solution**: 
- Wait 1-2 seconds after page load
- Voices load asynchronously
- The system will retry automatically

#### **Problem 2: No sound but console shows TTS is speaking**
**Solution**:
- Check system volume
- Check browser tab isn't muted (look for speaker icon on tab)
- Check if other audio (BGM, SFX) is working

#### **Problem 3: TTS works on some levels but not others**
**Solution**:
- Check console for errors
- Verify all level files imported TextToSpeechManager
- Check if dialogue phase names match in useEffect

#### **Problem 4: Wrong voice or robotic sound**
**Solution**:
- System is using fallback voice
- Install better TTS voices on the system
- Windows: Settings → Time & Language → Speech
- Mac: System Preferences → Accessibility → Speech

### **Manual Testing**

To test TTS manually in any level:

1. Open browser console (F12)
2. Run this command:
```javascript
// Import and test
import('../../sound/TextToSpeechManager').then(m => {
  const TTS = m.default;
  console.log('TTS Enabled:', TTS.isEnabled());
  console.log('TTS Diagnostics:', TTS.getDiagnostics());
  TTS.speak('Hello, this is a test!', 'Adventurer');
});
```

### **For Developers**

#### **Check TTS Integration in Level Files**

Each level should have:

1. **Import Statement**:
```javascript
import TextToSpeechManager from '../../sound/TextToSpeechManager';
```

2. **useEffect for Dialogue**:
```javascript
useEffect(() => {
  if (phase === 'dialogue' && dialogueSequence[dialogueIdx]) {
    const dialogue = dialogueSequence[dialogueIdx];
    const speaker = dialogue.speaker === 'User' ? 'Adventurer' : dialogue.speaker;
    TextToSpeechManager.speak(dialogue.text, speaker);
  }
  return () => TextToSpeechManager.stop();
}, [dialogueIdx, phase]);
```

3. **Stop TTS on Click**:
```javascript
const handleDialogueClick = () => {
  TextToSpeechManager.stop();
  // ... rest of logic
};
```

### **Verification Checklist**

- [ ] TTS toggle is ON in gear icon settings
- [ ] Browser console shows `[TTS] Loaded X voices` (X > 0)
- [ ] No errors in console when dialogue appears
- [ ] System volume is up
- [ ] Browser tab is not muted
- [ ] Other audio (BGM, SFX) is working
- [ ] Tested in different browser (Chrome, Firefox, Edge)

### **Still Not Working?**

1. **Try a different browser** - Chrome/Edge usually have best TTS support
2. **Check system TTS voices**:
   - Windows: Run `narrator` to test system TTS
   - Mac: System Preferences → Accessibility → Speech → Test
3. **Restart browser** completely (close all windows)
4. **Clear all site data** and reload
5. **Check if HTTPS is enabled** (some browsers require secure context for TTS)

### **Contact Developer**

If none of these solutions work, provide:
- Browser name and version
- Operating system
- Console errors (screenshot)
- Output of `TextToSpeechManager.getDiagnostics()`
- Whether other audio features work (BGM, SFX)

## Technical Notes

### **How TTS Loads**

1. Page loads → TextToSpeechManager initializes
2. Attempts to load voices immediately
3. Sets up `onvoiceschanged` event listener
4. Retries after 100ms if no voices
5. Retries after 500ms if still no voices
6. When dialogue appears, checks if voices loaded
7. If not loaded, attempts one more time with 200ms delay

### **Voice Selection Priority**

For each character, the system tries to find voices in this order:
1. Preferred voice names (Google, Microsoft, Apple)
2. First available English voice
3. First available voice (any language)

### **Logging**

All TTS operations log to console with `[TTS]` prefix:
- `[TTS] Loaded X voices` - Voices successfully loaded
- `[TTS] Speaking as X with voice: Y` - Speaking started
- `[TTS] Skipped - enabled: false` - TTS is disabled
- `[TTS] Voices not loaded yet` - Waiting for voices
- `[TTS] Speech error` - Error occurred during speech
