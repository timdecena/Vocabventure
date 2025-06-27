import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Character Assets - using the same as JungleLushLevel2
// Wizard Animation Frames
import WizardIdle1 from '../../AdventureAssets/Wizard/Idle_1.png';
import WizardIdle2 from '../../AdventureAssets/Wizard/Idle_2.png';

// Adventurer Animation Frames
import SoldierIdle1 from '../../AdventureAssets/Adventurer/Soldier-Idle_1.png';
import SoldierIdle2 from '../../AdventureAssets/Adventurer/Soldier-Idle_2.png';
import SoldierIdle3 from '../../AdventureAssets/Adventurer/Soldier-Idle_3.png';
import SoldierIdle4 from '../../AdventureAssets/Adventurer/Soldier-Idle_4.png';
import SoldierIdle5 from '../../AdventureAssets/Adventurer/Soldier-Idle_5.png';
import SoldierIdle6 from '../../AdventureAssets/Adventurer/Soldier-Idle_6.png';

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("https://static.vecteezy.com/system/resources/previews/033/875/190/non_2x/village-room-inside-poor-room-interior-old-cottage-illustration-free-vector.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
}));

// 🎯 CHARACTER POSITIONING CONTROLS - ADJUST THESE VALUES
const CHARACTER_POSITIONS = {
  // ⭐ USER/ADVENTURER POSITIONING
  USER_LEFT: '200px',        // 🔧 Distance from left edge
  USER_BOTTOM: '-100px',       // 🔧 Distance from bottom
  
  // ⭐ WIZARD POSITIONING  
  WIZARD_LEFT: '600px',      // 🔧 Distance from left edge
  WIZARD_BOTTOM: '-20px',     // 🔧 Distance from bottom
  
  // ⭐ SPRITES CONTAINER POSITIONING
  SPRITES_BOTTOM: '200px',   // 🔧 Distance from bottom for entire container
};

const SpritesRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '900px',
  position: 'absolute',
  bottom: CHARACTER_POSITIONS.SPRITES_BOTTOM, // 🎯 ADJUST THIS
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  height: '300px', // More room for larger sprites
}));

// Animated Wizard Component with idle cycling (same as JungleLushLevel2)
const WizardSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2);
    }, 1000); // Switch frames every 1 second
    
    return () => clearInterval(interval);
  }, []);

  const WizardImg = styled('img')({
    width: '180px', // Perfect size matching JungleLushLevel2
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    position: 'absolute',
    left: CHARACTER_POSITIONS.WIZARD_LEFT,  // 🎯 ADJUST THIS
    bottom: CHARACTER_POSITIONS.WIZARD_BOTTOM, // 🎯 ADJUST THIS
    zIndex: 4,
    transform: 'scaleX(-1)',
  });

  return <WizardImg src={currentFrame === 0 ? WizardIdle1 : WizardIdle2} {...props} />;
};

// Animated Adventurer Component with idle cycling (same as JungleLushLevel2)
const AdventurerSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 6); // Cycle through 6 frames
    }, 800); // Frame speed
    
    return () => clearInterval(interval);
  }, []);

  const getAdventurerFrame = () => {
    switch (currentFrame) {
      case 0: return SoldierIdle1;
      case 1: return SoldierIdle2;
      case 2: return SoldierIdle3;
      case 3: return SoldierIdle4;
      case 4: return SoldierIdle5;
      case 5: return SoldierIdle6;
      default: return SoldierIdle1;
    }
  };

  const AdventurerImg = styled('img')({
    width: '280px', // Bigger to match with wizard (same as JungleLushLevel2)
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    position: 'absolute',
    left: CHARACTER_POSITIONS.USER_LEFT,     // 🎯 ADJUST THIS
    bottom: CHARACTER_POSITIONS.USER_BOTTOM, // 🎯 ADJUST THIS
    zIndex: 4,
  });

  return <AdventurerImg src={getAdventurerFrame()} {...props} />;
};

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 0,
  transform: 'translateX(-50%)',
  width: '800px',
  maxWidth: '90vw',
  minWidth: '320px',
  height: '160px', // Fixed height to match JungleLushLevel2
  padding: theme.spacing(3, 4),
  background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a6 50%, #dcc48a 100%)',
  color: '#3a2a1a',
  textAlign: 'left',
  borderRadius: '20px 20px 0 0',
  zIndex: 10,
  boxShadow: '0 -4px 24px 4px rgba(0,0,0,0.25), 0 -8px 32px 2px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.6)',
  border: '3px solid #b8956f',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  boxSizing: 'border-box',
  overflow: 'visible',
  backdropFilter: 'blur(2px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
    borderRadius: '20px 20px 0 0',
    pointerEvents: 'none',
  },
}));

const NameTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-25px',
  left: '24px',
  background: 'linear-gradient(145deg, #d4a574 0%, #c19956 50%, #a8834a 100%)',
  color: '#2c1810',
  borderRadius: '18px',
  padding: '8px 20px',
  fontWeight: 800,
  fontSize: '1rem',
  boxShadow: '0 4px 16px rgba(168,131,74,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
  border: '3px solid #9a7a4a',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  zIndex: 100,
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(255,255,255,0.4)',
  minWidth: '80px',
  textAlign: 'center',
  display: 'block',
  visibility: 'visible',
}));

const DialogueText = styled(Typography)(({ theme }) => ({
  marginTop: 18,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1.2rem',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '0.3px',
  color: '#2c1810',
  textShadow: '0 1px 1px rgba(255,255,255,0.3)',
  zIndex: 12,
  position: 'relative',
}));

const ClickPrompt = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '16px',
  right: '32px',
  color: '#2e7d32',
  fontSize: '1rem',
  fontWeight: 700,
  opacity: 0.9,
  pointerEvents: 'none',
  zIndex: 16,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  letterSpacing: '0.3px',
  textShadow: '0 1px 2px rgba(255,255,255,0.5)',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { opacity: 0.7 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.7 },
  },
}));

const messages = [
  "Ah, you're awake! Welcome, traveler.",
  "I am Eldrin, the last sage of Vocabia.",
  "Darkness has stolen our words and wisdom.",
  "You are the one from the prophecy. Only you can help us.",
  "Come, there's no time to waste. The village is under attack!"
];

const WizardScene = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const idleTimeout = useRef(null);

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    return () => clearTimeout(idleTimeout.current);
  }, [currentMessageIndex]);

  const handleNext = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SceneContainer>
      <SpritesRow>
        <AdventurerSprite />
        <WizardSprite />
      </SpritesRow>
      <DialogueBox elevation={6} onClick={handleNext} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
        <NameTag>Eldrin</NameTag>
        <DialogueText variant="h6" gutterBottom>
          {messages[currentMessageIndex]}
        </DialogueText>
        {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
      </DialogueBox>
    </SceneContainer>
  );
};

export default WizardScene; 