import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Grid, TextField, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// Character Assets - using the same as JungleLushLevel2
// Adventurer Animation Frames
import SoldierIdle1 from '../../AdventureAssets/Adventurer/Soldier-Idle_1.png';
import SoldierIdle2 from '../../AdventureAssets/Adventurer/Soldier-Idle_2.png';
import SoldierIdle3 from '../../AdventureAssets/Adventurer/Soldier-Idle_3.png';
import SoldierIdle4 from '../../AdventureAssets/Adventurer/Soldier-Idle_4.png';
import SoldierIdle5 from '../../AdventureAssets/Adventurer/Soldier-Idle_5.png';
import SoldierIdle6 from '../../AdventureAssets/Adventurer/Soldier-Idle_6.png';
import SoldierAttack1 from '../../AdventureAssets/Adventurer/Soldier-Attack02_1.png';
import SoldierAttack2 from '../../AdventureAssets/Adventurer/Soldier-Attack02_2.png';
import SoldierAttack3 from '../../AdventureAssets/Adventurer/Soldier-Attack02_3.png';
import SoldierAttack4 from '../../AdventureAssets/Adventurer/Soldier-Attack02_4.png';
import SoldierAttack5 from '../../AdventureAssets/Adventurer/Soldier-Attack02_5.png';
import SoldierAttack6 from '../../AdventureAssets/Adventurer/Soldier-Attack02_6.png';

// Orc Animation Frames
import OrcIdle1 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_1.png';
import OrcIdle2 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_2.png';
import OrcIdle3 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_3.png';
import OrcIdle4 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_4.png';
import OrcIdle5 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_5.png';
import OrcIdle6 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_6.png';
import OrcAttack1 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_1.png';
import OrcAttack2 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_2.png';
import OrcAttack3 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_3.png';
import OrcAttack4 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_4.png';
import OrcAttack5 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_5.png';
import OrcAttack6 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_6.png';
import OrcHurt1 from '../../AdventureAssets/Orc(Minion)/Orc-Hurt_1.png';
import OrcHurt2 from '../../AdventureAssets/Orc(Minion)/Orc-Hurt_2.png';
import OrcHurt3 from '../../AdventureAssets/Orc(Minion)/Orc-Hurt_3.png';
import OrcHurt4 from '../../AdventureAssets/Orc(Minion)/Orc-Hurt_4.png';
import OrcDeath1 from '../../AdventureAssets/Orc(Minion)/Orc-Death_1.png';
import OrcDeath2 from '../../AdventureAssets/Orc(Minion)/Orc-Death_2.png';
import OrcDeath3 from '../../AdventureAssets/Orc(Minion)/Orc-Death_3.png';
import OrcDeath4 from '../../AdventureAssets/Orc(Minion)/Orc-Death_4.png';

// 🎯 CHARACTER POSITIONING CONTROLS - ADJUST THESE VALUES
const CHARACTER_POSITIONS = {
  // ⭐ BATTLE STATE POSITIONING  
  ADVENTURER_LEFT: '35%',       // 🔧 Adventurer position from left
  ADVENTURER_BOTTOM: '-100px',     // 🔧 Adventurer distance from bottom
  ORC_RIGHT: '32%',            // 🔧 Orc position from right  
  ORC_BOTTOM: '-100px',           // 🔧 Orc distance from bottom
  
  // ⭐ SPRITES CONTAINER POSITIONING
  SPRITES_MARGIN_BOTTOM: '200px', // 🔧 Distance from bottom for sprites container
  SPRITES_HEIGHT: '300px',        // 🔧 Height of sprites container
};

const forestBg = "https://wallpapers.com/images/hd/cartoon-forest-background-1920-x-1080-3si03xbjuob5zkdp.jpg";

// Animation keyframes
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
`;
const hit = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;
const userFlash = keyframes`
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.2) sepia(1) saturate(10000%) hue-rotate(-50deg); }
`;
const monsterFlash = keyframes`
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.2) sepia(1) saturate(10000%) hue-rotate(180deg); }
`;

const BattleContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundImage: `url(${forestBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
  position: 'relative',
}));

const TopBar = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 30,
  padding: '18px 32px',
}));

const RightBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  minWidth: '260px',
  justifyContent: 'flex-end',
}));

// Updated Heart Icon Component with animations (same as JungleLushLevel2)
const HeartIcon = styled(Box)(({ theme, filled }) => ({
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  color: filled ? '#DC143C' : '#999',
  filter: filled ? 'drop-shadow(0 0 12px rgba(220, 20, 60, 0.8)) saturate(1.5)' : 'grayscale(100%) brightness(0.7)',
  transition: 'all 0.4s ease',
  animation: filled ? 'heartbeat 2s ease-in-out infinite' : 'none',
  '&::before': {
    content: '"❤️"',
    textShadow: filled ? '0 0 8px rgba(220, 20, 60, 0.6)' : 'none',
  },
  '@keyframes heartbeat': {
    '0%': { 
      transform: 'scale(1)',
      filter: 'drop-shadow(0 0 12px rgba(220, 20, 60, 0.8)) saturate(1.5)'
    },
    '50%': { 
      transform: 'scale(1.05)',
      filter: 'drop-shadow(0 0 16px rgba(220, 20, 60, 1)) saturate(1.8)'
    },
    '100%': { 
      transform: 'scale(1)',
      filter: 'drop-shadow(0 0 12px rgba(220, 20, 60, 0.8)) saturate(1.5)'
    }
  }
}));

const HeartsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
}));

const TopRightContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '24px',
  right: '24px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px',
  zIndex: 3000,
}));

// Updated Timer (same style as JungleLushLevel2)
const TimerBoxStyled = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, #fff9c4 0%, #f5e15b 50%, #e8d547 100%)',
  color: '#3a2a1a',
  borderRadius: '16px',
  padding: '8px 20px',
  fontWeight: 800,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1.1rem',
  boxShadow: '0 6px 16px rgba(212,165,116,0.4), 0 3px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
  border: '3px solid #d4a574',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '90px',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  letterSpacing: '0.5px',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'relative',
  minHeight: '400px', // Increased to accommodate characters
  paddingBottom: '140px', // Space for bottom bar
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  marginBottom: '160px', // Increased to show characters above bottom bar
  zIndex: 20,
  pointerEvents: 'none',
  minHeight: CHARACTER_POSITIONS.SPRITES_HEIGHT, // 🎯 ADJUST THIS
  position: 'relative',
}));

// Animated Adventurer Component with idle cycling and attack state (same as JungleLushLevel2)
const AdventurerSprite = ({ state = 'idle', isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 6); // Cycle through 6 frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6); // Attack has 6 frames too
      }
    }, 150); // Fast frame rate for smooth animation
    
    return () => clearInterval(interval);
  }, [state]);

  const getAdventurerFrame = () => {
    if (state === 'attack') {
      switch (currentFrame) {
        case 0: return SoldierAttack1;
        case 1: return SoldierAttack2;
        case 2: return SoldierAttack3;
        case 3: return SoldierAttack4;
        case 4: return SoldierAttack5;
        case 5: return SoldierAttack6;
        default: return SoldierAttack1;
      }
    } else {
      switch (currentFrame) {
        case 0: return SoldierIdle1;
        case 1: return SoldierIdle2;
        case 2: return SoldierIdle3;
        case 3: return SoldierIdle4;
        case 4: return SoldierIdle5;
        case 5: return SoldierIdle6;
        default: return SoldierIdle1;
      }
    }
  };

  const AdventurerImg = styled('img')({
    width: '280px', // Same as JungleLushLevel2
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    position: 'absolute',
    left: CHARACTER_POSITIONS.ADVENTURER_LEFT, // 🎯 ADJUST THIS
    bottom: CHARACTER_POSITIONS.ADVENTURER_BOTTOM, // 🎯 ADJUST THIS
    animation: isDamaged ? `${userFlash} 0.5s ease-in-out` : 'none',
    zIndex: 4,
  });

  return <AdventurerImg src={getAdventurerFrame()} {...props} />;
};

const OrcSprite = ({ state, isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 idle frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 attack frames
      } else if (state === 'hurt') {
        setCurrentFrame(prev => (prev + 1) % 4); // 4 hurt frames
      } else if (state === 'death') {
        setCurrentFrame(prev => Math.min(prev + 1, 3)); // 4 death frames, stop at last
      }
    }, state === 'death' ? 200 : 150); // Slower for death animation
    
    return () => clearInterval(interval);
  }, [state]);

  const getOrcFrame = () => {
    switch (state) {
      case 'attack':
        switch (currentFrame) {
          case 0: return OrcAttack1;
          case 1: return OrcAttack2;
          case 2: return OrcAttack3;
          case 3: return OrcAttack4;
          case 4: return OrcAttack5;
          case 5: return OrcAttack6;
          default: return OrcAttack1;
        }
      case 'hurt':
        switch (currentFrame) {
          case 0: return OrcHurt1;
          case 1: return OrcHurt2;
          case 2: return OrcHurt3;
          case 3: return OrcHurt4;
          default: return OrcHurt1;
        }
      case 'death':
        switch (currentFrame) {
          case 0: return OrcDeath1;
          case 1: return OrcDeath2;
          case 2: return OrcDeath3;
          case 3: return OrcDeath4;
          default: return OrcDeath4; // Stay on last frame
        }
      default: // 'idle'
        switch (currentFrame) {
          case 0: return OrcIdle1;
          case 1: return OrcIdle2;
          case 2: return OrcIdle3;
          case 3: return OrcIdle4;
          case 4: return OrcIdle5;
          case 5: return OrcIdle6;
          default: return OrcIdle1;
        }
    }
  };

  const OrcImg = styled('img')({
    width: '280px', // Same as JungleLushLevel2
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    position: 'absolute',
    right: CHARACTER_POSITIONS.ORC_RIGHT, // 🎯 ADJUST THIS
    bottom: CHARACTER_POSITIONS.ORC_BOTTOM, // 🎯 ADJUST THIS
    transform: 'scaleX(-1)', // Face adventurer
    animation: isDamaged ? `${monsterFlash} 0.5s ease-in-out` : 'none',
    zIndex: 4,
  });

  return <OrcImg src={getOrcFrame()} {...props} />;
};

const VS = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 900,
  color: '#fff',
  textShadow: '0 2px 8px #000',
  margin: '0 18px',
  zIndex: 22,
  pointerEvents: 'none',
  position: 'absolute',
  left: '50%',
  bottom: '300px',
  transform: 'translateX(-50%)',
}));

// HP Bar and Monster Name Components (from JungleLushLevel2)
const MonsterHPBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '180px',
  left: '60%',
  transform: 'translateX(-50%)',
  width: '120px',
  height: '12px',
  backgroundColor: '#333',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
}));

const MonsterHPFill = styled(Box)(({ hp }) => ({
  width: `${hp}%`,
  height: '100%',
  background: 'linear-gradient(90deg, #4caf50 60%, #b2ff59 100%)',
  transition: 'width 0.4s',
}));

const MonsterHPText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '135px',
  left: '60%',
  transform: 'translateX(-50%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textShadow: '0 2px 8px #000',
  zIndex: 10,
}));

const Ground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  bottom: '90px',
  width: '100%',
  height: '40px',
  background: 'linear-gradient(to top, #3e2e1a 80%, rgba(62,46,26,0.2) 100%)',
  zIndex: 2,
  borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px',
  boxShadow: '0 0 16px 2px rgba(0,0,0,0.25)',
}));

// Updated Bottom Bar with reduced height for character visibility
const BottomBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  background: 'linear-gradient(180deg, rgba(139,69,19,0.95) 0%, rgba(101,67,33,0.98) 50%, rgba(62,39,35,1) 100%)',
  minHeight: '140px', // Reduced height to show characters
  maxHeight: '45vh', // Limit maximum height
  padding: '20px 0 15px 0', // Reduced padding
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start', // Align to top for better space usage
  zIndex: 30,
  borderTopLeftRadius: '32px',
  borderTopRightRadius: '32px',
  boxShadow: '0 -4px 24px 4px rgba(0,0,0,0.4), 0 -8px 32px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  border: '2px solid rgba(139,69,19,0.8)',
  borderBottom: 'none',
  position: 'absolute',
  left: 0,
  bottom: 0,
  backdropFilter: 'blur(8px)',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
    borderRadius: '32px 32px 0 0',
    pointerEvents: 'none',
  },
}));

// Updated Question Text with reduced margins
const QuestionText = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.2rem', // Slightly smaller
  marginBottom: '16px', // Reduced margin
  textAlign: 'center',
  textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.1)',
  letterSpacing: '0.3px',
  lineHeight: 1.3, // Tighter line height
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  position: 'relative',
  zIndex: 12,
  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))',
}));

// Question container with audio button for spelling
const QuestionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  marginBottom: '16px',
  flexWrap: 'wrap',
}));

// Updated Choices Grid (same style as JungleLushLevel2)
const ChoicesGrid = styled(Box)(({ theme, count }) => ({
  width: count === 3 ? '580px' : '580px',
  maxWidth: '90vw',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: count === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
  gridTemplateRows: count === 3 ? '1fr' : '1fr 1fr',
  gap: '20px',
  justifyItems: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'center',
}));

// Updated Move Button (same style as JungleLushLevel2)
const MoveButton = styled(Button)(({ selected }) => ({
  width: '100%',
  minHeight: '68px',
  background: selected 
    ? 'linear-gradient(145deg, #fff9c4 0%, #f5e15b 50%, #e8d547 100%)' 
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
  color: selected ? '#8b4513' : '#2c3e50',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1.05rem',
  fontWeight: selected ? 700 : 600,
  border: selected 
    ? '3px solid #d4a574' 
    : '2px solid #dee2e6',
  borderRadius: '16px',
  boxShadow: selected 
    ? '0 8px 16px rgba(212,165,116,0.4), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)' 
    : '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
  textAlign: 'center',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 16px',
  position: 'relative',
  overflow: 'hidden',
  textTransform: 'none',
  letterSpacing: '0.3px',
  lineHeight: 1.3,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    border: '3px solid #d4a574',
    boxShadow: '0 8px 20px rgba(212,165,116,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
    background: 'linear-gradient(145deg, #fff9c4 0%, #f5e15b 30%, #e8d547 100%)',
    color: '#8b4513',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 4px 8px rgba(212,165,116,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
}));

const QuitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ff6b6b 0%, #ee5a52 50%, #d63031 100%)',
  color: '#fff',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1rem',
  fontWeight: 700,
  borderRadius: '16px',
  padding: '10px 20px',
  border: '3px solid #c23616',
  boxShadow: '0 6px 16px rgba(214,48,49,0.4), 0 3px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
  textTransform: 'none',
  letterSpacing: '0.5px',
  marginRight: 48,
  marginTop: 12,
  minWidth: '100px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(145deg, #ff5252 0%, #e53935 50%, #c62828 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(214,48,49,0.5), 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    border: '3px solid #b71c1c',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 4px 12px rgba(214,48,49,0.4), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
}));

// 4 Pics 1 Word Components - Left side layout
const FourPicsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-start',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  minHeight: '120px',
}));

const ImagesSection = styled(Box)(({ theme }) => ({
  flex: '0 0 320px', // Fixed width for 2x2 grid
  display: 'grid',
  gridTemplateColumns: '1fr 1fr', // 2 columns
  gridTemplateRows: '1fr 1fr', // 2 rows
  gap: '8px', // Gap between grid items
  height: 'auto',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GameplaySection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}));

const GameImage = styled('img')(({ theme }) => ({
  width: '150px', // Square dimensions for grid layout
  height: '100px', // Rectangular for better image display
  objectFit: 'cover',
  borderRadius: '12px',
  border: '3px solid #fff',
  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

// Removed LargeGameImage - using regular GameImage for all 3 images

const LetterBank = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'flex-start',
  marginBottom: '16px',
  minHeight: '60px',
  padding: '8px',
  background: 'rgba(0,0,0,0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.2)',
}));

const LetterTile = styled(Button)(({ used }) => ({
  width: '35px', // Reduced size
  height: '35px',
  minWidth: '35px',
  background: used ? '#ccc' : 'linear-gradient(145deg, #fff 0%, #f8f9fa 50%, #e9ecef 100%)',
  color: used ? '#666' : '#2c3e50',
  border: `2px solid ${used ? '#999' : '#dee2e6'}`,
  borderRadius: '8px',
  fontSize: '1.2rem',
  fontWeight: 700,
  cursor: used ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: used ? 'none' : 'scale(1.05)',
    background: used ? '#ccc' : 'linear-gradient(145deg, #fff9c4 0%, #f5e15b 50%, #e8d547 100%)',
  },
}));

const AnswerBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '6px',
  justifyContent: 'flex-start',
  marginBottom: '16px',
  minHeight: '50px',
  padding: '8px',
  background: 'rgba(255,255,255,0.15)',
  borderRadius: '10px',
  border: '2px solid rgba(255,255,255,0.3)',
  alignItems: 'center',
}));

const AnswerSlot = styled(Box)(({ filled, theme }) => ({
  width: '40px',
  height: '40px',
  minWidth: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: filled ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255,255,255,0.2)',
  border: `2px solid ${filled ? '#4CAF50' : '#fff'}`,
  borderRadius: '8px',
  color: filled ? '#fff' : '#ccc',
  fontSize: '1.2rem',
  fontWeight: 700,
  cursor: filled ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: filled ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.3)',
    transform: filled ? 'scale(1.05)' : 'none',
  },
}));

const SelectedLetter = styled(Button)(({ theme }) => ({
  width: '35px', // Reduced size
  height: '35px',
  minWidth: '35px',
  background: 'linear-gradient(145deg, #fff9c4 0%, #f5e15b 50%, #e8d547 100%)',
  color: '#8b4513',
  border: '2px solid #d4a574',
  borderRadius: '8px',
  fontSize: '1.2rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'linear-gradient(145deg, #ffeb3b 0%, #fdd835 50%, #f57f17 100%)',
  },
}));

// Spelling Components with compact layout
const SpellingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px', // Reduced gap
  width: '100%',
}));

const SpellingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  maxWidth: '600px',
  justifyContent: 'space-between',
}));

const DefinitionBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '8px', // Smaller radius
  padding: '12px 16px', // Reduced padding
  border: '2px solid rgba(255,255,255,0.3)',
  maxWidth: '400px', // Smaller width
  textAlign: 'center',
  flex: 1,
}));

const AudioButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)',
  color: '#fff',
  width: '45px', // Reduced size
  height: '45px',
  border: '2px solid #2e7d32', // Thinner border
  boxShadow: '0 3px 8px rgba(76,175,80,0.4)',
  flexShrink: 0,
  '&:hover': {
    background: 'linear-gradient(145deg, #66bb6a 0%, #4caf50 50%, #388e3c 100%)',
    transform: 'scale(1.05)',
  },
}));

const SpellingInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  maxWidth: '250px', // Limit width
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '8px', // Smaller radius
    fontSize: '1.1rem', // Smaller font
    fontWeight: 600,
    '& fieldset': {
      borderColor: '#d4a574',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#b8956f',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8b4513',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#8b4513',
    fontWeight: 600,
  },
  '& .MuiOutlinedInput-input': {
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#2c3e50',
    padding: '12px 14px', // Reduced padding
  },
}));

// Reading Comprehension Components with compact layout
const PassageBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '8px', // Smaller radius
  padding: '12px 16px', // Reduced padding
  border: '2px solid rgba(255,255,255,0.3)',
  marginBottom: '12px', // Reduced margin
  maxWidth: '500px', // Smaller width
  margin: '0 auto 12px auto',
}));

const DragItemsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px', // Reduced gap
  justifyContent: 'center',
  marginBottom: '12px', // Reduced margin
}));

const DragItem = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, #fff 0%, #f8f9fa 50%, #e9ecef 100%)',
  color: '#2c3e50',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '2px solid #dee2e6',
  cursor: 'grab',
  fontSize: '0.9rem',
  fontWeight: 600,
  maxWidth: '200px',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    background: 'linear-gradient(145deg, #fff9c4 0%, #f5e15b 50%, #e8d547 100%)',
    border: '2px solid #d4a574',
  },
  '&:active': {
    cursor: 'grabbing',
  },
}));

const DropZonesContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px', // Reduced gap
  maxWidth: '400px', // Smaller width
  margin: '0 auto',
}));

const DropZone = styled(Box)(({ dragOver, filled }) => ({
  minHeight: '60px', // Reduced height
  border: `2px dashed ${dragOver ? '#4CAF50' : filled ? '#2196F3' : '#fff'}`, // Thinner border
  borderRadius: '8px', // Smaller radius
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: dragOver ? 'rgba(76,175,80,0.1)' : filled ? 'rgba(33,150,243,0.1)' : 'rgba(255,255,255,0.05)',
  transition: 'all 0.3s ease',
  padding: '8px', // Reduced padding
  textAlign: 'center',
}));

const DropZoneLabel = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.1rem',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  marginBottom: '8px',
}));

// Submit Button positioned on the right
const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)',
  color: '#fff',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1rem', // Smaller font
  fontWeight: 700,
  borderRadius: '12px', // Smaller radius
  padding: '10px 24px', // Reduced padding
  border: '2px solid #2e7d32', // Thinner border
  boxShadow: '0 4px 12px rgba(76,175,80,0.4), 0 2px 6px rgba(0,0,0,0.2)',
  textTransform: 'none',
  letterSpacing: '0.5px',
  minWidth: '120px', // Smaller width
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'absolute',
  right: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  '&:hover': {
    background: 'linear-gradient(145deg, #66bb6a 0%, #4caf50 50%, #388e3c 100%)',
    transform: 'translateY(-50%) translateY(-2px)',
    boxShadow: '0 6px 16px rgba(76,175,80,0.5), 0 3px 8px rgba(0,0,0,0.3)',
  },
  '&:active': {
    transform: 'translateY(-50%) translateY(1px)',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'translateY(-50%)',
  },
}));

// Container for content with submit button on right
const GameplayContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  paddingRight: '160px', // Make space for submit button
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Tutorial instruction components
const InstructionOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(5px)',
}));

const InstructionCard = styled(Box)(({ theme }) => ({
  maxWidth: '600px',
  width: '90vw',
  padding: '32px',
  background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a6 50%, #dcc48a 100%)',
  border: '3px solid #b8956f',
  borderRadius: '20px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
  textAlign: 'center',
  position: 'relative',
  overflow: 'visible',
}));

const InstructionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#8b4513',
  marginBottom: '16px',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
}));

const InstructionContent = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#5d4037',
  lineHeight: 1.6,
  marginBottom: '16px',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
}));

const InstructionExample = styled(Box)(({ theme }) => ({
  background: 'rgba(139, 69, 19, 0.1)',
  border: '2px dashed #8b4513',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '20px',
  '& .MuiTypography-root': {
    color: '#6d4c41',
    fontStyle: 'italic',
    fontSize: '1rem',
  },
}));

const InstructionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  alignItems: 'center',
}));

const InstructionButton = styled(Button)(({ theme, variant }) => ({
  background: variant === 'next' 
    ? 'linear-gradient(145deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)'
    : 'linear-gradient(145deg, #757575 0%, #616161 50%, #424242 100%)',
  color: '#fff',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '12px 24px',
  border: variant === 'next' ? '2px solid #2e7d32' : '2px solid #424242',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  textTransform: 'none',
  minWidth: '100px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: variant === 'next'
      ? 'linear-gradient(145deg, #66bb6a 0%, #4caf50 50%, #388e3c 100%)'
      : 'linear-gradient(145deg, #9e9e9e 0%, #757575 50%, #616161 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
  },
}));

const InstructionProgress = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  marginBottom: '20px',
}));

const ProgressDot = styled(Box)(({ active }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: active ? '#4CAF50' : '#ccc',
  transition: 'all 0.3s ease',
}));

const TutorialBattle = ({ onComplete, showQuitButton, onQuit, quitButtonText, initialState, onStateChange }) => {
  const [hearts, setHearts] = useState(initialState?.hearts || 3);
  const [score, setScore] = useState(initialState?.score || 0);
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 30);
  const [selectedOption, setSelectedOption] = useState(initialState?.selectedOption || null);
  const [isAnswered, setIsAnswered] = useState(initialState?.isAnswered || false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialState?.currentQuestionIndex || 0);
  
  // 4 Pics 1 Word states
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  
  // Spelling states
  const [spellingInput, setSpellingInput] = useState('');
  
  // Reading Comprehension states
  const [draggedItems, setDraggedItems] = useState({ cause: null, effect: null });
  const [dragOver, setDragOver] = useState(null);
  
  // Audio synthesis
  const synthRef = useRef(window.speechSynthesis);
  
  // Initialize available letters for 4 Pics 1 Word
  useEffect(() => {
    if (questions[currentQuestionIndex]?.type === "4pics1word") {
      const letters = questions[currentQuestionIndex].letters.split('');
      setAvailableLetters(letters.map((letter, index) => ({ id: index, letter, used: false })));
      setSelectedLetters([]);
    }
  }, [currentQuestionIndex]);
  
  // Reset states when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setSpellingInput('');
    setDraggedItems({ cause: null, effect: null });
  }, [currentQuestionIndex]);

  // Handle instruction navigation
  const handleNextInstruction = () => {
    if (currentInstruction < tutorialInstructions.length - 1) {
      setCurrentInstruction(currentInstruction + 1);
    } else {
      setShowInstructions(false);
      setTimeLeft(30); // Start the timer when instructions end
    }
  };

  const handlePrevInstruction = () => {
    if (currentInstruction > 0) {
      setCurrentInstruction(currentInstruction - 1);
    }
  };

  const handleSkipInstructions = () => {
    setShowInstructions(false);
    setTimeLeft(30); // Start the timer
  };

  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [adventurerState, setAdventurerState] = useState('idle'); // idle, attack
  const [orcState, setOrcState] = useState('idle'); // idle, attack, hurt, death
  const [monsterHP, setMonsterHP] = useState(initialState?.monsterHP || 100); // Add HP state
  const [gameOver, setGameOver] = useState(false); // Add game over state
  const [victory, setVictory] = useState(false); // Add victory state
  
  // Tutorial instruction states
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentInstruction, setCurrentInstruction] = useState(0);

  // Tutorial instructions for each gameplay type
  const tutorialInstructions = [
    {
      title: "Welcome to Adventure Mode!",
      content: "In Adventure Mode, you'll face different types of challenges to defeat monsters. Let me teach you about each gameplay type!",
      type: "intro"
    },
    {
      title: "4 Pics 1 Word Challenge", 
      content: "Look at the 4 pictures and find the word they have in common. Click the letters below to spell the word. You can click letters in your answer to remove them!",
      type: "4pics1word",
      example: "If you see pictures of an apple, banana, orange, and grapes, the answer would be 'FRUIT'!"
    },
    {
      title: "Spelling Challenge",
      content: "Listen to the word definition and audio. Click the speaker button to hear the word, then type the correct spelling in the text box!",
      type: "spelling",
      example: "You'll hear the word and see its definition to help you spell it correctly."
    },
    {
      title: "Reading Comprehension",
      content: "Read the short passage carefully. Then drag the CAUSE and EFFECT statements to the correct boxes to show you understand the relationships!",
      type: "reading_comprehension",
      example: "If the passage says 'It rained, so the ground got wet', drag 'It rained' to CAUSE and 'the ground got wet' to EFFECT."
    },
    {
      title: "Multiple Choice Questions",
      content: "For some questions, you'll see traditional multiple choice. Just click the correct answer from the options provided!",
      type: "multiple_choice",
      example: "Choose the best answer from the 4 options given."
    },
    {
      title: "Battle Rules",
      content: "Remember: Wrong answers reduce your timer by 5 seconds! If time runs out, you lose a heart. Defeat the monster with 5 correct answers to win!",
      type: "rules"
    },
    {
      title: "Ready to Battle!",
      content: "Now you're ready to face your first monster! Use what you've learned to defeat the Orc. Good luck, adventurer!",
      type: "ready"
    }
  ];

  // 🎯 NEW DIVERSE GAMEPLAY QUESTIONS
  const questions = [
    {
      type: "4pics1word",
      images: [
        "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=200&h=200&fit=crop", // Food
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop", // Pancakes
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop", // Cooking
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop"  // Pizza
      ],
      letters: "FDOOEKOCIN",
      correct: "FOOD"
    },
    {
      type: "spelling",
      definition: "A large African mammal with a trunk and tusks",
      word: "elephant",
      correct: "elephant"
    },
    {
      type: "reading_comprehension",
      passage: "Sarah forgot to water her plants for two weeks. When she returned from vacation, all her plants had wilted and turned brown.",
      cause: "Sarah forgot to water her plants for two weeks",
      effect: "all her plants had wilted and turned brown",
      dragItems: [
        { id: "cause1", text: "Sarah forgot to water her plants for two weeks", type: "cause" },
        { id: "effect1", text: "all her plants had wilted and turned brown", type: "effect" },
        { id: "cause2", text: "She returned from vacation", type: "distractor" },
        { id: "effect2", text: "She bought new plants", type: "distractor" }
      ]
    },
    {
      type: "multiple_choice",
      question: "Which sentence uses correct punctuation?",
      options: [
        "The cat, dog and bird are pets.",
        "The cat, dog, and bird are pets.",
        "The cat dog and bird are pets.",
        "The cat; dog; and bird are pets."
      ],
      correct: 1 // "The cat, dog, and bird are pets."
    },
    {
      type: "multiple_choice",
      question: "What is the opposite of 'begin'?",
      options: ["start", "continue", "end", "pause"],
      correct: 2 // "end"
    }
  ];

  // 4 Pics 1 Word letter selection
  const handleLetterClick = (letterId) => {
    const letter = availableLetters.find(l => l.id === letterId);
    if (!letter || letter.used) return;
    
    setSelectedLetters(prev => [...prev, { id: letterId, letter: letter.letter }]);
    setAvailableLetters(prev => prev.map(l => 
      l.id === letterId ? { ...l, used: true } : l
    ));
  };
  
  const handleLetterRemove = (selectedId) => {
    const selectedLetter = selectedLetters.find(l => l.id === selectedId);
    if (!selectedLetter) return;
    
    setSelectedLetters(prev => prev.filter(l => l.id !== selectedId));
    setAvailableLetters(prev => prev.map(l => 
      l.id === selectedId ? { ...l, used: false } : l
    ));
  };
  
  const check4PicsAnswer = () => {
    const userAnswer = selectedLetters.map(l => l.letter).join('');
    return userAnswer.toUpperCase() === questions[currentQuestionIndex].correct.toUpperCase();
  };
  
  // Spelling audio playback
  const playSpellingAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex].word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      synthRef.current.speak(utterance);
    }
  };
  
  const checkSpellingAnswer = () => {
    return spellingInput.toLowerCase().trim() === questions[currentQuestionIndex].correct.toLowerCase();
  };
  
  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };
  
  const handleDragOver = (e, dropZone) => {
    e.preventDefault();
    setDragOver(dropZone);
  };
  
  const handleDragLeave = () => {
    setDragOver(null);
  };
  
  const handleDrop = (e, dropZone) => {
    e.preventDefault();
    const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    setDraggedItems(prev => ({
      ...prev,
      [dropZone]: itemData
    }));
    setDragOver(null);
  };
  
  const checkReadingAnswer = () => {
    const question = questions[currentQuestionIndex];
    return (
      draggedItems.cause?.text === question.cause &&
      draggedItems.effect?.text === question.effect
    );
  };
  
  const handleAnswer = (answer) => {
    if (isAnswered) return;
    
    const currentQ = questions[currentQuestionIndex];
    let isCorrect = false;
    
    // Check answer based on question type
    switch (currentQ.type) {
      case "4pics1word":
        isCorrect = check4PicsAnswer();
        break;
      case "spelling":
        isCorrect = checkSpellingAnswer();
        break;
      case "reading_comprehension":
        isCorrect = checkReadingAnswer();
        break;
      case "multiple_choice":
        setSelectedOption(answer);
        isCorrect = answer === currentQ.correct;
        break;
      default:
        isCorrect = false;
    }
    
    setIsAnswered(true);
    
    if (isCorrect) {
      // Correct answer - adventurer attacks first
      setAdventurerState('attack');
      setTimeout(() => {
        setAdventurerState('idle');
        // Then orc gets hurt
        setMonsterDamaged(true);
        setOrcState('hurt');
        
        // Damage the monster HP
        const hpDamage = 100 / questions.length; // Equal damage per question
        const newHP = Math.max(0, monsterHP - hpDamage);
        setMonsterHP(newHP);
        
        setTimeout(() => {
          setMonsterDamaged(false);
          if (newHP <= 0 || currentQuestionIndex === questions.length - 1) {
            // Monster defeated - victory!
            setOrcState('death');
            setTimeout(() => {
              setVictory(true);
            }, 1000);
          } else {
            setOrcState('idle');
            // Move to next question
            setTimeout(() => {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setSelectedOption(null);
              setIsAnswered(false);
              setTimeLeft(30);
            }, 500);
          }
        }, 500);
      }, 300);
      
      setScore(score + 1);
    } else {
      handleWrongAnswer();
    }
  };
  
  // Submit handlers for different question types
  const handleSubmit4Pics = () => {
    if (selectedLetters.length === 0) return;
    handleAnswer();
  };
  
  const handleSubmitSpelling = () => {
    if (spellingInput.trim() === '') return;
    handleAnswer();
  };
  
  const handleSubmitReading = () => {
    if (!draggedItems.cause || !draggedItems.effect) return;
    handleAnswer();
  };

  const handleWrongAnswer = () => {
    setUserDamaged(true);
    setOrcState('attack');
    
    // Decrease timer by 5 seconds as requested
    const newTime = Math.max(0, timeLeft - 5);
    setTimeLeft(newTime);
    
    setTimeout(() => {
      setUserDamaged(false);
      setOrcState('idle');
    }, 500);
    
    // Check if timer reached zero
    if (newTime <= 0) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts <= 0) {
        setTimeout(() => {
          setGameOver(true);
        }, 600);
        return;
      } else {
        // Reset timer and continue with same question
        setTimeout(() => {
          resetCurrentQuestion();
          setTimeLeft(30);
        }, 600);
        return;
      }
    }
    
    // Continue with same question after wrong answer (timer didn't reach zero)
    setTimeout(() => {
      resetCurrentQuestion();
    }, 600);
  };
  
  const resetCurrentQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setSpellingInput('');
    setSelectedLetters([]);
    setDraggedItems({ cause: null, effect: null });
    
    // Reset 4 pics letters
    if (questions[currentQuestionIndex]?.type === "4pics1word") {
      const letters = questions[currentQuestionIndex].letters.split('');
      setAvailableLetters(letters.map((letter, index) => ({ id: index, letter, used: false })));
    }
  };

  const endGame = (finalScore = score) => {
    const results = {
      score: finalScore,
      totalQuestions: questions.length,
      hearts: hearts,
      completed: finalScore === questions.length // Only completed if all questions answered correctly
    };
    onComplete(results);
  };

  const handleRetry = () => {
    setHearts(3);
    setScore(0);
    setTimeLeft(30);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserDamaged(false);
    setMonsterDamaged(false);
    setAdventurerState('idle');
    setOrcState('idle');
    setMonsterHP(100);
    setGameOver(false);
    setVictory(false);
  };

  const handleQuit = () => {
    if (onQuit) {
      onQuit();
    }
  };

  const handleSelect = (option, idx) => {
    if (!isAnswered) {
      handleAnswer(idx);
    }
  };

  // Initialize timer when instructions end
  useEffect(() => {
    if (!showInstructions) {
      setTimeLeft(30); // Reset timer when instructions end
    }
  }, [showInstructions]);

  useEffect(() => {
    // Only start timer if instructions are done and game is active
    if (!showInstructions && !victory && !gameOver && timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!showInstructions && !victory && !gameOver && timeLeft === 0 && !isAnswered) {
      // Timer reached zero - lose a heart and reset
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts <= 0) {
        setGameOver(true);
      } else {
        resetCurrentQuestion();
        setTimeLeft(30);
      }
    }  
  }, [timeLeft, isAnswered, victory, gameOver, hearts, showInstructions]);

  // Save battle state whenever important values change
  useEffect(() => {
    if (onStateChange) {
      const currentState = {
        hearts,
        score,
        timeLeft,
        selectedOption,
        isAnswered,
        currentQuestionIndex,
        monsterHP,
        showInstructions,
        currentInstruction
      };
      onStateChange(currentState);
    }
  }, [hearts, score, timeLeft, selectedOption, isAnswered, currentQuestionIndex, monsterHP, showInstructions, currentInstruction, onStateChange]);

  return (
    <BattleContainer>
      {/* Tutorial Instructions Overlay */}
      {showInstructions && (
        <InstructionOverlay>
          <InstructionCard>
            <InstructionProgress>
              {tutorialInstructions.map((_, index) => (
                <ProgressDot key={index} active={index === currentInstruction} />
              ))}
            </InstructionProgress>
            
            <InstructionTitle>
              {tutorialInstructions[currentInstruction].title}
            </InstructionTitle>
            
            <InstructionContent>
              {tutorialInstructions[currentInstruction].content}
            </InstructionContent>
            
            {tutorialInstructions[currentInstruction].example && (
              <InstructionExample>
                <Typography>
                  💡 Example: {tutorialInstructions[currentInstruction].example}
                </Typography>
              </InstructionExample>
            )}
            
            <InstructionButtons>
              {currentInstruction > 0 && (
                <InstructionButton 
                  variant="prev" 
                  onClick={handlePrevInstruction}
                >
                  Previous
                </InstructionButton>
              )}
              
              <InstructionButton 
                variant="next" 
                onClick={handleNextInstruction}
              >
                {currentInstruction < tutorialInstructions.length - 1 ? 'Next' : 'Start Battle!'}
              </InstructionButton>
              
              {currentInstruction < tutorialInstructions.length - 1 && (
                <InstructionButton 
                  variant="skip" 
                  onClick={handleSkipInstructions}
                >
                  Skip Tutorial
                </InstructionButton>
              )}
            </InstructionButtons>
          </InstructionCard>
        </InstructionOverlay>
      )}
      
      <TopBar>
        <HeartsRow>
          {[...Array(3)].map((_, idx) => (
            <HeartIcon key={idx} filled={idx < hearts} />
          ))}
        </HeartsRow>
        <div style={{ flex: 1 }} />
        <TimerBoxStyled>
          <Typography style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', letterSpacing: '1px', lineHeight: 1 }}>TIMER</Typography>
          <Typography style={{ fontWeight: 900, fontSize: '1.3rem', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', letterSpacing: '0.5px', lineHeight: 1, marginTop: '2px' }}>{timeLeft}s</Typography>
        </TimerBoxStyled>
        {showQuitButton && (
          <QuitButton onClick={handleQuit}>
            {quitButtonText || 'Quit'}
          </QuitButton>
        )}
      </TopBar>

      <MainContent>
        <SpritesRow>
          <AdventurerSprite state={adventurerState} isDamaged={userDamaged} />
          <OrcSprite state={orcState} isDamaged={monsterDamaged} />
          {/* Monster HP Bar and Name */}
          <MonsterHPText>Orc Minion HP</MonsterHPText>
          <MonsterHPBar>
            <MonsterHPFill hp={monsterHP} />
          </MonsterHPBar>
        </SpritesRow>
        <VS>VS</VS>
        <Ground />
      </MainContent>

      <BottomBar>
        {/* 4 Pics 1 Word Gameplay */}
        {questions[currentQuestionIndex].type === "4pics1word" && (
          <GameplayContainer>
            <QuestionText>Look at the pictures and spell the word!</QuestionText>
            <FourPicsContainer>
              <ImagesSection>
                {questions[currentQuestionIndex].images.map((img, idx) => (
                  <GameImage key={idx} src={img} alt={`Clue ${idx + 1}`} />
                ))}
              </ImagesSection>
              
              <GameplaySection>
                <Typography style={{ color: '#fff', fontSize: '1rem', marginBottom: '8px' }}>
                  Answer ({questions[currentQuestionIndex].correct.length} letters):
                </Typography>
                <AnswerBox>
                  {[...Array(questions[currentQuestionIndex].correct.length)].map((_, idx) => {
                    const selectedLetter = selectedLetters[idx];
                    return (
                      <AnswerSlot
                        key={idx}
                        filled={!!selectedLetter}
                        onClick={() => selectedLetter && handleLetterRemove(selectedLetter.id)}
                      >
                        {selectedLetter ? selectedLetter.letter : ''}
                      </AnswerSlot>
                    );
                  })}
                </AnswerBox>
                
                <Typography style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                  Available Letters:
                </Typography>
                <LetterBank>
                  {availableLetters.map((letter) => (
                    <LetterTile
                      key={letter.id}
                      used={letter.used}
                      onClick={() => handleLetterClick(letter.id)}
                      disabled={letter.used}
                    >
                      {letter.letter}
                    </LetterTile>
                  ))}
                </LetterBank>
              </GameplaySection>
            </FourPicsContainer>
            <SubmitButton
              onClick={handleSubmit4Pics}
              disabled={selectedLetters.length !== questions[currentQuestionIndex].correct.length || isAnswered}
            >
              Submit
            </SubmitButton>
          </GameplayContainer>
        )}

        {/* Spelling Gameplay */}
        {questions[currentQuestionIndex].type === "spelling" && (
          <GameplayContainer>
            <QuestionContainer>
              <QuestionText>Listen to the word and spell it correctly!</QuestionText>
              <AudioButton onClick={playSpellingAudio}>
                <VolumeUpIcon />
              </AudioButton>
            </QuestionContainer>
            <SpellingContainer>
              <SpellingRow>
                <DefinitionBox>
                  <Typography style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                    Definition: {questions[currentQuestionIndex].definition}
                  </Typography>
                </DefinitionBox>
                <SpellingInput
                  label="Spell the word"
                  variant="outlined"
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  disabled={isAnswered}
                />
              </SpellingRow>
            </SpellingContainer>
            <SubmitButton
              onClick={handleSubmitSpelling}
              disabled={spellingInput.trim() === '' || isAnswered}
            >
              Submit
            </SubmitButton>
          </GameplayContainer>
        )}

        {/* Reading Comprehension Gameplay */}
        {questions[currentQuestionIndex].type === "reading_comprehension" && (
          <GameplayContainer>
            <QuestionText>Read the passage and drag the CAUSE and EFFECT to the correct boxes!</QuestionText>
            <PassageBox>
              <Typography style={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.4 }}>
                {questions[currentQuestionIndex].passage}
              </Typography>
            </PassageBox>
            
            <DragItemsContainer>
              {questions[currentQuestionIndex].dragItems.map((item) => (
                <DragItem
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                >
                  {item.text}
                </DragItem>
              ))}
            </DragItemsContainer>
            
            <DropZonesContainer>
              <Box>
                <DropZoneLabel>CAUSE</DropZoneLabel>
                <DropZone
                  dragOver={dragOver === 'cause'}
                  filled={!!draggedItems.cause}
                  onDragOver={(e) => handleDragOver(e, 'cause')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'cause')}
                >
                  {draggedItems.cause ? (
                    <Typography style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                      {draggedItems.cause.text}
                    </Typography>
                  ) : (
                    <Typography style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      Drop cause here
                    </Typography>
                  )}
                </DropZone>
              </Box>
              
              <Box>
                <DropZoneLabel>EFFECT</DropZoneLabel>
                <DropZone
                  dragOver={dragOver === 'effect'}
                  filled={!!draggedItems.effect}
                  onDragOver={(e) => handleDragOver(e, 'effect')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'effect')}
                >
                  {draggedItems.effect ? (
                    <Typography style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                      {draggedItems.effect.text}
                    </Typography>
                  ) : (
                    <Typography style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      Drop effect here
                    </Typography>
                  )}
                </DropZone>
              </Box>
            </DropZonesContainer>
            
            <SubmitButton
              onClick={handleSubmitReading}
              disabled={!draggedItems.cause || !draggedItems.effect || isAnswered}
            >
              Submit
            </SubmitButton>
          </GameplayContainer>
        )}

        {/* Traditional Multiple Choice */}
        {questions[currentQuestionIndex].type === "multiple_choice" && (
          <GameplayContainer>
            <QuestionText>
              {questions[currentQuestionIndex].question}
            </QuestionText>
            <ChoicesGrid count={questions[currentQuestionIndex].options.length}>
              {questions[currentQuestionIndex].options.map((option, idx) => (
                <MoveButton
                  key={idx}
                  selected={selectedOption === idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                >
                  {option}
                </MoveButton>
              ))}
            </ChoicesGrid>
          </GameplayContainer>
        )}
      </BottomBar>

      {/* Victory Dialog */}
      {victory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a6 50%, #dcc48a 100%)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            border: '3px solid #b8956f',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Typography variant="h4" style={{ 
              color: '#8b4513', 
              fontWeight: 700, 
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Victory!
            </Typography>
            
            <div style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
              ⭐ ⭐ ⭐
            </div>
            
            <div style={{
              background: 'rgba(139, 69, 19, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              border: '2px solid rgba(139, 69, 19, 0.2)'
            }}>
              <Typography variant="h6" style={{ 
                color: '#8b4513', 
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                🏆 Score: {score}/{questions.length}
              </Typography>
              <Typography variant="body1" style={{ 
                color: '#6d4c41', 
                fontWeight: 500
              }}>
                ❤️ Hearts: {hearts}
              </Typography>
            </div>
            
            <Typography variant="body1" style={{ 
              color: '#5d4037', 
              fontStyle: 'italic',
              marginBottom: '24px',
              lineHeight: 1.4
            }}>
              "Well done! You have completed the tutorial and are ready for your adventure."
            </Typography>
            <Button
              variant="contained"
              onClick={() => onComplete({ victory: true, score, hearts })}
              style={{
                background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '16px',
                padding: '12px 24px',
                margin: '8px',
                fontSize: '1.1rem'
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Game Over Dialog */}
      {gameOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            border: '3px solid #d84315',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Typography variant="h3" style={{ color: '#d84315', fontWeight: 800, marginBottom: '20px' }}>
              💀 Game Over! 💀
            </Typography>
            <Typography variant="h6" style={{ color: '#5d4037', marginBottom: '30px' }}>
              The Orc Minion has defeated you!
            </Typography>
            <Button
              variant="contained"
              onClick={handleRetry}
              style={{
                background: 'linear-gradient(145deg, #2196F3 0%, #1976D2 50%, #1565C0 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '16px',
                padding: '12px 24px',
                margin: '8px',
                fontSize: '1.1rem'
              }}
            >
              🔄 Retry
            </Button>
            <Button
              variant="contained"
              onClick={handleQuit}
              style={{
                background: 'linear-gradient(145deg, #757575 0%, #616161 50%, #424242 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '16px',
                padding: '12px 24px',
                margin: '8px',
                fontSize: '1.1rem'
              }}
            >
              🚪 Quit
            </Button>
          </div>
        </div>
      )}
    </BattleContainer>
  );
};

export default TutorialBattle; 