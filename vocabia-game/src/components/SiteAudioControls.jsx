// src/components/SiteAudioControls.jsx
// Floating audio control panel for the whole site (non-FPOW)

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  IconButton,
  Slider,
  Paper,
  Tooltip,
  Collapse,
  Typography,
  Divider,
  Button
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  MusicNote as MusicNoteIcon,
  MusicOff as MusicOffIcon,
  GraphicEq as GraphicEqIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  VoiceOverOff as VoiceOverOffIcon
} from '@mui/icons-material';
import MainAudioManager from '../sound/MainAudioManager';
import AdventureAudioManager from '../sound/AdventureAudioManager';
import TextToSpeechManager from '../sound/TextToSpeechManager';
import AudioUtils from '../sound/AudioUtils';

const SiteAudioControls = () => {
  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(MainAudioManager.isBgmEnabled());
  const [effectsEnabled, setEffectsEnabled] = useState(MainAudioManager.areEffectsEnabled());
  const [bgmVolume, setBgmVolume] = useState(MainAudioManager.getBgmVolume());
  const [effectsVolume, setEffectsVolume] = useState(MainAudioManager.getEffectsVolume());
  
  // Adventure audio states
  const [adventureBgmEnabled, setAdventureBgmEnabled] = useState(AdventureAudioManager.isBgmEnabled());
  const [adventureBgmVolume, setAdventureBgmVolume] = useState(AdventureAudioManager.getBgmVolume());
  
  // TTS state
  const [ttsEnabled, setTtsEnabled] = useState(TextToSpeechManager.isEnabled());

  // Compute after hooks to avoid conditional hook calls
  const isFPOW = /\/4pic1word(\/|$)/.test(location.pathname || '');
  const isAdventure = (
    location.pathname === '/map' ||
    location.pathname.startsWith('/adventure') ||
    location.pathname.startsWith('/jungle-lush') ||
    location.pathname.startsWith('/waterside-shores') ||
    location.pathname.startsWith('/shadow-isles') ||
    location.pathname === '/tutorial'
  );

  // Keep UI synced with manager values
  useEffect(() => {
    const id = setInterval(() => {
      setBgmEnabled(MainAudioManager.isBgmEnabled());
      setEffectsEnabled(MainAudioManager.areEffectsEnabled());
      setBgmVolume(MainAudioManager.getBgmVolume());
      setEffectsVolume(MainAudioManager.getEffectsVolume());
      
      // Sync Adventure audio states
      setAdventureBgmEnabled(AdventureAudioManager.isBgmEnabled());
      setAdventureBgmVolume(AdventureAudioManager.getBgmVolume());
      
      // Sync TTS state
      setTtsEnabled(TextToSpeechManager.isEnabled());
    }, 500);
    return () => clearInterval(id);
  }, []);

  const handleToggleBgm = () => {
    const newState = MainAudioManager.toggleBgm();
    setBgmEnabled(newState);
    
    // If muting, force stop ALL audio to ensure nothing keeps playing
    if (!newState) {
      console.log('[SiteAudioControls] Muting - force stopping ALL audio');
      AudioUtils.forceStopAllAudio();
      // Also update Adventure state to reflect mute
      setAdventureBgmEnabled(false);
    }
  };

  const handleToggleEffects = () => {
    const newState = MainAudioManager.toggleEffects();
    setEffectsEnabled(newState);
  };

  const handleBgmVolumeChange = (e, v) => {
    MainAudioManager.setBgmVolume(v);
    setBgmVolume(v);
    // If volume is set to 0, effectively mute
    if (v === 0 && bgmEnabled) {
      MainAudioManager.setBgmEnabled(false);
      setBgmEnabled(false);
    } else if (v > 0 && !bgmEnabled) {
      MainAudioManager.setBgmEnabled(true);
      setBgmEnabled(true);
    }
  };

  const handleEffectsVolumeChange = (e, v) => {
    MainAudioManager.setEffectsVolume(v);
    setEffectsVolume(v);
  };

  // Adventure audio handlers
  const handleToggleAdventureBgm = () => {
    const newState = !adventureBgmEnabled;
    AdventureAudioManager.setBgmEnabled(newState);
    setAdventureBgmEnabled(newState);
    
    // If muting, force stop ALL audio to ensure nothing keeps playing
    if (!newState) {
      console.log('[SiteAudioControls] Muting Adventure - force stopping ALL audio');
      AudioUtils.forceStopAllAudio();
      // Also update Main state to reflect mute
      setBgmEnabled(false);
    }
  };

  const handleAdventureBgmVolumeChange = (e, v) => {
    AdventureAudioManager.setBgmVolume(v);
    setAdventureBgmVolume(v);
    // If volume is set to 0, effectively mute
    if (v === 0 && adventureBgmEnabled) {
      AdventureAudioManager.setBgmEnabled(false);
      setAdventureBgmEnabled(false);
    } else if (v > 0 && !adventureBgmEnabled) {
      AdventureAudioManager.setBgmEnabled(true);
      setAdventureBgmEnabled(true);
    }
  };

  // TTS handler
  const handleToggleTts = () => {
    const newState = !ttsEnabled;
    TextToSpeechManager.setEnabled(newState);
    setTtsEnabled(newState);
  };

  const handleTogglePanel = () => setIsExpanded(prev => !prev);

  // Debug function to check audio status
  const handleDebugAudio = () => {
    console.log('=== AUDIO DEBUG ===');
    AudioUtils.getAudioStatus();
    AudioUtils.getActiveAudioManager();
    console.log('UI States:', {
      bgmEnabled,
      adventureBgmEnabled,
      bgmVolume,
      adventureBgmVolume
    });
    console.log('===================');
  };

  // After hooks have been declared, it's safe to conditionally render nothing on FPOW routes
  if (isFPOW) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Collapse in={isExpanded} timeout={300}>
        <Paper elevation={8} sx={{ p: 2, mb: 1, background: 'linear-gradient(135deg, rgba(24,24,27,0.95) 0%, rgba(39,39,42,0.95) 100%)', color: 'white', borderRadius: 3, minWidth: 280, border: '1px solid rgba(255,255,255,0.12)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {isAdventure ? '🎮 Adventure Audio' : '🎧 Site Audio'}
            </Typography>
            <IconButton size="small" onClick={handleTogglePanel} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {isAdventure ? (
            // Adventure Audio Controls
            <>
              {/* Adventure Background Music */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton onClick={handleToggleAdventureBgm} size="small" sx={{ color: adventureBgmEnabled ? '#4CAF50' : '#f44336', mr: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    {adventureBgmEnabled ? <MusicNoteIcon /> : <MusicOffIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>Adventure Music</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                  <VolumeOffIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                  <Slider value={adventureBgmVolume} onChange={handleAdventureBgmVolumeChange} min={0} max={1} step={0.1} disabled={!adventureBgmEnabled} size="small" sx={{ flex: 1, mx: 1 }}/>
                  <VolumeUpIcon sx={{ fontSize: 16, ml: 1, opacity: 0.7 }} />
                </Box>
              </Box>

              <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />

              {/* Sound Effects */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton onClick={handleToggleEffects} size="small" sx={{ color: effectsEnabled ? '#2196F3' : '#f44336', mr: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    <GraphicEqIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>Sound Effects</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                  <VolumeOffIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                  <Slider value={effectsVolume} onChange={handleEffectsVolumeChange} min={0} max={1} step={0.1} disabled={!effectsEnabled} size="small" sx={{ flex: 1, mx: 1 }}/>
                  <VolumeUpIcon sx={{ fontSize: 16, ml: 1, opacity: 0.7 }} />
                </Box>
              </Box>

              <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />

              {/* Text-to-Speech */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton onClick={handleToggleTts} size="small" sx={{ color: ttsEnabled ? '#FF9800' : '#f44336', mr: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    {ttsEnabled ? <RecordVoiceOverIcon /> : <VoiceOverOffIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>Voice Narration</Typography>
                </Box>
                <Typography variant="caption" sx={{ pl: 5, opacity: 0.7, display: 'block' }}>
                  Dialogue text-to-speech
                </Typography>
              </Box>
              
              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
                  <Button
                    size="small"
                    onClick={handleDebugAudio}
                    sx={{ color: 'orange', fontSize: '0.7rem' }}
                  >
                    🐛 Debug Audio
                  </Button>
                </Box>
              )}
            </>
          ) : (
            // Site Audio Controls
            <>
              {/* Background Music */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton onClick={handleToggleBgm} size="small" sx={{ color: bgmEnabled ? '#4CAF50' : '#f44336', mr: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    {bgmEnabled ? <MusicNoteIcon /> : <MusicOffIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>Background Music</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                  <VolumeOffIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                  <Slider value={bgmVolume} onChange={handleBgmVolumeChange} min={0} max={1} step={0.1} disabled={!bgmEnabled} size="small" sx={{ flex: 1, mx: 1 }}/>
                  <VolumeUpIcon sx={{ fontSize: 16, ml: 1, opacity: 0.7 }} />
                </Box>
              </Box>

              <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />

              {/* Click Sound */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton onClick={handleToggleEffects} size="small" sx={{ color: effectsEnabled ? '#2196F3' : '#f44336', mr: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    <GraphicEqIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>Click Sounds</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                  <VolumeOffIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                  <Slider value={effectsVolume} onChange={handleEffectsVolumeChange} min={0} max={1} step={0.1} disabled={!effectsEnabled} size="small" sx={{ flex: 1, mx: 1 }}/>
                  <VolumeUpIcon sx={{ fontSize: 16, ml: 1, opacity: 0.7 }} />
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Collapse>

      <Tooltip title={isExpanded ? 'Close Audio Controls' : (isAdventure ? 'Open Adventure Audio' : 'Open Site Audio')} placement="right">
        <IconButton onClick={handleTogglePanel} sx={{ backgroundColor: 'rgba(24,24,27,0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', width: 56, height: 56, '&:hover': { backgroundColor: 'rgba(39,39,42,0.9)', transform: 'scale(1.08)' } }}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SiteAudioControls;
