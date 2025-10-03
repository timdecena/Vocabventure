// src/sound/AdventureAudioControls.jsx
// Adventure-specific audio controls component

import React, { useState, useEffect } from 'react';
import { Box, IconButton, Slider, Tooltip, Paper } from '@mui/material';
import { VolumeUp, VolumeOff, MusicNote, MusicOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AdventureAudioManager from './AdventureAudioManager';
import MainAudioManager from './MainAudioManager';

const ControlsContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  padding: '12px 16px',
  background: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: '280px',
}));

const VolumeSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: '#4CAF50',
  '& .MuiSlider-thumb': {
    backgroundColor: '#4CAF50',
    '&:hover': {
      boxShadow: '0px 0px 0px 8px rgba(76, 175, 80, 0.16)',
    },
  },
  '& .MuiSlider-track': {
    backgroundColor: '#4CAF50',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&.active': {
    color: '#4CAF50',
  },
}));

const AdventureAudioControls = () => {
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [bgmVolume, setBgmVolume] = useState(50);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(50);

  // Load settings on mount
  useEffect(() => {
    setBgmEnabled(AdventureAudioManager.isBgmEnabled());
    setBgmVolume(Math.round(AdventureAudioManager.getBgmVolume() * 100));
    setSfxEnabled(MainAudioManager.isSfxEnabled());
    setSfxVolume(Math.round(MainAudioManager.getSfxVolume() * 100));
  }, []);

  const handleBgmToggle = () => {
    const newEnabled = !bgmEnabled;
    setBgmEnabled(newEnabled);
    AdventureAudioManager.setBgmEnabled(newEnabled);
  };

  const handleBgmVolumeChange = (event, newValue) => {
    setBgmVolume(newValue);
    AdventureAudioManager.setBgmVolume(newValue / 100);
  };

  const handleSfxToggle = () => {
    const newEnabled = !sfxEnabled;
    setSfxEnabled(newEnabled);
    MainAudioManager.setSfxEnabled(newEnabled);
  };

  const handleSfxVolumeChange = (event, newValue) => {
    setSfxVolume(newValue);
    MainAudioManager.setSfxVolume(newValue / 100);
  };

  return (
    <ControlsContainer elevation={8}>
      {/* Adventure BGM Controls */}
      <VolumeSection>
        <Tooltip title={bgmEnabled ? "Mute Adventure Music" : "Enable Adventure Music"}>
          <ControlButton 
            onClick={handleBgmToggle}
            className={bgmEnabled ? 'active' : ''}
            size="small"
          >
            {bgmEnabled ? <MusicNote /> : <MusicOff />}
          </ControlButton>
        </Tooltip>
        <StyledSlider
          value={bgmEnabled ? bgmVolume : 0}
          onChange={handleBgmVolumeChange}
          disabled={!bgmEnabled}
          min={0}
          max={100}
          size="small"
          sx={{ width: '80px' }}
        />
      </VolumeSection>

      {/* SFX Controls */}
      <VolumeSection>
        <Tooltip title={sfxEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}>
          <ControlButton 
            onClick={handleSfxToggle}
            className={sfxEnabled ? 'active' : ''}
            size="small"
          >
            {sfxEnabled ? <VolumeUp /> : <VolumeOff />}
          </ControlButton>
        </Tooltip>
        <StyledSlider
          value={sfxEnabled ? sfxVolume : 0}
          onChange={handleSfxVolumeChange}
          disabled={!sfxEnabled}
          min={0}
          max={100}
          size="small"
          sx={{ width: '80px' }}
        />
      </VolumeSection>
    </ControlsContainer>
  );
};

export default AdventureAudioControls;
