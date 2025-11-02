import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import MainAudioManager from '../../sound/MainAudioManager';
import TextToSpeechManager from '../../sound/TextToSpeechManager';

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
    type: "reading_comprehension",
    passage: "The committee's recommendations were comprehensive and well-researched. However, the board members' responses varied significantly. Some executives' concerns focused on implementation costs, while others questioned the data's validity. The shareholders' meeting would ultimately determine the proposal's fate.",
    causeOptions: ["Board members disagreed", "Data validity questioned", "Implementation costs high"],
    effectOptions: ["Varied responses occurred", "Proposal fate uncertain", "Committee worked harder"],
    correctMatches: [
      { cause: "Board members disagreed", effect: "Varied responses occurred" },
      { cause: "Data validity questioned", effect: "Proposal fate uncertain" }
    ]
  },
  {
    type: "4pics1word",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYGFt-v20OBMahAT3o4-m1ZtIPiGXR9__6Rw&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPm_nNMu3nsQ9xdHuMn0hVt3Hhw6hQZS6J_A&s", 
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzcgQ2LkGXLOV7RM7bA_GRssrKUye5FlYdYw&s",
      "https://t3.ftcdn.net/jpg/16/95/93/00/360_F_1695930033_8UDnIqoQyiWRq9HUxAouiz53VrmBkWxx.jpg"
    ],
    letters: "OCOLNIMESN",
    correct: "SEMICOLON"
  },
  {
    type: "reading_comprehension",
    passage: "The university's alumni had gathered for their annual reunion. Many alumni shared stories of their academic achievements, while the faculty members discussed curriculum changes. The evening's festivities included presentations about the institution's future initiatives.",
    causeOptions: ["Alumni gathered annually", "Faculty discussed changes", "Presentations were scheduled"],
    effectOptions: ["Stories were shared", "Curriculum evolved", "Future was planned"],
    correctMatches: [
      { cause: "Alumni gathered annually", effect: "Stories were shared" },
      { cause: "Faculty discussed changes", effect: "Curriculum evolved" }
    ]
  },
  {
    type: "spelling",
    definition: "The past perfect tense of 'write' - used to indicate an action completed before another past action.",
    correct: "WRITTEN"
  },
  {
    type: "reading_comprehension",
    passage: "The researchers had been analyzing the phenomena for months. Their hypotheses were based on multiple criteria, and the analyses revealed complex patterns. The team's conclusions would influence future studies in the field.",
    causeOptions: ["Researchers analyzed phenomena", "Hypotheses were formed", "Patterns were complex"],
    effectOptions: ["Analyses revealed patterns", "Conclusions were drawn", "Future studies influenced"],
    correctMatches: [
      { cause: "Researchers analyzed phenomena", effect: "Analyses revealed patterns" },
      { cause: "Patterns were complex", effect: "Conclusions were drawn" }
    ]
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
  background: 'linear-gradient(145deg, #8B4513, #A0522D)',
  color: 'white',
  border: '2px solid #D4A574',
  borderRadius: '12px',
  alignSelf: 'flex-end',
  marginRight: '20px',
  '&:hover': {
    background: 'linear-gradient(145deg, #A0522D, #8B4513)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(139,69,19,0.4)',
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
  const [grammowlState, setGrammowlState] = useState('idle');
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

  // Speak dialogue when it changes
  useEffect(() => {
    if (phase === 'dialogue' && dialogueSequence[dialogueIdx]) {
      const dialogue = dialogueSequence[dialogueIdx];
      const speaker = dialogue.speaker === 'User' ? 'Adventurer' : dialogue.speaker;
      TextToSpeechManager.speak(dialogue.text, speaker);
    }
    return () => {
      TextToSpeechManager.stop();
    };
  }, [dialogueIdx, phase]);

  // Speak mid-battle dialogue
  useEffect(() => {
    if (phase === 'midBattleDialogue' && midBattleDialogue[dialogueIdx]) {
      const dialogue = midBattleDialogue[dialogueIdx];
      TextToSpeechManager.speak(dialogue.text, dialogue.speaker);
    }
    return () => {
      TextToSpeechManager.stop();
    };
  }, [dialogueIdx, phase]);

  // Speak defeat dialogue
  useEffect(() => {
    if (phase === 'defeatDialogue' && defeatDialogue[dialogueIdx]) {
      const dialogue = defeatDialogue[dialogueIdx];
      TextToSpeechManager.speak(dialogue.text, dialogue.speaker);
    }
    return () => {
      TextToSpeechManager.stop();
    };
  }, [dialogueIdx, phase]);

  // Speak victory dialogue
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

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    TextToSpeechManager.stop();
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
        // SFX: correct answer
        try { MainAudioManager.playEffect('correct_answer'); } catch {}
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
        // SFX: wrong answer
        try { MainAudioManager.playEffect('wrong_answer'); } catch {}
        // Wrong answer - lose heart directly
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
      // SFX: correct answer
      try { MainAudioManager.playEffect('correct_answer'); } catch {}
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
      // SFX: wrong answer
      try { MainAudioManager.playEffect('wrong_answer'); } catch {}
      // Wrong answer - lose heart directly
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
          setSelectedLetters([]);
          setSpellingInput('');
          setDraggedItems({ causes: [], effects: [] });
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
      // SFX: correct answer
      try { MainAudioManager.playEffect('correct_answer'); } catch {}
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
      // SFX: wrong answer
      try { MainAudioManager.playEffect('wrong_answer'); } catch {}
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
    // Reset diverse gameplay states
    setSelectedLetters([]);
    setAvailableLetters([]);
    setSpellingInput('');
    setDraggedItems({ causes: [], effects: [] });
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
    // Reset diverse gameplay states
    setSelectedLetters([]);
    setAvailableLetters([]);
    setSpellingInput('');
    setDraggedItems({ causes: [], effects: [] });
    setPhase('dialogue');
    setDialogueIdx(0);
    setGrammowlState('idle');
    setAdventurerState('idle');
  };

  useEffect(() => {
    if (victory) {
      try { MainAudioManager.playEffect('level_completed'); } catch {}
    }
  }, [victory]);

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/adventure/level-progress/save', {
            levelName: "Grammowl",
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