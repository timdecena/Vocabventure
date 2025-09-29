import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Character Assets
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

// Dysauron Animation Frames (using single image for all states)
const DYSAURON_IMAGE = 'https://pbs.twimg.com/media/CUMM-oqXIAAYdim.png';

const SHADOW_BG = 'https://cdnb.artstation.com/p/assets/images/images/035/141/869/large/jesus-campos-jimenez-nerkin-mockup-habitacion-cristal-miriam-artstation.jpg?1614195984';

// Character positioning constants
const CHARACTER_POSITIONS = {
  WIZARD_LEFT: '100px',
  WIZARD_BOTTOM: '100px',
  ADVENTURER_LEFT: '180px',
  ADVENTURER_BOTTOM: '5px',
  // Dialogue scene positioning
  DIALOGUE_DYSAURON_RIGHT: '50px',
  DIALOGUE_DYSAURON_BOTTOM: '10px',
  // Battle scene positioning
  BATTLE_ADVENTURER_LEFT: '200px',
  BATTLE_ADVENTURER_BOTTOM: '150px',
  BATTLE_DYSAURON_RIGHT: '50%',
  BATTLE_DYSAURON_BOTTOM: '200px',
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;
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
  backgroundImage: `url(${SHADOW_BG})`,
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
  background: 'linear-gradient(to top, #3e2e1a 80%, rgba(62,46,26,0.2) 100%)',
  zIndex: 2,
  borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px',
  boxShadow: '0 0 16px 2px rgba(0,0,0,0.25)',
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  width: '900px',
  maxWidth: '90vw',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '130px',
  height: '250px',
  zIndex: 3,
  pointerEvents: 'none',
}));

// Individual character positioning
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

// Dialogue monster positioning
const PositionedMonster = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.DIALOGUE_DYSAURON_RIGHT,
  bottom: CHARACTER_POSITIONS.DIALOGUE_DYSAURON_BOTTOM,
  zIndex: 4,
}));

// Battle-specific positioning components
const BattleAdventurer = styled(Box)(({ theme }) => ({
  position: 'absolute',
 
  bottom: CHARACTER_POSITIONS.BATTLE_ADVENTURER_BOTTOM,
  zIndex: 4,
  // BattleAdventurer positioning controls - adjust these values to move the adventurer
  top: '400px',    // Move up (negative) or down (positive)
  right: '800px',  // Move right (negative) or left (positive)
}));

const BattleMonster = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.BATTLE_DYSAURON_RIGHT,
  bottom: CHARACTER_POSITIONS.BATTLE_DYSAURON_BOTTOM,
  transform: 'translateX(50%)', // Center the monster horizontally
  zIndex: 4,
  // BattleMonster positioning controls - adjust these values to move the entire monster container
  top: '400px',    // Move up (negative) or down (positive)
  right: '500px',   // Move left (negative) or right (positive)
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

// Animated Dysauron Sprite Component
const DysauronSprite = ({ state, isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 4); // 4 idle frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 5); // 5 attack frames
      } else if (state === 'hurt') {
        setCurrentFrame(prev => (prev + 1) % 3); // 3 damage frames
      } else if (state === 'death') {
        setCurrentFrame(prev => (prev + 1) % 5); // 5 death frames
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, [state]);

  const getDysauronFrame = () => {
    // Using single image for all states
    return DYSAURON_IMAGE;
  };

const DysauronImg = styled('img')(({ isDamaged, state }) => ({
  width: '300px', // Large boss size
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none',
  transform: state === 'hurt' ? 'scaleX(-1)' : 'scaleX(1)', // Face adventurer when hurt
  // Positioning controls - adjust these values to move the monster
  position: 'relative',
  top: '-110px',    // Move up (negative) or down (positive)
  left: '0px',   // Move left (negative) or right (positive)
  bottom: '0px', // Move down (negative) or up (positive) 
  right: '0px',  // Move right (negative) or left (positive)
}));

  return <DysauronImg src={getDysauronFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

const HeartIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'filled',
})(({ theme, filled }) => ({
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

const FLESH_BROWN = '#e6c7b2';
const NAME_BG = '#d1a97a';

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
  // Shadow Isles theme: deep slate blues
  background: 'linear-gradient(145deg, #2a2e3b 0%, #1c2130 50%, #151a24 100%)',
  color: '#ffffff',
  textAlign: 'left',
  borderRadius: '20px 20px 0 0',
  zIndex: 10,
  boxShadow: '0 -4px 24px 6px rgba(0,0,0,0.45), 0 -8px 32px 4px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.08)',
  border: '3px solid #3b4560',
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
    background: 'linear-gradient(145deg, rgba(59,69,96,0.1) 0%, rgba(45,53,75,0.05) 50%, rgba(31,37,51,0.1) 100%)',
    borderRadius: 'inherit',
    zIndex: -1,
  },
}));

const NameTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-25px',
  left: '24px',
  background: 'linear-gradient(145deg, #3b4560 0%, #2d354b 50%, #1f2533 100%)',
  color: '#ffffff',
  borderRadius: '18px',
  padding: '8px 20px',
  fontWeight: 800,
  fontSize: '1rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
  border: '3px solid #3b4560',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  zIndex: 100,
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
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
  color: '#ffffff',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
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

const VS = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 900,
  color: '#fff',
  textShadow: '0 2px 8px #000',
  margin: '0 18px',
  zIndex: 22,
  pointerEvents: 'none',
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
  background: 'linear-gradient(180deg, rgba(26,28,38,0.96) 0%, rgba(23,26,35,0.98) 50%, rgba(20,24,33,1) 100%)',
  minHeight: '180px',
  padding: '38px 0 18px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
  borderTopLeftRadius: '32px',
  borderTopRightRadius: '32px',
  boxShadow: '0 -6px 26px 8px rgba(0,0,0,0.55), 0 -10px 36px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  border: '2px solid #3b4560',
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

const MonsterHPBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '100px',
  left: '50%',
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
  top: '55px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textShadow: '0 2px 8px #000',
  zIndex: 10,
}));

const ChoicesGrid = styled(Box)(({ theme, count }) => ({
  width: count === 3 ? '700px' : '600px',
  maxWidth: '95vw',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: count === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
  gridTemplateRows: count === 3 ? '1fr' : '1fr 1fr',
  gap: '18px',
  justifyItems: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'center',
}));

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
    boxShadow: '0 4px 8px rgba(212,165,116,0.3), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
}));

const InputField = styled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '1.1rem',
    color: '#000 !important',
    fontWeight: 600,
    borderRadius: '16px',
    '& fieldset': {
      borderColor: '#dee2e6',
      borderWidth: '2px',
      borderRadius: '16px',
    },
    '&:hover fieldset': {
      borderColor: '#d4a574',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d4a574',
      borderWidth: '3px',
    },
  },
  '& input': {
    color: '#000 !important',
    fontWeight: 600,
    padding: '12px 16px',
  },
  '& input::placeholder': {
    color: '#888',
    opacity: 1,
    fontStyle: 'italic',
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a6 50%, #dcc48a 100%)',
    borderRadius: '20px',
    border: '3px solid #b8956f',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6)',
    minWidth: '400px',
    padding: '16px',
    position: 'relative',
    overflow: 'visible',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
      borderRadius: '20px',
      pointerEvents: 'none',
    },
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  textAlign: 'center',
  padding: '24px 32px 16px 32px',
  position: 'relative',
  zIndex: 2,
  '& .MuiTypography-root': {
    color: '#2c1810',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontWeight: 700,
    fontSize: '1.3rem',
    textShadow: '0 1px 2px rgba(255,255,255,0.4)',
    letterSpacing: '0.3px',
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 32px 24px 32px',
  justifyContent: 'center',
  gap: '16px',
  position: 'relative',
  zIndex: 2,
}));

const DialogButton = styled(Button)(({ variant }) => ({
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontWeight: 700,
  fontSize: '1rem',
  borderRadius: '16px',
  padding: '10px 24px',
  textTransform: 'none',
  letterSpacing: '0.5px',
  minWidth: '120px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'cancel' ? {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
    color: '#2c3e50',
    border: '2px solid #dee2e6',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
    '&:hover': {
      background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
      border: '2px solid #adb5bd',
    },
  } : {
    background: 'linear-gradient(145deg, #ff6b6b 0%, #ee5a52 50%, #d63031 100%)',
    color: '#fff',
    border: '2px solid #c23616',
    boxShadow: '0 4px 12px rgba(214,48,49,0.4), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
    '&:hover': {
      background: 'linear-gradient(145deg, #ff5252 0%, #e53935 50%, #c62828 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(214,48,49,0.5), 0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
      border: '2px solid #b71c1c',
    },
  }),
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)',
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

const Star = styled('span', {
  shouldForwardProp: (prop) => prop !== 'filled',
})(({ filled }) => ({
  fontSize: '2.2rem',
  color: filled ? '#FFD700' : '#bdbdbd',
  filter: filled ? 'drop-shadow(0 2px 6px #b48a6e88)' : 'none',
  margin: '0 4px',
  transition: 'color 0.2s',
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

const VictoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: '2.2rem',
  color: '#00996b',
  marginBottom: 18,
  textShadow: '0 2px 8px #b48a6e44',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  textAlign: 'center',
}));

const VictoryButton = styled(Button)(({ theme }) => ({
  fontWeight: 700,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1.1rem',
  borderRadius: 16,
  margin: '12px 0',
  minWidth: 180,
  boxShadow: '0 2px 8px #b48a6e44',
}));

const TIMER_DURATION = 30;
const PHASE2_TIMER_DURATION = 10;
const MONSTER_MAX_HP = 100;

const dialogueSequence = [
  { speaker: "Wizard", text: "We stand at the heart of silence. The Throne of Shadows. Beyond these doors… Dysauron awaits." },
  { speaker: "Adventurer", text: "No more underlings. No more guardians. Just him." },
  { speaker: "Wizard", text: "Remember this: your knowledge is light, and your will is fire. Do not falter, chosen one… for if you fall, all of Vocabia falls with you." },
  { speaker: "Dysauron", text: "So… the child of prophecy crawls into my abyss." },
  { speaker: "Dysauron", text: "Grammowl, Umbrosk, the others… all broken. And yet, they were but shadows of my shadow." },
  { speaker: "Dysauron", text: "I am Dysauron, devourer of words, bane of thought. Your tongue will twist, your mind will shatter, and your voice will fall silent." },
  { speaker: "Adventurer", text: "You stole the scrolls. You silenced the world. I'll be the one to end your reign." },
  { speaker: "Dysauron", text: "End me? Fool. I am silence eternal. I am the void between every word. Come then—let your final mistakes be your last!" }
];

const midBattleDialogue = [
  { speaker: "Dysauron", text: "ENOUGH! You dare wound me… you dare unravel my silence with your pitiful words?!" },
  { speaker: "Dysauron", text: "I'll strip away your choices, your comforts, your crutches! No more riddles with neat answers." },
  { speaker: "Dysauron", text: "Here in the Throne of Shadows, you speak TRUTH or you are devoured!" },
  { speaker: "Adventurer", text: "Then I'll answer with nothing but truth. No tricks. No shadows. Just light." },
  { speaker: "Dysauron", text: "Fool! Light cannot live without darkness. Let me drown you in it!" }
];

const defeatDialogue = [
  { speaker: "Dysauron", text: "No… this silence was eternal… this void unbreakable… How can light pierce shadows so deep…?" },
  { speaker: "Dysauron", text: "The scrolls… they betrayed me… No—you restored them…" },
  { speaker: "Dysauron", text: "But remember… shadows never die. They wait. They return. And I… shall return too…" }
];

const victoryDialogue = [
  { speaker: "Adventurer", text: "It's over… the scrolls are ours again." },
  { speaker: "Wizard", text: "You've done the impossible. Dysauron is cast back into the abyss, and the Scrolls of Knowledge restored. Vocabia breathes again." },
  { speaker: "Adventurer", text: "Then let the words live on. Let no shadow silence us again." },
  { speaker: "Wizard", text: "The prophecy is fulfilled. The chosen one has brought light to Vocabia. May your name be written in the eternal scrolls." }
];

const phase1Questions = [
  {
    type: "reading_comprehension",
    passage: "The ancient library's manuscripts contained profound wisdom that had been preserved for centuries. Scholars who studied these texts discovered intricate patterns of knowledge that transcended ordinary understanding. The preservation of these documents required meticulous care and specialized techniques that few possessed.",
    causeOptions: ["Manuscripts contained wisdom", "Scholars studied texts", "Preservation required care"],
    effectOptions: ["Patterns were discovered", "Knowledge was preserved", "Techniques were needed"],
    correctMatches: [
      { cause: "Scholars studied texts", effect: "Patterns were discovered" },
      { cause: "Preservation required care", effect: "Techniques were needed" }
    ]
  },
  {
    type: "4pics1word",
    images: [
      "https://t3.ftcdn.net/jpg/03/17/68/00/360_F_317680096_tvxy34D3bDt0yPprVV0KbxRnAVVYBZCv.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkj0ZlTDD_14udcmW2NDIRrDpUz6J59_S09Q&s", 
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjBroZ3pfo_P068AJRRG6OEsg-EVKB6bNmAA&s",
      "https://image.winudf.com/v2/image1/Y29tLm1vYmFkdS5NYXplMl9pY29uXzE1NDEzNDMyMjVfMDQx/icon.png?w=312&fakeurl=1"
    ],
    letters: "LABYRINTHSDQ",
    correct: "LABYRINTH"
  },
  {
    type: "spelling",
    definition: "A word meaning 'to make something unclear or difficult to understand' - often used in the context of hiding meaning.",
    correct: "OBFUSCATE"
  },
  {
    type: "reading_comprehension",
    passage: "The philosopher's treatise on existentialism explored the fundamental questions of human existence. Through rigorous analysis of consciousness and being, the work challenged traditional metaphysical assumptions and proposed revolutionary frameworks for understanding reality.",
    causeOptions: ["Treatise explored questions", "Analysis was rigorous", "Work challenged assumptions"],
    effectOptions: ["Consciousness was examined", "Frameworks were proposed", "Reality was redefined"],
    correctMatches: [
      { cause: "Analysis was rigorous", effect: "Consciousness was examined" },
      { cause: "Work challenged assumptions", effect: "Frameworks were proposed" }
    ]
  },
  {
    type: "spelling",
    definition: "A word meaning 'to speak or write in a way that is deliberately unclear or confusing' - often used to deceive.",
    correct: "OBSCURANTISM"
  },
  {
    type: "4pics1word",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXZo4DC64kFHVwavQDmoVJq8mFikAjbecx9A&s",
      "https://cdn.mos.cms.futurecdn.net/QVNLMd4a85faHgt2Z8kENW.jpg", 
      "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/newscms/2018_20/2434731/180516-honshu-japan-earthquake-tsunami-2011-ew-1247p.jpg",
      "https://lh3.googleusercontent.com/uyXTUVNKrpkOEZ3T2ePnCZNXa02k8ayZro0fmS_zALB7_zggViAQuMIOdTZCgcmA2yVLkEwOUyTg2lTHzdDn2trkars=s1280-w1280-h800"
    ],
    letters: "CATACLYSMSWD",
    correct: "CATACLYSM"
  },
  {
    type: "reading_comprehension",
    passage: "The linguist's research into ancient dialects revealed fascinating connections between seemingly unrelated languages. Through comparative analysis of phonetic structures and semantic patterns, the study demonstrated how cultural exchange influenced linguistic evolution across civilizations.",
    causeOptions: ["Research revealed connections", "Analysis was comparative", "Cultural exchange occurred"],
    effectOptions: ["Languages were connected", "Evolution was demonstrated", "Civilizations were linked"],
    correctMatches: [
      { cause: "Analysis was comparative", effect: "Evolution was demonstrated" },
      { cause: "Cultural exchange occurred", effect: "Civilizations were linked" }
    ]
  },
  {
    type: "spelling",
    definition: "A word meaning 'the study of the origin and development of words' - the science of word history.",
    correct: "ETYMOLOGY"
  },
  {
    type: "4pics1word",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXNbhwvMyKEI0egdvVMpUcRxoHV6JD4iokjw&s",
      "https://c8.alamy.com/comp/GKGTMM/interracial-man-ascending-to-heaven-GKGTMM.jpg", 
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTty_G5-rJ_u8uo3tck4fuXlvc6cdflJTQCig&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqJUsfK1hdDOfO6myhqxfnnQTCBIz7zLfBlQ&s"
    ],
    letters: "ASCENDSWD",
    correct: "ASCEND"
  },
  {
    type: "reading_comprehension",
    passage: "The archivist's meticulous documentation of historical events required extraordinary attention to detail and comprehensive understanding of contextual significance. Through systematic organization of primary sources and secondary materials, the collection became an invaluable resource for future researchers.",
    causeOptions: ["Documentation was meticulous", "Attention to detail was required", "Organization was systematic"],
    effectOptions: ["Context was understood", "Collection became valuable", "Resources were created"],
    correctMatches: [
      { cause: "Attention to detail was required", effect: "Context was understood" },
      { cause: "Organization was systematic", effect: "Collection became valuable" }
    ]
  }
];

const phase2Questions = [
  {
    question: 'Identify the correct word to complete this sentence:\nThe judge showed no mercy, delivering a harsh ___.',
    answer: 'condemnation'
  },
  {
    question: 'What word means "to speak in a way that is deliberately unclear"?',
    answer: 'obfuscate'
  },
  {
    question: 'Identify the correct word for "the study of word origins":',
    answer: 'etymology'
  },
  {
    question: 'Identify the correct word for "a feeling of deep regret or guilt":',
    answer: 'remorse'
  },
  {
    question: 'Identify the correct word for "relating to the depths of the ocean or abyss":',
    answer: 'abyssal'
  },
  {
    question: 'What word means "the prolongation of sound by reflection or reverberation"?',
    answer: 'reverberation'
  }
];

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

const SelectedLettersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  minHeight: '60px',
  alignItems: 'center',
  padding: '12px',
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '8px',
  border: '2px dashed rgba(255,255,255,0.3)',
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
  background: 'linear-gradient(145deg, #f4e4c1, #e8d5a6)',
  color: '#5d4037',
  border: '2px solid #b8956f',
  borderRadius: '8px',
  flexShrink: 0,
  '&:hover': {
    background: 'linear-gradient(145deg, #e8d5a6, #dcc48a)',
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
  border: '2px solid #b8956f',
  background: 'rgba(255,255,255,0.9)',
  textAlign: 'center',
  letterSpacing: '2px',
  fontWeight: 'bold',
  width: '300px',
  '&:focus': {
    outline: 'none',
    borderColor: '#8B4513',
    boxShadow: '0 0 10px rgba(139,69,19,0.5)',
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

const DragDropSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
}));

const DragDropColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}));

const DragItem = styled(Box)(({ theme }) => ({
  padding: '12px',
  background: 'linear-gradient(145deg, #f4e4c1, #e8d5a6)',
  color: '#5d4037',
  borderRadius: '8px',
  border: '2px solid #b8956f',
  cursor: 'grab',
  textAlign: 'center',
  fontSize: '0.9rem',
  '&:hover': {
    background: 'linear-gradient(145deg, #e8d5a6, #dcc48a)',
  },
  '&:active': {
    cursor: 'grabbing',
  },
}));

const DropZone = styled(Box)(({ theme }) => ({
  minHeight: '50px',
  padding: '12px',
  border: '2px dashed rgba(255,255,255,0.3)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.2)',
  color: '#ccc',
  fontSize: '0.9rem',
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

const JungleLushLevel5 = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('dialogue');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [victoryDialogueIdx, setVictoryDialogueIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(100);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const idleTimeout = useRef(null);
  const inputRef = useRef(null);
  // Sprite animation states
  const [dysauronState, setDysauronState] = useState('idle');
  const [adventurerState, setAdventurerState] = useState('idle');
  // New states for diverse gameplay
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [spellingInput, setSpellingInput] = useState('');
  const [draggedItems, setDraggedItems] = useState({ causes: [], effects: [] });

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'midBattleDialogue' || phase === 'defeatDialogue' || phase === 'victoryDialogue') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase]);

  useEffect(() => {
    if ((phase === 'battle1' || phase === 'battle2') && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if ((phase === 'battle1' || phase === 'battle2') && timeLeft === 0 && !victory && !gameOver) {
      setShowResult(false);
      if (hearts > 1) {
        setHearts(h => h - 1);
        setTimeLeft(phase === 'battle1' ? TIMER_DURATION : PHASE2_TIMER_DURATION);
        setSelectedAnswer(null);
        setUserInput('');
      } else {
        setHearts(0);
        setGameOver(true);
      }
    }
  }, [phase, timeLeft, victory, gameOver, hearts]);

  useEffect(() => {
    if (phase === 'battle2' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, currentQuestion]);

  // Gameplay initialization useEffect (only for phase1 multiple choice questions)
  useEffect(() => {
    if (phase === 'battle1') {
      const question = phase1Questions[currentQuestion];
      if (question) {
        // Reset states
        setSelectedAnswer(null);
        setShowResult(false);
        setSelectedLetters([]);
        setSpellingInput('');
        setDraggedItems({ causes: [], effects: [] });
        // Initialize based on question type
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
        setPhase('battle1');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
      }
    } else if (phase === 'midBattleDialogue') {
      if (dialogueIdx < midBattleDialogue.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('battle2');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(PHASE2_TIMER_DURATION);
        setUserInput('');
        setShowResult(false);
      }
    } else if (phase === 'defeatDialogue') {
      if (dialogueIdx < defeatDialogue.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('victoryDialogue');
        setVictoryDialogueIdx(0);
      }
    } else if (phase === 'victoryDialogue') {
      if (victoryDialogueIdx < victoryDialogue.length - 1) {
        setVictoryDialogueIdx(victoryDialogueIdx + 1);
      } else {
        setVictory(true);
      }
    }
  };

  // Answer handler for multiple choice questions (battle1 only)
  const handleAnswer = (idx) => {
    if (phase !== 'battle1') return;
    setSelectedAnswer(idx);
    // Use setTimeout to ensure state updates properly
    setTimeout(() => {
      const question = phase1Questions[currentQuestion];
      const isCorrect = idx === question.correctAnswer;
      setShowResult(true);
      
      if (isCorrect) {
        // Adventurer attacks first
        setAdventurerState('attack');
        setTimeout(() => {
          setAdventurerState('idle');
          // Then Grammowl gets hurt
          setMonsterDamaged(true);
          setDysauronState('hurt');
          setTimeout(() => {
            setMonsterDamaged(false);
            setDysauronState('idle');
          }, 500);
        }, 300);
        setMonsterHP(hp => {
          const newHP = Math.max(0, hp - 20); // 5 hits to defeat in phase 1
          if (currentQuestion === 4) {
            setDysauronState('hurt');
            setTimeout(() => {
              setPhase('midBattleDialogue');
              setDialogueIdx(0);
              setDysauronState('idle');
            }, 1000);
          }
          return newHP;
        });
        if (currentQuestion < phase1Questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setTimeLeft(TIMER_DURATION);
          }, 600);
        }
      } else {
        // Wrong answer - lose heart directly
        setUserDamaged(true);
        setDysauronState('attack');
        setTimeout(() => {
          setUserDamaged(false);
          setDysauronState('idle');
        }, 500);
        if (hearts > 1) {
          setTimeout(() => {
            setHearts(h => h - 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setTimeLeft(TIMER_DURATION);
          }, 600);
        } else {
          setTimeout(() => {
            setHearts(0);
            setGameOver(true);
          }, 600);
        }
      }
    }, 10);
  };

  // Generic validation function for diverse gameplay types (battle1 only)
  const validateAnswer = () => {
    const question = phase1Questions[currentQuestion];
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
      case 'reading_comprehension':
        const userCause = draggedItems.causes[0];
        const userEffect = draggedItems.effects[0];
        isCorrect = question.correctMatches.some(match => 
          match.cause === userCause && match.effect === userEffect
        );
        break;
      default:
        isCorrect = false;
    }
    return isCorrect;
  };

  // Generic submit handler for diverse gameplay types (battle1 only)
  const handleSubmitAnswer = () => {
    if (phase !== 'battle1') return;
    const isCorrect = validateAnswer();
    
    setShowResult(true);
    
    if (isCorrect) {
      // Adventurer attacks first
      setAdventurerState('attack');
      setTimeout(() => {
        setAdventurerState('idle');
        // Then Grammowl gets hurt
        setMonsterDamaged(true);
        setDysauronState('hurt');
        setTimeout(() => {
          setMonsterDamaged(false);
          setDysauronState('idle');
        }, 500);
      }, 300);
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - 10); // 10 hits to defeat in phase 1
        if (currentQuestion === 9) {
          setDysauronState('hurt');
          setTimeout(() => {
            setPhase('midBattleDialogue');
            setDialogueIdx(0);
            setDysauronState('idle');
          }, 1000);
        }
        return newHP;
      });
      if (currentQuestion < phase1Questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setTimeLeft(TIMER_DURATION);
        }, 600);
      }
    } else {
      // Wrong answer - lose heart directly
      setUserDamaged(true);
      setDysauronState('attack');
      setTimeout(() => {
        setUserDamaged(false);
        setDysauronState('idle');
      }, 500);
      if (hearts > 1) {
        setTimeout(() => {
          setHearts(h => h - 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedLetters([]);
          setSpellingInput('');
          setDraggedItems({ causes: [], effects: [] });
          
          const question = phase1Questions[currentQuestion];
          if (question && question.type === '4pics1word') {
            const shuffled = question.letters.split('').sort(() => Math.random() - 0.5);
            setAvailableLetters(shuffled);
          }
          setTimeLeft(TIMER_DURATION);
        }, 600);
      } else {
        setTimeout(() => {
          setHearts(0);
          setGameOver(true);
        }, 600);
      }
    }
  };

  // 4 Pics 1 Word helper functions
  const handleLetterClick = (letter, index) => {
    const question = phase1Questions[currentQuestion];
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

  // Spelling helper functions
  const handleSpellingInputChange = (e) => {
    setSpellingInput(e.target.value);
  };

  const speakWord = () => {
    const question = phase1Questions[currentQuestion];
    if (question.type === 'spelling') {
      const utterance = new SpeechSynthesisUtterance(question.correct);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Reading Comprehension helper functions
  const handleDragStart = (e, item, type) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.setData('type', type);
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    const type = e.dataTransfer.getData('type');
    
    if (item && (type === 'any' || zone === type)) {
      setDraggedItems(prev => ({
        ...prev,
        [zone]: [item] // Only allow one item per zone
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputSubmit = (e) => {
    if (phase !== 'battle2' || e.key !== 'Enter') return;
    const answer = userInput.trim().toLowerCase();
    const correctAnswer = phase2Questions[currentQuestion].answer.toLowerCase();
    setShowResult(true);
    if (answer === correctAnswer) {
      // Adventurer attacks first
      setAdventurerState('attack');
      setTimeout(() => {
        setAdventurerState('idle');
        // Then Grammowl gets hurt
        setMonsterDamaged(true);
        setDysauronState('hurt');
        setTimeout(() => {
          setMonsterDamaged(false);
          setDysauronState('idle');
        }, 500);
      }, 300);
      if (currentQuestion === phase2Questions.length - 1) {
        setMonsterHP(0);
        setDysauronState('death');
        setTimeout(() => {
          setPhase('defeatDialogue');
          setDialogueIdx(0);
        }, 1000);
      } else {
        setMonsterHP(hp => Math.max(0, hp - 20));
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setUserInput('');
          setShowResult(false);
          setTimeLeft(PHASE2_TIMER_DURATION);
        }, 600);
      }
    } else {
      setUserDamaged(true);
      setDysauronState('attack');
      setTimeout(() => {
        setUserDamaged(false);
        setDysauronState('idle');
      }, 500);
      setTimeout(() => {
        setShowResult(false);
      }, 600);
      if (hearts > 1) {
        setTimeout(() => {
          setHearts(h => h - 1);
          setUserInput('');
          setTimeLeft(PHASE2_TIMER_DURATION);
        }, 600);
      } else {
        setTimeout(() => {
          setHearts(0);
          setGameOver(true);
        }, 600);
      }
    }
  };

  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserInput('');
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    // Reset diverse gameplay states
    setSelectedLetters([]);
    setAvailableLetters([]);
    setSpellingInput('');
    setDraggedItems({ causes: [], effects: [] });
    setPhase('battle1');
    setDysauronState('idle');
    setAdventurerState('idle');
  };

  const handleRetryWholeLevel = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserInput('');
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    // Reset diverse gameplay states
    setSelectedLetters([]);
    setAvailableLetters([]);
    setSpellingInput('');
    setDraggedItems({ causes: [], effects: [] });
    setPhase('dialogue');
    setDialogueIdx(0);
    setDysauronState('idle');
    setAdventurerState('idle');
  };

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          console.log('🎯 Saving Dysauron progress:', { levelName: "Dysauron", completed: true, starsEarned: hearts });
          
          // Save level progress
          const response = await axios.post('/api/adventure/level-progress/save', {
            levelName: "Dysauron",
            completed: true,
            starsEarned: hearts
          }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          
          console.log('✅ Dysauron progress saved successfully:', response.data);
          
          // Automatically create Shadow Isles island progress
          try {
            console.log('🏝️ Creating Shadow Isles island progress...');
            
            // Use the existing island progress update endpoint
            const shadowIslesResponse = await axios.post('/api/adventure/island-progress/The Shadow Isles/update', {
              completedLevel: 5,
              starsEarned: hearts
            }, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            });
            
            console.log('✅ Shadow Isles progress created:', shadowIslesResponse.data);
          } catch (shadowIslesError) {
            console.error('❌ Failed to create Shadow Isles progress:', shadowIslesError.response?.data || shadowIslesError.message);
          }
          
        } catch (e) {
          console.error('❌ Failed to save Dysauron progress:', e.response?.data || e.message);
        }
      }
      saveProgress();
    }
  }, [victory, hearts]);

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
        <PositionedMonster>
          {d.speaker === 'Dysauron' && <DysauronSprite state="idle" />}
        </PositionedMonster>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'midBattleDialogue') {
    const d = midBattleDialogue[dialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        <PositionedMonster>
          <DysauronSprite state="attack" />
        </PositionedMonster>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'defeatDialogue') {
    const d = defeatDialogue[dialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        <PositionedMonster>
          <DysauronSprite state="death" />
        </PositionedMonster>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'victoryDialogue') {
    const d = victoryDialogue[victoryDialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'battle1' || phase === 'battle2') {
    content = (
      <>
        <BattleAdventurer>
          <AdventurerSprite state={adventurerState} isDamaged={userDamaged} />
        </BattleAdventurer>
        <BattleMonster>
          <DysauronSprite state={dysauronState} isDamaged={monsterDamaged} />
        </BattleMonster>
        
        {/* HP UI */}
        <Box sx={{
          position: 'absolute',
          right: `calc(${CHARACTER_POSITIONS.BATTLE_DYSAURON_RIGHT} + 60px)`,
          bottom: `calc(${CHARACTER_POSITIONS.BATTLE_DYSAURON_BOTTOM} + 220px)`,
          zIndex: 10,
          transform: 'translateX(-50%)',
          // HP Bar positioning controls - adjust these values to move the HP bar
          top: '150px',    // Move up (negative) or down (positive)
          left: '1000px',   // Move left (negative) or right (positive)
        }}>
          <MonsterHPText>Dysauron HP</MonsterHPText>
          <MonsterHPBar>
            <MonsterHPFill hp={monsterHP} />
          </MonsterHPBar>
        </Box>
        <VS style={{ position: 'absolute', left: '50%', bottom: '250px', transform: 'translateX(-50%)', zIndex: 5 }}>VS</VS>
        <BattleBottomBar>
          {phase === 'battle1' ? (
            (() => {
              const question = phase1Questions[currentQuestion];
              
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
                            disableRipple
                            style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
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
                                  width: '50px', height: '50px', border: '2px solid #b8956f', borderRadius: '8px',
                                  background: selectedLetters[idx] ? 'linear-gradient(145deg, #f4e4c1, #e8d5a6)' : 'rgba(255,255,255,0.1)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold',
                                  color: selectedLetters[idx] ? '#5d4037' : '#ccc', cursor: selectedLetters[idx] ? 'pointer' : 'default',
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
                  
                case 'reading_comprehension':
                  return (
                    <ReadingContainer>
                      <PassageBox>
                        <Typography style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#f0f0f0' }}>
                          {question.passage}
                        </Typography>
                      </PassageBox>
                      <Typography style={{ color: '#f0f0f0', fontSize: '1.1rem', textAlign: 'center', marginBottom: '12px' }}>
                        Drag and drop to match cause and effect:
                      </Typography>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        {question.causeOptions.map((cause, idx) => (
                          <DragItem
                            key={`cause-${idx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, cause, 'any')}
                            style={{ fontSize: '0.75rem', padding: '6px 10px', minWidth: '120px', maxWidth: '140px', flexShrink: 0 }}
                          >
                            {cause}
                          </DragItem>
                        ))}
                        {question.effectOptions.map((effect, idx) => (
                          <DragItem
                            key={`effect-${idx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, effect, 'any')}
                            style={{ fontSize: '0.75rem', padding: '6px 10px', minWidth: '120px', maxWidth: '140px', flexShrink: 0 }}
                          >
                            {effect}
                          </DragItem>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <DragDropColumn>
                          <Typography style={{ color: '#f0f0f0', fontSize: '1rem', textAlign: 'center', marginBottom: '8px' }}>
                            CAUSE
                          </Typography>
                          <DropZone
                            onDrop={(e) => handleDrop(e, 'causes')}
                            onDragOver={handleDragOver}
                            style={{ background: draggedItems.causes.length > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0,0,0,0.2)' }}
                          >
                            {draggedItems.causes[0] || 'Drop cause here'}
                          </DropZone>
                        </DragDropColumn>
                        <DragDropColumn>
                          <Typography style={{ color: '#f0f0f0', fontSize: '1rem', textAlign: 'center', marginBottom: '8px' }}>
                            EFFECT
                          </Typography>
                          <DropZone
                            onDrop={(e) => handleDrop(e, 'effects')}
                            onDragOver={handleDragOver}
                            style={{ background: draggedItems.effects.length > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0,0,0,0.2)' }}
                          >
                            {draggedItems.effects[0] || 'Drop effect here'}
                          </DropZone>
                        </DragDropColumn>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <SubmitButton
                            onClick={handleSubmitAnswer}
                            disabled={showResult || draggedItems.causes.length < 1 || draggedItems.effects.length < 1}
                            style={{ margin: '0' }}
                          >
                            Submit Answer
                          </SubmitButton>
                        </div>
                      </div>
                    </ReadingContainer>
                  );
                  
                default:
                  return <Typography style={{ color: '#f0f0f0' }}>Unknown question type</Typography>;
              }
            })()
          ) : (
            <>
              <QuestionText>{phase2Questions[currentQuestion].question}</QuestionText>
              <InputField
                inputRef={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleInputSubmit}
                placeholder="Type your answer..."
                disabled={showResult}
              />
            </>
          )}
        </BattleBottomBar>
      </>
    );
  }

  return (
    <SceneContainer>
      <Ground />
      <TopBar>
        {(phase === 'battle1' || phase === 'battle2') ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <HeartIcon key={idx} filled={idx < hearts} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {(phase === 'battle1' || phase === 'battle2') ? (
          <TimerBox>
            <Typography style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', letterSpacing: '1px', lineHeight: 1 }}>TIMER</Typography>
            <Typography style={{ fontWeight: 900, fontSize: '1.3rem', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', letterSpacing: '0.5px', lineHeight: 1, marginTop: '2px' }}>{timeLeft}s</Typography>
          </TimerBox>
        ) : <div style={{ width: 90 }} />}
        <QuitButton variant="contained" onClick={() => setShowQuit(true)} startIcon={<CloseIcon />}>
          Quit
        </QuitButton>
      </TopBar>
      {content}
      <Dialog 
        open={showQuit} 
        onClose={() => setShowQuit(false)}
        PaperProps={{
          style: {
            background: 'linear-gradient(145deg, #fffbe6 0%, #f5f0e6 50%, #e8dcc6 100%)',
            borderRadius: '24px',
            border: '4px solid #b48a6e',
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
              color: '#3a2a1a',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(180,138,110,0.3)'
            }}
          >
            Are you sure you want to quit?
          </Typography>
          <Typography 
            align="center"
            style={{
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              color: '#5a4a3a',
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
            onClick={() => navigate('/shadow-isles')} 
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
            The monsters have defeated you!
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
            onClick={() => navigate('/shadow-isles')} 
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
      {victory && (
        <VictoryOverlay>
          <VictoryContainer elevation={12}>
            <Typography 
              style={{ 
                color: '#3a2a1a', 
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', 
                fontWeight: 700, 
                fontSize: '1.2rem', 
                marginBottom: 8, 
                textAlign: 'center', 
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(58,42,26,0.2)'
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
              You've defeated Dysauron!
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
              🦉 The final scroll is yours! The adventure is complete! 🦉
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/shadow-isles')}
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
              🏆 Return to Level Select
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
            <Button
              variant="outlined"
              onClick={() => navigate('/shadow-isles')}
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 50%, #e0e0e0 100%)',
                color: '#d32f2f',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontWeight: 700,
                borderRadius: '20px',
                padding: '14px 32px',
                margin: '8px 0',
                minWidth: '200px',
                fontSize: '1.1rem',
                border: '3px solid #d32f2f',
                boxShadow: '0 4px 16px rgba(211,47,47,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              🏠 Return to Hub
            </Button>
          </VictoryContainer>
        </VictoryOverlay>
      )}
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/shadow-isles')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
  };

export default JungleLushLevel5;