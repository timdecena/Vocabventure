// src/components/AudioControls.jsx
// Floating audio control panel for FPOW

import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Paper,
  Tooltip,
  Collapse,
  Typography,
  Divider
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  MusicNote as MusicNoteIcon,
  MusicOff as MusicOffIcon,
  GraphicEq as GraphicEqIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import SoundManager from '../sound/SoundManager';

const AudioControls = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(SoundManager.isBgmEnabled());
  const [effectsEnabled, setEffectsEnabled] = useState(SoundManager.areEffectsEnabled());
  const [bgmVolume, setBgmVolume] = useState(SoundManager.getBgmVolume());
  const [effectsVolume, setEffectsVolume] = useState(SoundManager.getEffectsVolume());

  // Update state when SoundManager changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBgmEnabled(SoundManager.isBgmEnabled());
      setEffectsEnabled(SoundManager.areEffectsEnabled());
      setBgmVolume(SoundManager.getBgmVolume());
      setEffectsVolume(SoundManager.getEffectsVolume());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleToggleBgm = () => {
    const newState = SoundManager.toggleBgm();
    setBgmEnabled(newState);
  };

  const handleToggleEffects = () => {
    const newState = SoundManager.toggleEffects();
    setEffectsEnabled(newState);
  };

  const handleBgmVolumeChange = (event, newValue) => {
    SoundManager.setBgmVolume(newValue);
    setBgmVolume(newValue);
  };

  const handleEffectsVolumeChange = (event, newValue) => {
    SoundManager.setEffectsVolume(newValue);
    setEffectsVolume(newValue);
  };

  const handleTogglePanel = () => {
    setIsExpanded(!isExpanded);
    // Play a button sound when opening/closing
    if (!isExpanded) {
      SoundManager.playEffect('button_press');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      {/* Expanded Control Panel */}
      <Collapse in={isExpanded} timeout={300}>
        <Paper
          elevation={8}
          sx={{
            p: 2,
            mb: 1,
            background: 'linear-gradient(135deg, rgba(25, 32, 72, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            minWidth: 280,
            color: 'white'
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              🎵 Audio Controls
            </Typography>
            <IconButton
              size="small"
              onClick={handleTogglePanel}
              sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Background Music Controls */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton
                onClick={handleToggleBgm}
                size="small"
                sx={{ 
                  color: bgmEnabled ? '#4CAF50' : '#f44336',
                  mr: 1,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {bgmEnabled ? <MusicNoteIcon /> : <MusicOffIcon />}
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                Background Music
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
              <VolumeOffIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
              <Slider
                value={bgmVolume}
                onChange={handleBgmVolumeChange}
                min={0}
                max={1}
                step={0.1}
                disabled={!bgmEnabled}
                size="small"
                sx={{
                  flex: 1,
                  mx: 1,
                  '& .MuiSlider-thumb': {
                    backgroundColor: bgmEnabled ? '#4CAF50' : '#666'
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: bgmEnabled ? '#4CAF50' : '#666'
                  }
                }}
              />
              <VolumeUpIcon sx={{ fontSize: 16, ml: 1, opacity: 0.7 }} />
            </Box>
          </Box>

          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />

          {/* Sound Effects Controls */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton
                onClick={handleToggleEffects}
                size="small"
                sx={{ 
                  color: effectsEnabled ? '#2196F3' : '#f44336',
                  mr: 1,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <GraphicEqIcon />
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                Sound Effects
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
              <VolumeOffIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
              <Slider
                value={effectsVolume}
                onChange={handleEffectsVolumeChange}
                min={0}
                max={1}
                step={0.1}
                disabled={!effectsEnabled}
                size="small"
                sx={{
                  flex: 1,
                  mx: 1,
                  '& .MuiSlider-thumb': {
                    backgroundColor: effectsEnabled ? '#2196F3' : '#666'
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: effectsEnabled ? '#2196F3' : '#666'
                  }
                }}
              />
              <VolumeUpIcon sx={{ fontSize: 16, ml: 1, opacity: 0.7 }} />
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Floating Toggle Button */}
      <Tooltip title={isExpanded ? "Close Audio Controls" : "Open Audio Controls"} placement="right">
        <IconButton
          onClick={handleTogglePanel}
          sx={{
            backgroundColor: 'rgba(25, 32, 72, 0.9)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(42, 82, 152, 0.9)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease',
            width: 56,
            height: 56
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default AudioControls;
