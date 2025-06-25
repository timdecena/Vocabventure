import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import '../../styles/MapView.css';
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

// Grammowl Animation Frames
import GrammowlIdle1 from '../AdventureAssets/Grammowl/crow_idle_1.png';
import GrammowlIdle2 from '../AdventureAssets/Grammowl/crow_idle_2.png';
import GrammowlIdle3 from '../AdventureAssets/Grammowl/crow_idle_3.png';
import GrammowlIdle4 from '../AdventureAssets/Grammowl/crow_idle_4.png';
import GrammowlAttack1 from '../AdventureAssets/Grammowl/crow_attack_1.png';
import GrammowlAttack2 from '../AdventureAssets/Grammowl/crow_attack_2.png';
import GrammowlAttack3 from '../AdventureAssets/Grammowl/crow_attack_3.png';
import GrammowlAttack4 from '../AdventureAssets/Grammowl/crow_attack_4.png';
import GrammowlAttack5 from '../AdventureAssets/Grammowl/crow_attack_5.png';
import GrammowlDamage1 from '../AdventureAssets/Grammowl/crow_damage_1.png';
import GrammowlDamage2 from '../AdventureAssets/Grammowl/crow_damage_2.png';
import GrammowlDamage3 from '../AdventureAssets/Grammowl/crow_damage_3.png';
import GrammowlDeath1 from '../AdventureAssets/Grammowl/crow_death2_1.png';
import GrammowlDeath2 from '../AdventureAssets/Grammowl/crow_death2_2.png';
import GrammowlDeath3 from '../AdventureAssets/Grammowl/crow_death2_3.png';
import GrammowlDeath4 from '../AdventureAssets/Grammowl/crow_death2_4.png';
import GrammowlDeath5 from '../AdventureAssets/Grammowl/crow_death2_5.png';

const JUNGLE_BG = 'https://i.ytimg.com/vi/-NZKGTeJzec/maxresdefault.jpg';

// Character positioning constants
const CHARACTER_POSITIONS = {
  WIZARD_LEFT: '100px',
  WIZARD_BOTTOM: '100px',
  ADVENTURER_LEFT: '180px',
  ADVENTURER_BOTTOM: '5px',
  // Dialogue scene positioning
  DIALOGUE_GRAMMOWL_RIGHT: '50px',
  DIALOGUE_GRAMMOWL_BOTTOM: '10px',
  // Battle scene positioning
  BATTLE_ADVENTURER_LEFT: '500px',
  BATTLE_ADVENTURER_BOTTOM: '150px',
  BATTLE_GRAMMOWL_RIGHT: '420px',
  BATTLE_GRAMMOWL_BOTTOM: '160px',
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
  backgroundImage: `url(${JUNGLE_BG})`,
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
  right: CHARACTER_POSITIONS.DIALOGUE_GRAMMOWL_RIGHT,
  bottom: CHARACTER_POSITIONS.DIALOGUE_GRAMMOWL_BOTTOM,
  zIndex: 4,
}));

// Battle-specific positioning components
const BattleAdventurer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.BATTLE_ADVENTURER_LEFT,
  bottom: CHARACTER_POSITIONS.BATTLE_ADVENTURER_BOTTOM,
  zIndex: 4,
}));

const BattleMonster = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.BATTLE_GRAMMOWL_RIGHT,
  bottom: CHARACTER_POSITIONS.BATTLE_GRAMMOWL_BOTTOM,
  zIndex: 4,
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

// Animated Grammowl Sprite Component
const GrammowlSprite = ({ state, isDamaged, ...props }) => {
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

  const getGrammowlFrame = () => {
    switch (state) {
      case 'attack':
        switch (currentFrame) {
          case 0: return GrammowlAttack1;
          case 1: return GrammowlAttack2;
          case 2: return GrammowlAttack3;
          case 3: return GrammowlAttack4;
          case 4: return GrammowlAttack5;
          default: return GrammowlAttack1;
        }
      case 'hurt':
        switch (currentFrame) {
          case 0: return GrammowlDamage1;
          case 1: return GrammowlDamage2;
          case 2: return GrammowlDamage3;
          default: return GrammowlDamage1;
        }
      case 'death':
        switch (currentFrame) {
          case 0: return GrammowlDeath1;
          case 1: return GrammowlDeath2;
          case 2: return GrammowlDeath3;
          case 3: return GrammowlDeath4;
          case 4: return GrammowlDeath5;
          default: return GrammowlDeath1;
        }
      default: // idle
        switch (currentFrame) {
          case 0: return GrammowlIdle1;
          case 1: return GrammowlIdle2;
          case 2: return GrammowlIdle3;
          case 3: return GrammowlIdle4;
          default: return GrammowlIdle1;
        }
    }
  };

  const GrammowlImg = styled('img')(({ isDamaged, state }) => ({
    width: '450px', // Large boss size
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none',
    transform: state === 'hurt' ? 'scaleX(-1)' : 'scaleX(1)', // Face adventurer when hurt
  }));

  return <GrammowlImg src={getGrammowlFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

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

const BattleSpritesRow = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  marginBottom: '200px',
  zIndex: 20,
  pointerEvents: 'none',
  minHeight: '300px',
  position: 'relative',
}));

const MonsterSpriteWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

const BattleBottomBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  background: 'linear-gradient(180deg, rgba(139,69,19,0.95) 0%, rgba(101,67,33,0.98) 50%, rgba(62,39,35,1) 100%)',
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

const Star = styled('span')(({ filled }) => ({
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
  { speaker: "Wizard", text: "This is it… the Tower of Grammowl. The heart of Jungle Lush and the resting place of the first Scroll of Knowledge." },
  { speaker: "Wizard", text: "He has watched your battles. He knows you're coming. Be ready, adventurer… this will not be like before." },
  { speaker: "Adventurer", text: "I've beaten his underlings. I've walked through webs, swamps, and twisted tenses. Let's finish this." },
  { speaker: "Grammowl", text: "You… child of prophecies and misplaced confidence." },
  { speaker: "Grammowl", text: "Did you enjoy playing with my pets? Did their whimpers delight you as you erased them one by one?" },
  { speaker: "Grammowl", text: "They were my voice. My grammar incarnate. And now you've come for my scroll?" },
  { speaker: "Grammowl", text: "You may have passed their petty quizzes, but I am the architect of confusion." },
  { speaker: "Grammowl", text: "Come, chosen one. Let's see if your mind can fly as high as your ego." }
];

const midBattleDialogue = [
  { speaker: "Grammowl", text: "Enough!! Enough of these… child's riddles!" },
  { speaker: "Grammowl", text: "You dare burn half my feathers? You dare light the flames of grammar in my tower?" },
  { speaker: "Grammowl", text: "Let me show you real confusion. Let me strip away your choices. Answer… without a net!" }
];

const defeatDialogue = [
  { speaker: "Grammowl", text: "No… how did you… a mere child… bend the rules so flawlessly?" },
  { speaker: "Grammowl", text: "The scroll… I guarded it for him… He said no one would come…" },
  { speaker: "Grammowl", text: "You've only won a page of the story…" },
  { speaker: "Grammowl", text: "He's still watching… waiting in the shadows… and he is far beyond your comprehension!" },
  { speaker: "Grammowl", text: "HE… will not be as merciful… *faints" }
];

const victoryDialogue = [
  { speaker: "Adventurer", text: "That… that was intense. He almost had me." },
  { speaker: "Wizard", text: "Grammowl… the guardian of the Scroll of Grammar. Once a wise protector, now twisted by the shadows…" },
  { speaker: "Adventurer", text: "He said he served someone—'him'. Who is he talking about?" },
  { speaker: "Wizard", text: "The one whose name we dare not speak lightly… A force that once slept beneath the ruins of forgotten knowledge. Dysauron." },
  { speaker: "Adventurer", text: "Dysauron? That doesn't sound like your average villain…" },
  { speaker: "Wizard", text: "He is the bane of learning, the devourer of words, the shadow that seeks to silence every spark of understanding. Long ago, we locked away his power within the Scrolls of Knowledge…" },
  { speaker: "Adventurer", text: "And now they're scattered. One scroll down… four to go." },
  { speaker: "Wizard", text: "You've passed your first true trial, brave one. But what lies ahead will test your wit, will, and wisdom far beyond this." },
  { speaker: "Adventurer", text: "Then I'll keep going. For the villages… for Vocabia." },
  { speaker: "Wizard", text: "Then let the Scroll of Grammar light your path forward. The shores of spelling await." }
];

const phase1Questions = [
  {
    question: 'Which sentence uses punctuation correctly?',
    options: [
      'She said, "Let\'s leave now".',
      'She said "Let\'s leave now."',
      'She said, "Let\'s leave now".',
      'She said, "Let\'s leave now."'
    ],
    correctAnswer: 3
  },
  {
    question: 'Choose the correct subject-verb agreement:',
    options: [
      'The data was incorrect.',
      'The data were incorrect.',
      'The data is incorrect.',
      'The data has been incorrect.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Identify the grammatically correct sentence:',
    options: [
      'Neither the teacher nor the students was present.',
      'Neither the teacher nor the students were present.',
      'Neither the teacher or the students were present.',
      'Neither the teacher nor the student were present.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Where does the semicolon go?',
    options: [
      'I have a big test tomorrow; I can\'t go out tonight.',
      'I have a big test; tomorrow I can\'t go out tonight.',
      'I have; a big test tomorrow I can\'t go out tonight.',
      'I have a big test tomorrow, I can\'t go out tonight.'
    ],
    correctAnswer: 0
  },
  {
    question: 'Correct sentence with modifiers:',
    options: [
      'Running quickly, the finish line was in sight.',
      'The finish line was in sight, running quickly.',
      'Running quickly, I saw the finish line.',
      'I saw the finish line running quickly.'
    ],
    correctAnswer: 2
  }
];

const phase2Questions = [
  {
    question: 'Fill in the blank with the correct punctuation:\nShe whispered ___ "We\'re not alone."',
    answer: ','
  },
  {
    question: 'What is the correct verb to complete this sentence?\nThe books on the table ___ new.',
    answer: 'are'
  },
  {
    question: 'Fix the verb:\nNeither of them ___ coming.',
    answer: 'is'
  },
  {
    question: 'Fill in the blank with the correct article:\n___ apple a day keeps the doctor away.',
    answer: 'An'
  },
  {
    question: 'Choose the correct word:\nTheir voices echo in ___ memory.',
    answer: 'my'
  }
];

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
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 5;
  const inputRef = useRef(null);
  // Sprite animation states
  const [grammowlState, setGrammowlState] = useState('idle');
  const [adventurerState, setAdventurerState] = useState('idle');

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

  const handleAnswer = (idx) => {
    if (phase !== 'battle1') return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === phase1Questions[currentQuestion].correctAnswer) {
      // Adventurer attacks first
      setAdventurerState('attack');
      setTimeout(() => {
        setAdventurerState('idle');
        // Then Grammowl gets hurt
        setMonsterDamaged(true);
        setGrammowlState('hurt');
        setTimeout(() => {
          setMonsterDamaged(false);
          setGrammowlState('idle');
        }, 500);
      }, 300);
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - 20); // 5 hits to defeat in phase 1
        if (currentQuestion === 4) {
          setGrammowlState('hurt');
          setTimeout(() => {
            setPhase('midBattleDialogue');
            setDialogueIdx(0);
            setGrammowlState('idle');
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
      setUserDamaged(true);
      setGrammowlState('attack');
      setTimeout(() => {
        setUserDamaged(false);
        setGrammowlState('idle');
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
        setGrammowlState('hurt');
        setTimeout(() => {
          setMonsterDamaged(false);
          setGrammowlState('idle');
        }, 500);
      }, 300);
      if (currentQuestion === phase2Questions.length - 1) {
        setMonsterHP(0);
        setGrammowlState('death');
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
      setGrammowlState('attack');
      setTimeout(() => {
        setUserDamaged(false);
        setGrammowlState('idle');
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
    setPhase('battle1');
    setGrammowlState('idle');
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
    setPhase('dialogue');
    setDialogueIdx(0);
    setGrammowlState('idle');
    setAdventurerState('idle');
  };

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/progress/levels/5', {
            starsEarned: hearts,
            completed: true
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
  }, [victory]);

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
          {d.speaker === 'Grammowl' && <GrammowlSprite state="idle" />}
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
          <GrammowlSprite state="attack" />
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
          <GrammowlSprite state="death" />
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
          <MonsterHPText>Grammowl HP</MonsterHPText>
          <MonsterHPBar>
            <MonsterHPFill hp={monsterHP} />
          </MonsterHPBar>
          <GrammowlSprite state={grammowlState} isDamaged={monsterDamaged} />
        </BattleMonster>
        <VS style={{ position: 'absolute', left: '50%', bottom: '250px', transform: 'translateX(-50%)', zIndex: 5 }}>VS</VS>
        <BattleBottomBar>
          <QuestionText>
            {phase === 'battle1' ? phase1Questions[currentQuestion].question : phase2Questions[currentQuestion].question}
          </QuestionText>
          {phase === 'battle1' ? (
            <ChoicesGrid count={4}>
              {phase1Questions[currentQuestion].options.map((option, idx) => (
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
          ) : (
            <InputField
              inputRef={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleInputSubmit}
              placeholder="Type your answer..."
              disabled={showResult}
            />
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
            onClick={() => navigate('/jungle-lush')} 
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
            onClick={() => navigate('/jungle-lush')} 
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
              You've defeated Grammowl!
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
              onClick={() => navigate('/jungle-lush')}
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
              onClick={() => navigate('/jungle-lush')}
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
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/jungle-lush')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
  };

export default JungleLushLevel5;