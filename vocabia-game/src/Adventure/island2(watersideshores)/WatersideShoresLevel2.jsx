import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Character Assets - Using same wizard and adventurer sprites
// Wizard Animation Frames
import WizardIdle1 from '../AdventureAssets/Wizard/Idle_1.png';
import WizardIdle2 from '../AdventureAssets/Wizard/Idle_2.png';

// Adventurer Animation Frames
import SoldierIdle1 from '../AdventureAssets/Adventurer/Soldier-Idle_1.png';
import SoldierIdle2 from '../AdventureAssets/Adventurer/Soldier-Idle_2.png';
import SoldierIdle3 from '../AdventureAssets/Adventurer/Soldier-Idle_3.png';
import SoldierIdle4 from '../AdventureAssets/Adventurer/Soldier-Idle_4.png';
import SoldierIdle5 from '../AdventureAssets/Adventurer/Soldier-Idle_5.png';
import SoldierIdle6 from '../AdventureAssets/Adventurer/Soldier-Idle_6.png';
import SoldierAttack1 from '../AdventureAssets/Adventurer/Soldier-Attack02_1.png';
import SoldierAttack2 from '../AdventureAssets/Adventurer/Soldier-Attack02_2.png';
import SoldierAttack3 from '../AdventureAssets/Adventurer/Soldier-Attack02_3.png';
import SoldierAttack4 from '../AdventureAssets/Adventurer/Soldier-Attack02_4.png';
import SoldierAttack5 from '../AdventureAssets/Adventurer/Soldier-Attack02_5.png';
import SoldierAttack6 from '../AdventureAssets/Adventurer/Soldier-Attack02_6.png';

// Corallex Monster - Placeholder (user will provide actual images)
const CorellexIdle1 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexIdle2 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexIdle3 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexIdle4 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexAttack1 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexAttack2 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexAttack3 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexAttack4 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexHurt1 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexHurt2 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexHurt3 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexDeath1 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexDeath2 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexDeath3 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';
const CorellexDeath4 = 'https://www.shutterstock.com/image-vector/vector-pixel-art-monster-coral-260nw-721755148.jpg';

// Waterside Shores Background
const WATERSIDE_BG = 'https://thumbs.dreamstime.com/b/beach-pixel-art-background-d-backdrop-bit-retro-video-game-style-299969450.jpg'; // Beach/shore background

// Character positioning constants
const CHARACTER_POSITIONS = {
  WIZARD_LEFT: '100px',
  WIZARD_BOTTOM: '100px',
  ADVENTURER_LEFT: '180px',
  ADVENTURER_BOTTOM: '5px',
  // Dialogue scene positioning
  DIALOGUE_CORALLEX_RIGHT: '50px',
  DIALOGUE_CORALLEX_BOTTOM: '120px',
  // Battle scene positioning
  BATTLE_ADVENTURER_LEFT: '500px',
  BATTLE_ADVENTURER_BOTTOM: '120px',
  BATTLE_CORALLEX_RIGHT: '420px',
  BATTLE_CORALLEX_BOTTOM: '180px',
};

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

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  backgroundImage: `url(${WATERSIDE_BG})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const Ground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  bottom: '90px',
  width: '100%',
  height: '40px',
  background: 'linear-gradient(to top, #d4a574 80%, rgba(212,165,116,0.2) 100%)', // Sandy shore
  zIndex: 2,
  borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px',
  boxShadow: '0 0 16px 2px rgba(0,0,0,0.25)',
}));

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 0,
  transform: 'translateX(-50%)',
  width: '800px',
  maxWidth: '90vw',
  minWidth: '320px',
  height: '160px',
  padding: theme.spacing(3, 4),
  background: 'linear-gradient(145deg, #e8f4f8 0%, #d1e7dd 50%, #b8dce6 100%)', // Ocean-themed colors
  color: '#1a4c5c',
  textAlign: 'left',
  borderRadius: '20px 20px 0 0',
  zIndex: 10,
  boxShadow: '0 -4px 24px 4px rgba(0,0,0,0.25), 0 -8px 32px 2px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.6)',
  border: '3px solid #6fb3d2',
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
  background: 'linear-gradient(145deg, #6fb3d2 0%, #5a9bd4 50%, #4682b4 100%)', // Ocean blue
  color: '#ffffff',
  borderRadius: '18px',
  padding: '8px 20px',
  fontWeight: 800,
  fontSize: '1rem',
  boxShadow: '0 4px 16px rgba(70,130,180,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
  border: '3px solid #4682b4',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  zIndex: 100,
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
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
  color: '#1a4c5c',
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

const HeartRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  position: 'absolute',
  top: '24px',
  left: '32px',
  zIndex: 20,
}));

const TimerBox = styled(Box)(({ theme }) => ({
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
  marginLeft: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '90px',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  letterSpacing: '0.5px',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 20px rgba(212,165,116,0.5), 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)',
  },
}));

const TopBar = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 30,
  padding: '18px 32px',
  marginTop: '12px',
}));

const BattleBottomBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  background: 'linear-gradient(180deg, rgba(26,76,92,0.95) 0%, rgba(70,130,180,0.98) 50%, rgba(30,144,255,1) 100%)', // Ocean theme
  minHeight: '180px',
  padding: '38px 0 18px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
  borderTopLeftRadius: '32px',
  borderTopRightRadius: '32px',
  boxShadow: '0 -4px 24px 4px rgba(0,0,0,0.4), 0 -8px 32px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  border: '2px solid rgba(70,130,180,0.8)',
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

const QuestionText = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.3rem',
  marginBottom: '24px',
  textAlign: 'center',
  textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.1)',
  letterSpacing: '0.3px',
  lineHeight: 1.4,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  position: 'relative',
  zIndex: 12,
  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))',
}));

const TIMER_DURATION = 30;

const MonsterHPBar = styled(Box)(({ theme }) => ({
  width: '120px',
  height: '12px',
  backgroundColor: '#333',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  marginTop: '8px',
}));

const MonsterHPFill = styled(Box)(({ hp }) => ({
  width: `${hp}%`,
  height: '100%',
  background: 'linear-gradient(90deg, #4caf50 60%, #b2ff59 100%)',
  transition: 'width 0.4s',
}));

const MonsterHPText = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textShadow: '0 2px 8px #000',
  textAlign: 'center',
  marginBottom: '4px',
}));

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

const MoveButton = styled(Button)(({ selected }) => ({
  width: '100%',
  minHeight: '68px',
  background: selected 
    ? 'linear-gradient(145deg, #e8f4f8 0%, #d1e7dd 50%, #b8dce6 100%)' 
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
  color: selected ? '#1a4c5c' : '#2c3e50',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1.05rem',
  fontWeight: selected ? 700 : 600,
  border: selected 
    ? '3px solid #6fb3d2' 
    : '2px solid #dee2e6',
  borderRadius: '16px',
  boxShadow: selected 
    ? '0 8px 16px rgba(111,179,210,0.4), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)' 
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
    border: '3px solid #6fb3d2',
    boxShadow: '0 8px 20px rgba(111,179,210,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
    background: 'linear-gradient(145deg, #e8f4f8 0%, #d1e7dd 30%, #b8dce6 100%)',
    color: '#1a4c5c',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 4px 8px rgba(111,179,210,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
}));

const StarRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
  marginTop: -10,
}));

const Star = styled('span')(({ filled }) => ({
  fontSize: '2.2rem',
  color: filled ? '#FFD700' : '#bdbdbd',
  filter: filled ? 'drop-shadow(0 2px 6px #b48a6e88)' : 'none',
  margin: '0 4px',
  transition: 'color 0.2s',
}));

// Animated Wizard Component
const WizardSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const WizardImg = styled('img')({
    width: '180px',
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  });

  return <WizardImg src={currentFrame === 0 ? WizardIdle1 : WizardIdle2} {...props} />;
};

// Animated Adventurer Component
const AdventurerSprite = ({ state = 'idle', isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 6);
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6);
      }
    }, state === 'attack' ? 400 : 800);
    
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

  const AdventurerImg = styled('img')(({ isDamaged }) => ({
    width: '280px',
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${shake} 0.5s ease-in-out, ${userFlash} 0.5s ease-in-out` : 'none',
    marginBottom: '0px',
  }));

  return <AdventurerImg src={getAdventurerFrame()} isDamaged={isDamaged} {...props} />;
};

// Animated Corallex Sprite Component
const CorellexSprite = ({ state, isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 4);
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 4);
      } else if (state === 'hurt') {
        setCurrentFrame(prev => (prev + 1) % 3);
      } else if (state === 'death') {
        setCurrentFrame(prev => (prev + 1) % 4);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, [state]);

  const getCorallexFrame = () => {
    switch (state) {
      case 'attack':
        switch (currentFrame) {
          case 0: return CorellexAttack1;
          case 1: return CorellexAttack2;
          case 2: return CorellexAttack3;
          case 3: return CorellexAttack4;
          default: return CorellexAttack1;
        }
      case 'hurt':
        switch (currentFrame) {
          case 0: return CorellexHurt1;
          case 1: return CorellexHurt2;
          case 2: return CorellexHurt3;
          default: return CorellexHurt1;
        }
      case 'death':
        switch (currentFrame) {
          case 0: return CorellexDeath1;
          case 1: return CorellexDeath2;
          case 2: return CorellexDeath3;
          case 3: return CorellexDeath4;
          default: return CorellexDeath1;
        }
      default: // idle
        switch (currentFrame) {
          case 0: return CorellexIdle1;
          case 1: return CorellexIdle2;
          case 2: return CorellexIdle3;
          case 3: return CorellexIdle4;
          default: return CorellexIdle1;
        }
    }
  };

  const CorellexImg = styled('img')(({ isDamaged, state }) => ({
    width: '300px',
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none',
    transform: state === 'hurt' ? 'scaleX(-1)' : 'scaleX(-1)', // Face left
  }));

  return <CorellexImg src={getCorallexFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

// Character positioning components
const PositionedWizard = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.WIZARD_LEFT,
  bottom: CHARACTER_POSITIONS.WIZARD_BOTTOM,
  zIndex: 4,
}));

const PositionedAdventurer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.ADVENTURER_LEFT,
  bottom: CHARACTER_POSITIONS.ADVENTURER_BOTTOM,
  zIndex: 4,
}));

const PositionedCorallex = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.DIALOGUE_CORALLEX_RIGHT,
  bottom: CHARACTER_POSITIONS.DIALOGUE_CORALLEX_BOTTOM,
  zIndex: 4,
}));

const BattleAdventurer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.BATTLE_ADVENTURER_LEFT,
  bottom: CHARACTER_POSITIONS.BATTLE_ADVENTURER_BOTTOM,
  zIndex: 4,
}));

const BattleCorallex = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.BATTLE_CORALLEX_RIGHT,
  bottom: CHARACTER_POSITIONS.BATTLE_CORALLEX_BOTTOM,
  zIndex: 4,
}));

const VS = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 900,
  color: '#fff',
  textShadow: '0 2px 8px #000',
  margin: '0 18px',
  zIndex: 22,
  pointerEvents: 'none',
}));

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

// Styled components for diverse gameplay
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
  flex: '0 0 320px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '1fr 1fr',
  gap: '8px',
  height: 'auto',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GameImage = styled('img')(({ theme }) => ({
  width: '150px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '12px',
  border: '3px solid #fff',
  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

const LettersSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  alignItems: 'center',
}));

const AvailableLettersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '6px',
  flexWrap: 'nowrap',
  justifyContent: 'center',
}));

const LetterButton = styled(Button)(({ theme }) => ({
  minWidth: '45px',
  width: '45px',
  height: '45px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  background: 'linear-gradient(145deg, #e8f4f8, #d1e7dd)',
  color: '#1a4c5c',
  border: '2px solid #6fb3d2',
  borderRadius: '8px',
  flexShrink: 0,
  '&:hover': {
    background: 'linear-gradient(145deg, #d1e7dd, #b8dce6)',
    transform: 'translateY(-2px)',
  },
}));

const SpellingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
}));

const SpellingInput = styled('input')(({ theme }) => ({
  fontSize: '1.5rem',
  padding: '12px 20px',
  borderRadius: '8px',
  border: '2px solid #6fb3d2',
  background: 'rgba(255,255,255,0.9)',
  textAlign: 'center',
  letterSpacing: '2px',
  fontWeight: 'bold',
  width: '300px',
  '&:focus': {
    outline: 'none',
    borderColor: '#4682b4',
    boxShadow: '0 0 10px rgba(70,130,180,0.5)',
  },
}));

const SoundButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  fontSize: '1rem',
  background: 'linear-gradient(145deg, #4CAF50, #45a049)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  '&:hover': {
    background: 'linear-gradient(145deg, #45a049, #3d8b40)',
  },
}));

const ReadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
}));

const PassageBox = styled(Box)(({ theme }) => ({
  background: 'rgba(0,0,0,0.3)',
  padding: '16px',
  borderRadius: '8px',
  border: '2px solid rgba(255,255,255,0.2)',
  fontSize: '1.1rem',
  lineHeight: '1.6',
  color: '#f0f0f0',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  background: 'linear-gradient(145deg, #4682b4, #5a9bd4)',
  color: 'white',
  border: '2px solid #6fb3d2',
  borderRadius: '12px',
  alignSelf: 'flex-end',
  marginRight: '20px',
  '&:hover': {
    background: 'linear-gradient(145deg, #5a9bd4, #4682b4)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(70,130,180,0.4)',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
}));

const VictoryOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(30, 20, 10, 0.55)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const VictoryContainer = styled(Paper)(({ theme }) => ({
  minWidth: 380,
  maxWidth: '90vw',
  padding: '48px 36px 36px 36px',
  borderRadius: 24,
  background: '#fffbe6',
  boxShadow: '0 8px 48px 8px #000a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 1100,
  border: '4px solid #b48a6e',
}));

// Corallex questions (8 questions with your exact flow)
const corallexQuestions = [
  // Question 1: Spelling (Hard)
  {
    type: "spelling",
    definition: "Spell the word that means 'happening or done immediately'",
    correct: "IMMEDIATELY"
  },
  // Question 2: Multiple Choice (Intermediate)
  {
    type: "multiple_choice",
    question: "Which word means 'to make something less severe'?",
    options: [
      "Aggravate",
      "Alleviate", 
      "Accelerate",
      "Accumulate"
    ],
    correctAnswer: 1
  },
  // Question 3: Spelling (Hard)
  {
    type: "spelling",
    definition: "Spell the word that means 'existing everywhere at the same time'",
    correct: "UBIQUITOUS"
  },
  // Question 4: 4 Pics 1 Word (Intermediate)
  {
    type: "4pics1word",
    images: [
      "https://picsum.photos/150/100?random=10",
      "https://picsum.photos/150/100?random=11", 
      "https://picsum.photos/150/100?random=12",
      "https://picsum.photos/150/100?random=13"
    ],
    letters: "CONNECTIONXYZ",
    correct: "CONNECTION"
  },
  // Question 5: Spelling (Intermediate)
  {
    type: "spelling",
    definition: "Spell the word that means 'a person who opposes or fights against another'",
    correct: "OPPONENT"
  },
  // Question 6: Reading Comprehension (Intermediate)
  {
    type: "multiple_choice",
    question: "Read this passage: 'The coral reef ecosystem is one of the most diverse marine environments on Earth. These underwater structures are built by tiny animals called polyps, which secrete calcium carbonate to form their protective skeletons. Over thousands of years, these skeletons accumulate to create the massive reef structures we see today.' What do coral polyps secrete to form their skeletons?",
    options: [
      "Calcium phosphate",
      "Calcium carbonate",
      "Sodium chloride", 
      "Magnesium sulfate"
    ],
    correctAnswer: 1
  },
  // Question 7: Spelling (Intermediate)
  {
    type: "spelling",
    definition: "Spell the word that means 'to make or become different'",
    correct: "CHANGE"
  },
  // Question 8: Spelling (Intermediate)
  {
    type: "spelling",
    definition: "Spell the word that means 'a large body of water surrounded by land'",
    correct: "OCEAN"
  }
];

// Your exact script dialogue
const dialogueSequence = [
  { speaker: 'Wizard', text: 'The shores sharpen here… the words etched in coral cut the careless. Few have passed this way without bleeding pride.' },
  { speaker: 'Adventurer', text: 'So… what\'s waiting for us this time?' },
  { speaker: 'Corallex', text: 'Hissss… child of prophecy… do you dare step into my reef of riddled words?' },
  { speaker: 'Corallex', text: 'One slip, one missing letter… and you\'ll drown in your own errors!' },
];

const victoryDialogue = [
  { speaker: 'Adventurer', text: 'Looks like you couldn\'t keep your letters straight.' },
  { speaker: 'Corallex', text: 'Nooo… my doubles… cracked in half… ssssshhhhh…' },
  { speaker: 'Wizard', text: 'Good. Each victory weakens Spellisk\'s hold. But beware, adventurer—these waters only grow darker ahead.' },
];

const WatersideShoresLevel2 = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('dialogue');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [victoryDialogueIdx, setVictoryDialogueIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(100);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const [showVictoryDialogue, setShowVictoryDialogue] = useState(false);
  const idleTimeout = useRef(null);
  const [corallexState, setCorallexState] = useState('idle');
  const [adventurerState, setAdventurerState] = useState('idle');
  
  // Diverse gameplay states
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [spellingInput, setSpellingInput] = useState('');

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'victory-dialogue') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase, victoryDialogueIdx]);

  useEffect(() => {
    if (phase === 'battle' && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'battle' && timeLeft === 0 && !victory && !gameOver) {
      if (hearts > 1) {
        setHearts(h => h - 1);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
        setSelectedLetters([]);
        setSpellingInput('');
      } else {
        setHearts(0);
        setGameOver(true);
      }
    }
  }, [phase, timeLeft, victory, gameOver, hearts]);

  // Gameplay initialization
  useEffect(() => {
    if (phase === 'battle') {
      const question = corallexQuestions[currentQuestion];
      if (question) {
        setSelectedAnswer(null);
        setShowResult(false);
        setSelectedLetters([]);
        setSpellingInput('');
        
        if (question.type === '4pics1word') {
          const shuffled = question.letters.split('').sort(() => Math.random() - 0.5);
          setAvailableLetters(shuffled);
        }
      }
    }
  }, [currentQuestion, phase]);

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    
    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueSequence.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('battle');
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
      }
    } else if (phase === 'victory-dialogue') {
      if (victoryDialogueIdx < victoryDialogue.length - 1) {
        setVictoryDialogueIdx(victoryDialogueIdx + 1);
      } else {
        setShowVictoryDialogue(false);
        setVictory(true);
      }
    }
  };

  const validateAnswer = () => {
    const question = corallexQuestions[currentQuestion];
    let isCorrect = false;
    
    switch (question.type) {
      case 'multiple_choice':
        isCorrect = selectedAnswer === question.correctAnswer;
        break;
      case 'spelling':
        isCorrect = spellingInput.toUpperCase().trim() === question.correct.toUpperCase();
        break;
      case '4pics1word':
        isCorrect = selectedLetters.join('') === question.correct;
        break;
      default:
        isCorrect = false;
    }
    return isCorrect;
  };

  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    setTimeout(() => {
      const isCorrect = idx === corallexQuestions[currentQuestion].correctAnswer;
      processAnswer(isCorrect);
    }, 10);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = validateAnswer();
    processAnswer(isCorrect);
  };

  const processAnswer = (isCorrect) => {
    setShowResult(true);
    
    if (isCorrect) {
      // Correct answer
      setAdventurerState('attack');
      setTimeout(() => setAdventurerState('idle'), 500);
      
      setCorallexState('hurt');
      setTimeout(() => setCorallexState('idle'), 500);
      
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(100 / corallexQuestions.length));
        if (currentQuestion === corallexQuestions.length - 1 || newHP === 0) {
          setCorallexState('death');
          setShowVictoryDialogue(true);
          setPhase('victory-dialogue');
          setVictoryDialogueIdx(0);
        }
        return newHP;
      });
      
      if (currentQuestion < corallexQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setTimeLeft(TIMER_DURATION);
        }, 600);
      }
    } else {
      // Wrong answer
      const newTime = Math.max(0, timeLeft - 5);
      setTimeLeft(newTime);
      
      if (newTime === 0) {
        setCorallexState('attack');
        setTimeout(() => setCorallexState('idle'), 500);
        
        setUserDamaged(true);
        setTimeout(() => setUserDamaged(false), 500);
        
        if (hearts > 1) {
          setTimeout(() => {
            setHearts(h => h - 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setSelectedLetters([]);
            setSpellingInput('');
            setTimeLeft(TIMER_DURATION);
          }, 600);
        } else {
          setTimeout(() => {
            setHearts(0);
            setGameOver(true);
          }, 600);
        }
      } else {
        setTimeout(() => {
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedLetters([]);
          setSpellingInput('');
          
          const question = corallexQuestions[currentQuestion];
          if (question.type === '4pics1word') {
            const shuffled = question.letters.split('').sort(() => Math.random() - 0.5);
            setAvailableLetters(shuffled);
          }
        }, 1000);
      }
    }
  };

  // 4 Pics 1 Word functions
  const handleLetterClick = (letter, index) => {
    const question = corallexQuestions[currentQuestion];
    if (question && selectedLetters.length < question.correct.length) {
      setSelectedLetters(prev => [...prev, letter]);
      setAvailableLetters(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSelectedLetterClick = (index) => {
    const letter = selectedLetters[index];
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    setAvailableLetters(prev => [...prev, letter]);
  };

  // Spelling functions
  const handleSpellingInputChange = (e) => {
    setSpellingInput(e.target.value);
  };

  const speakWord = () => {
    const question = corallexQuestions[currentQuestion];
    if (question.type === 'spelling') {
      const utterance = new SpeechSynthesisUtterance(question.correct);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setShowVictoryDialogue(false);
    setSelectedLetters([]);
    setAvailableLetters([]);
    setSpellingInput('');
    setCorallexState('idle');
    setAdventurerState('idle');
    setPhase('battle');
  };

  const handleRetryWholeLevel = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setShowVictoryDialogue(false);
    setPhase('dialogue');
    setDialogueIdx(0);
    setVictoryDialogueIdx(0);
    setCorallexState('idle');
    setAdventurerState('idle');
  };

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/adventure/level-progress/save', {
            levelName: "Corallex",
            completed: true,
            starsEarned: hearts
          }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
        } catch (e) {
          // handle error (optional)
        }
      }
      saveProgress();
    }
  }, [victory, hearts]);

  // Render logic
  let content = null;
  if (phase === 'dialogue') {
    const d = dialogueSequence[dialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        {d.speaker === 'Corallex' && (
          <PositionedCorallex>
            <CorellexSprite state="idle" />
          </PositionedCorallex>
        )}
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText variant="h6" gutterBottom>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'battle') {
    const question = corallexQuestions[currentQuestion];
    content = (
      <>
        <BattleAdventurer>
          <AdventurerSprite state={adventurerState} isDamaged={userDamaged} />
        </BattleAdventurer>
        <BattleCorallex>
          <CorellexSprite state={corallexState} isDamaged={monsterDamaged} />
        </BattleCorallex>
        
        {/* HP UI */}
        <Box sx={{
          position: 'absolute',
          right: `calc(${CHARACTER_POSITIONS.BATTLE_CORALLEX_RIGHT} + 60px)`,
          bottom: `calc(${CHARACTER_POSITIONS.BATTLE_CORALLEX_BOTTOM} + 220px)`,
          zIndex: 10,
          transform: 'translateX(-50%)',
        }}>
          <MonsterHPText>Corallex HP</MonsterHPText>
          <MonsterHPBar>
            <MonsterHPFill hp={monsterHP} />
          </MonsterHPBar>
        </Box>
        <VS style={{ position: 'absolute', left: '50%', bottom: '250px', transform: 'translateX(-50%)', zIndex: 5 }}>VS</VS>
        
        <BattleBottomBar>
          {(() => {
            switch (question.type) {
              case 'multiple_choice':
                return (
                  <>
                    <QuestionText>{question.question}</QuestionText>
                    <ChoicesGrid count={question.options.length}>
                      {question.options.map((option, idx) => (
                        <MoveButton
                          key={idx}
                          selected={selectedAnswer === idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={showResult}
                        >
                          {option}
                        </MoveButton>
                      ))}
                    </ChoicesGrid>
                  </>
                );
                
              case 'spelling':
                return (
                  <SpellingContainer>
                    <Typography style={{ color: '#f0f0f0', fontSize: '1.2rem', marginBottom: '16px', textAlign: 'center' }}>
                      {question.definition}
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                      <SoundButton onClick={speakWord}>🔊 Play Sound</SoundButton>
                      <SpellingInput
                        type="text"
                        value={spellingInput}
                        onChange={handleSpellingInputChange}
                        placeholder="Type your answer..."
                      />
                      <SubmitButton
                        onClick={handleSubmitAnswer}
                        disabled={showResult || !spellingInput.trim()}
                        style={{ margin: '0' }}
                      >
                        Submit Answer
                      </SubmitButton>
                    </div>
                  </SpellingContainer>
                );
                
              case '4pics1word':
                return (
                  <FourPicsContainer>
                    <ImagesSection>
                      {question.images.map((img, idx) => (
                        <GameImage key={idx} src={img} alt={`Clue ${idx + 1}`} />
                      ))}
                    </ImagesSection>
                    <LettersSection>
                      <Typography style={{ color: '#f0f0f0', fontSize: '1.2rem', marginBottom: '8px', textAlign: 'center' }}>
                        Find the word that connects all images!
                      </Typography>
                      <div style={{ marginBottom: '16px' }}>
                        <Typography style={{ color: '#f0f0f0', fontSize: '1rem', marginBottom: '8px' }}>
                          Answer ({question.correct.length} letters):
                        </Typography>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {Array.from({ length: question.correct.length }).map((_, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: '50px', height: '50px', border: '2px solid #6fb3d2', borderRadius: '8px',
                                background: selectedLetters[idx] ? 'linear-gradient(145deg, #e8f4f8, #d1e7dd)' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold',
                                color: selectedLetters[idx] ? '#1a4c5c' : '#ccc', cursor: selectedLetters[idx] ? 'pointer' : 'default',
                              }}
                              onClick={() => selectedLetters[idx] && handleSelectedLetterClick(idx)}
                            >
                              {selectedLetters[idx] || ''}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
                        <AvailableLettersContainer style={{ margin: '0' }}>
                          {availableLetters.map((letter, idx) => (
                            <LetterButton key={idx} onClick={() => handleLetterClick(letter, idx)}>
                              {letter}
                            </LetterButton>
                          ))}
                        </AvailableLettersContainer>
                        <SubmitButton
                          onClick={handleSubmitAnswer}
                          disabled={showResult || selectedLetters.length === 0}
                          style={{ margin: '0' }}
                        >
                          Submit Answer
                        </SubmitButton>
                      </div>
                    </LettersSection>
                  </FourPicsContainer>
                );
                
              default:
                return <Typography style={{ color: '#f0f0f0' }}>Unknown question type</Typography>;
            }
          })()}
        </BattleBottomBar>
      </>
    );
  } else if (phase === 'victory-dialogue') {
    const d = victoryDialogue[victoryDialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        {d.speaker === 'Corallex' && (
          <PositionedCorallex>
            <CorellexSprite state="death" />
          </PositionedCorallex>
        )}
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText variant="h6" gutterBottom>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  }

  return (
    <SceneContainer>
      <Ground />
      <TopBar>
        {phase === 'battle' ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <HeartIcon key={idx} filled={idx < hearts} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {phase === 'battle' ? (
          <TimerBox>
            <Typography style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', letterSpacing: '1px', lineHeight: 1 }}>TIMER</Typography>
            <Typography style={{ fontWeight: 900, fontSize: '1.3rem', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', letterSpacing: '0.5px', lineHeight: 1, marginTop: '2px' }}>{timeLeft}s</Typography>
          </TimerBox>
        ) : <div style={{ width: 90 }} />}
        <Button variant="contained" onClick={() => setShowQuit(true)} startIcon={<CloseIcon />} style={{
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
        }}>
          Quit
        </Button>
      </TopBar>
      
      {content}
      
      {/* Quit Dialog */}
      <Dialog 
        open={showQuit} 
        onClose={() => setShowQuit(false)}
        PaperProps={{
          style: {
            background: 'linear-gradient(145deg, #e8f4f8 0%, #d1e7dd 50%, #b8dce6 100%)',
            borderRadius: '24px',
            border: '4px solid #6fb3d2',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: '300px',
            padding: '16px'
          }
        }}
      >
        <DialogContent style={{ padding: '24px 24px 16px 24px' }}>
          <Typography 
            variant="h5" 
            align="center"
            style={{
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              color: '#1a4c5c',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(111,179,210,0.3)'
            }}
          >
            Are you sure you want to quit?
          </Typography>
          <Typography 
            align="center"
            style={{
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              color: '#2c5f6f',
              fontSize: '1rem'
            }}
          >
            Your progress in this level will be lost.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px 24px 24px', gap: '12px', justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowQuit(false)} 
            variant="contained"
            style={{
              background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)',
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              borderRadius: '16px',
              padding: '10px 24px',
              border: '2px solid #2e7d32',
              boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
              textTransform: 'none',
              minWidth: '100px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => navigate('/waterside-shores')} 
            variant="contained"
            style={{
              background: 'linear-gradient(145deg, #f44336 0%, #e53935 50%, #d32f2f 100%)',
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              borderRadius: '16px',
              padding: '10px 24px',
              border: '2px solid #c62828',
              boxShadow: '0 4px 12px rgba(244,67,54,0.3)',
              textTransform: 'none',
              minWidth: '100px'
            }}
          >
            Quit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog 
        open={gameOver && hearts === 0} 
        onClose={() => {}}
        PaperProps={{
          style: {
            background: 'linear-gradient(145deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)',
            borderRadius: '24px',
            border: '4px solid #d84315',
            boxShadow: '0 8px 32px rgba(216,67,21,0.4)',
            minWidth: '350px',
            padding: '16px'
          }
        }}
      >
        <DialogContent style={{ padding: '24px 24px 16px 24px', textAlign: 'center' }}>
          <Typography 
            style={{
              fontSize: '4rem',
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          >
            💀
          </Typography>
          <Typography 
            variant="h4" 
            align="center"
            style={{
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 900,
              color: '#d84315',
              marginBottom: '12px',
              textShadow: '0 2px 8px rgba(216,67,21,0.3)'
            }}
          >
            Game Over!
          </Typography>
          <Typography 
            variant="h6"
            align="center"
            style={{
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 600,
              color: '#5d4037',
              marginBottom: '8px'
            }}
          >
            Corallex has defeated you!
          </Typography>
          <Typography 
            align="center"
            style={{
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              color: '#6d4c41',
              fontSize: '1rem'
            }}
          >
            Would you like to try again?
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px 24px 24px', gap: '12px', justifyContent: 'center' }}>
          <Button 
            onClick={handleRetryBattle} 
            variant="contained"
            style={{
              background: 'linear-gradient(145deg, #2196F3 0%, #1976D2 50%, #1565C0 100%)',
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              borderRadius: '16px',
              padding: '12px 24px',
              border: '2px solid #0d47a1',
              boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
              textTransform: 'none',
              minWidth: '100px',
              fontSize: '1.1rem'
            }}
          >
            🔄 Retry
          </Button>
          <Button 
            onClick={() => navigate('/waterside-shores')} 
            variant="contained"
            style={{
              background: 'linear-gradient(145deg, #757575 0%, #616161 50%, #424242 100%)',
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              borderRadius: '16px',
              padding: '12px 24px',
              border: '2px solid #212121',
              boxShadow: '0 4px 12px rgba(117,117,117,0.3)',
              textTransform: 'none',
              minWidth: '100px',
              fontSize: '1.1rem'
            }}
          >
            🚪 Quit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Victory Dialog */}
      {victory && (
        <VictoryOverlay>
          <VictoryContainer elevation={12}>
            <Typography 
              style={{ 
                color: '#1a4c5c', 
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', 
                fontWeight: 700, 
                fontSize: '1.2rem', 
                marginBottom: 8, 
                textAlign: 'center', 
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(26,76,92,0.2)'
              }}
            >
              Battle Rating
            </Typography>
            <StarRow>
              {[1,2,3].map(i => (
                <Star key={i} filled={hearts >= i}>
                  ⭐
                </Star>
              ))}
            </StarRow>
            <Typography 
              variant="h3"
              style={{
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontWeight: 900,
                color: '#2e7d32',
                marginBottom: '12px',
                marginTop: '16px',
                textAlign: 'center',
                textShadow: '0 4px 8px rgba(46,125,50,0.3)',
                fontSize: '3rem'
              }}
            >
              🎉 Victory! 🎉
            </Typography>
            <Typography 
              variant="h5"
              style={{
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontWeight: 700,
                color: '#388e3c',
                marginBottom: '8px',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(56,142,60,0.3)'
              }}
            >
              You've defeated Corallex!
            </Typography>
            <Typography 
              style={{ 
                color: '#5d4037', 
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', 
                marginBottom: 32, 
                fontSize: '1.2rem', 
                textAlign: 'center',
                fontWeight: 500,
                lineHeight: 1.5
              }}
            >
              🦑 The coral reef is safe once more! 🦑
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/waterside-shores')}
              style={{
                background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)',
                color: '#fff',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontWeight: 700,
                borderRadius: '20px',
                padding: '14px 32px',
                margin: '8px 0',
                minWidth: '200px',
                fontSize: '1.1rem',
                border: '3px solid #2e7d32',
                boxShadow: '0 6px 20px rgba(76,175,80,0.4), 0 3px 10px rgba(0,0,0,0.2)',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              🏠 Return to Shores
            </Button>
            <Button
              variant="outlined"
              onClick={handleRetryWholeLevel}
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 50%, #e0e0e0 100%)',
                color: '#1976d2',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontWeight: 700,
                borderRadius: '20px',
                padding: '14px 32px',
                margin: '8px 0',
                minWidth: '200px',
                fontSize: '1.1rem',
                border: '3px solid #1976d2',
                boxShadow: '0 4px 16px rgba(25,118,210,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              🔄 Retry Level
            </Button>
          </VictoryContainer>
        </VictoryOverlay>
      )}
    </SceneContainer>
  );
};

export default WatersideShoresLevel2;