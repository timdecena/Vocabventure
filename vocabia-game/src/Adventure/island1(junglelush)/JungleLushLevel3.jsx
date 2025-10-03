import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import MainAudioManager from '../../sound/MainAudioManager';

// Import sprite assets
import WizardIdle1 from '../AdventureAssets/Wizard/Idle_1.png';
import WizardIdle2 from '../AdventureAssets/Wizard/Idle_2.png';

import AdventurerIdle1 from '../AdventureAssets/Adventurer/Soldier-Idle_1.png';
import AdventurerIdle2 from '../AdventureAssets/Adventurer/Soldier-Idle_2.png';
import AdventurerIdle3 from '../AdventureAssets/Adventurer/Soldier-Idle_3.png';
import AdventurerIdle4 from '../AdventureAssets/Adventurer/Soldier-Idle_4.png';
import AdventurerAttack1 from '../AdventureAssets/Adventurer/Soldier-Attack01_1.png';
import AdventurerAttack2 from '../AdventureAssets/Adventurer/Soldier-Attack01_2.png';

import OrcIdle1 from '../AdventureAssets/Orc(Minion)/Orc-Idle_1.png';
import OrcIdle2 from '../AdventureAssets/Orc(Minion)/Orc-Idle_2.png';
import OrcIdle3 from '../AdventureAssets/Orc(Minion)/Orc-Idle_3.png';
import OrcIdle4 from '../AdventureAssets/Orc(Minion)/Orc-Idle_4.png';
import OrcIdle5 from '../AdventureAssets/Orc(Minion)/Orc-Idle_5.png';
import OrcIdle6 from '../AdventureAssets/Orc(Minion)/Orc-Idle_6.png';
import OrcAttack1 from '../AdventureAssets/Orc(Minion)/Orc-Attack02_1.png';
import OrcAttack2 from '../AdventureAssets/Orc(Minion)/Orc-Attack02_2.png';
import OrcAttack3 from '../AdventureAssets/Orc(Minion)/Orc-Attack02_3.png';
import OrcAttack4 from '../AdventureAssets/Orc(Minion)/Orc-Attack02_4.png';
import OrcAttack5 from '../AdventureAssets/Orc(Minion)/Orc-Attack02_5.png';
import OrcAttack6 from '../AdventureAssets/Orc(Minion)/Orc-Attack02_6.png';
import OrcHurt1 from '../AdventureAssets/Orc(Minion)/Orc-Hurt_1.png';
import OrcHurt2 from '../AdventureAssets/Orc(Minion)/Orc-Hurt_2.png';
import OrcHurt3 from '../AdventureAssets/Orc(Minion)/Orc-Hurt_3.png';
import OrcHurt4 from '../AdventureAssets/Orc(Minion)/Orc-Hurt_4.png';
import OrcDeath1 from '../AdventureAssets/Orc(Minion)/Orc-Death_1.png';
import OrcDeath2 from '../AdventureAssets/Orc(Minion)/Orc-Death_2.png';
import OrcDeath3 from '../AdventureAssets/Orc(Minion)/Orc-Death_3.png';
import OrcDeath4 from '../AdventureAssets/Orc(Minion)/Orc-Death_4.png';

import PluribogIdle1 from '../AdventureAssets/Pluribog/Toad_Idle_1.png';
import PluribogIdle2 from '../AdventureAssets/Pluribog/Toad_Idle_2.png';
import PluribogIdle3 from '../AdventureAssets/Pluribog/Toad_Idle_3.png';
import PluribogIdle4 from '../AdventureAssets/Pluribog/Toad_Idle_4.png';
import PluribogAttack1 from '../AdventureAssets/Pluribog/Toad_Attack_1.png';
import PluribogAttack2 from '../AdventureAssets/Pluribog/Toad_Attack_2.png';
import PluribogAttack3 from '../AdventureAssets/Pluribog/Toad_Attack_3.png';
import PluribogAttack4 from '../AdventureAssets/Pluribog/Toad_Attack_4.png';
import PluribogAttack5 from '../AdventureAssets/Pluribog/Toad_Attack_5.png';
import PluribogAttack6 from '../AdventureAssets/Pluribog/Toad_Attack_6.png';
import PluribogDamage1 from '../AdventureAssets/Pluribog/Toad_Damage_1.png';
import PluribogDamage2 from '../AdventureAssets/Pluribog/Toad_Damage_2.png';
import PluribogDamage3 from '../AdventureAssets/Pluribog/Toad_Damage_3.png';
import PluribogDeath1 from '../AdventureAssets/Pluribog/Toad_Death_1.png';
import PluribogDeath2 from '../AdventureAssets/Pluribog/Toad_Death_2.png';
import PluribogDeath3 from '../AdventureAssets/Pluribog/Toad_Death_3.png';
import PluribogDeath4 from '../AdventureAssets/Pluribog/Toad_Death_4.png';

const JUNGLE_BG = 'https://png.pngtree.com/background/20220727/original/pngtree-jungle-game-background-arcade-art-picture-image_1829537.jpg';

// Character positioning constants - adjust these to position characters
const CHARACTER_POSITIONS = {
  WIZARD_LEFT: '100px',
  WIZARD_BOTTOM: '100px',
  ADVENTURER_LEFT: '180px',
  ADVENTURER_BOTTOM: '5px',
  // Dialogue scene positioning - separate for each monster
  DIALOGUE_ORC_RIGHT: '50px',
  DIALOGUE_ORC_BOTTOM: '-20px', // ⭐ ADJUST THIS for Orc in dialogue
  DIALOGUE_PLURIBOG_RIGHT: '50px',
  DIALOGUE_PLURIBOG_BOTTOM: '50px', // ⭐ ADJUST THIS for Pluribog in dialogue
  // Battle scene positioning
  BATTLE_ADVENTURER_LEFT: '500px',
  BATTLE_ADVENTURER_BOTTOM: '120px',
  BATTLE_ORC_RIGHT: '420px',
  BATTLE_ORC_BOTTOM: '90px', // ⭐ ADJUST THIS for Orc in battle
  BATTLE_PLURIBOG_RIGHT: '420px',
  BATTLE_PLURIBOG_BOTTOM: '150px', // ⭐ ADJUST THIS for Pluribog in battle
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
  height: '160px', // Fixed height to match your reference
  padding: theme.spacing(3, 4),
  background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a6 50%, #dcc48a 100%)',
  color: '#3a2a1a',
  textAlign: 'left',
  borderRadius: '20px 20px 0 0',
  zIndex: 10, // Increased z-index but still below name tag
  boxShadow: '0 -4px 24px 4px rgba(0,0,0,0.25), 0 -8px 32px 2px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.6)',
  border: '3px solid #b8956f',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  boxSizing: 'border-box',
  overflow: 'visible', // Allow name tag to be visible outside the box
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
  zIndex: 100, // High but reasonable z-index
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(255,255,255,0.4)',
  minWidth: '80px',
  textAlign: 'center',
  display: 'block', // Ensure it's visible
  visibility: 'visible', // Force visibility
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
  minHeight: '180px', // Increased height to match dialogue box
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

// Animated Wizard Component with idle cycling
const WizardSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2);
    }, 1000); // Switch frames every 1 second
    
    return () => clearInterval(interval);
  }, []);

  const WizardImg = styled('img')({
    width: '180px', // Perfect size
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    // No bouncing - standing still
  });

  return <WizardImg src={currentFrame === 0 ? WizardIdle1 : WizardIdle2} {...props} />;
};

// Animated Adventurer Component with idle cycling and attack state
const AdventurerSprite = ({ state = 'idle', isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 4); // Cycle through 4 frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 2); // 2 attack frames
      }
    }, state === 'attack' ? 400 : 800); // Faster animation for attacks
    
    return () => clearInterval(interval);
  }, [state]);

  const getAdventurerFrame = () => {
    if (state === 'attack') {
      switch (currentFrame) {
        case 0: return AdventurerAttack1;
        case 1: return AdventurerAttack2;
        default: return AdventurerAttack1;
      }
    } else {
      // idle state
      switch (currentFrame) {
        case 0: return AdventurerIdle1;
        case 1: return AdventurerIdle2;
        case 2: return AdventurerIdle3;
        case 3: return AdventurerIdle4;
        default: return AdventurerIdle1;
      }
    }
  };

  const AdventurerImg = styled('img')(({ isDamaged }) => ({
    width: '280px', // Bigger to match better with wizard
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${shake} 0.5s ease-in-out, ${userFlash} 0.5s ease-in-out` : 'none',
    marginBottom: '0px', // Ensure it's aligned with the platform
  }));

  return <AdventurerImg src={getAdventurerFrame()} isDamaged={isDamaged} {...props} />;
};

// Animated Orc Sprite Component
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
        setCurrentFrame(prev => (prev + 1) % 4); // 4 death frames
      }
    }, 600); // Frame speed
    
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
          default: return OrcDeath1;
        }
      default: // idle
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

  const OrcImg = styled('img')(({ isDamaged, state }) => ({
    width: '350px', // Orc size
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none',
    transform: state === 'hurt' ? 'scaleX(1)' : 'scaleX(-1)', // Face adventurer when hurt, face away normally
  }));

  return <OrcImg src={getOrcFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

// Animated Pluribog Sprite Component
const PluribogSprite = ({ state, isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 4); // 4 idle frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 attack frames
      } else if (state === 'hurt') {
        setCurrentFrame(prev => (prev + 1) % 3); // 3 damage frames
      } else if (state === 'death') {
        setCurrentFrame(prev => (prev + 1) % 4); // 4 death frames
      }
    }, 600); // Frame speed
    
    return () => clearInterval(interval);
  }, [state]);

  const getPluribogFrame = () => {
    switch (state) {
      case 'attack':
        switch (currentFrame) {
          case 0: return PluribogAttack1;
          case 1: return PluribogAttack2;
          case 2: return PluribogAttack3;
          case 3: return PluribogAttack4;
          case 4: return PluribogAttack5;
          case 5: return PluribogAttack6;
          default: return PluribogAttack1;
        }
      case 'hurt':
        switch (currentFrame) {
          case 0: return PluribogDamage1;
          case 1: return PluribogDamage2;
          case 2: return PluribogDamage3;
          default: return PluribogDamage1;
        }
      case 'death':
        switch (currentFrame) {
          case 0: return PluribogDeath1;
          case 1: return PluribogDeath2;
          case 2: return PluribogDeath3;
          case 3: return PluribogDeath4;
          default: return PluribogDeath1;
        }
      default: // idle
        switch (currentFrame) {
          case 0: return PluribogIdle1;
          case 1: return PluribogIdle2;
          case 2: return PluribogIdle3;
          case 3: return PluribogIdle4;
          default: return PluribogIdle1;
        }
    }
  };

  const PluribogImg = styled('img')(({ isDamaged, state }) => ({
    width: '420px', // Larger Pluribog size for boss
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none',
    transform: state === 'hurt' ? 'scaleX(-1)' : 'scaleX(-1)', // Face adventurer when hurt, face left normally
  }));

  return <PluribogImg src={getPluribogFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

// Monster Sprite Wrapper Component
const MonsterSprite = ({ monster, state, isDamaged, ...props }) => {
  if (monster === 'orc') {
    return <OrcSprite state={state} isDamaged={isDamaged} {...props} />;
  } else if (monster === 'pluribog') {
    return <PluribogSprite state={state} isDamaged={isDamaged} {...props} />;
  }
  // Fallback to orc if unknown monster
  return <OrcSprite state={state} isDamaged={isDamaged} {...props} />;
};

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

// Dynamic dialogue monster positioning based on monster type
const PositionedMonster = styled(Box)(({ theme, monster }) => ({
  position: 'absolute',
  right: monster === 'orc' ? CHARACTER_POSITIONS.DIALOGUE_ORC_RIGHT : CHARACTER_POSITIONS.DIALOGUE_PLURIBOG_RIGHT,
  bottom: monster === 'orc' ? CHARACTER_POSITIONS.DIALOGUE_ORC_BOTTOM : CHARACTER_POSITIONS.DIALOGUE_PLURIBOG_BOTTOM,
  zIndex: 4,
}));

// Battle-specific positioning components
const BattleAdventurer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.BATTLE_ADVENTURER_LEFT,
  bottom: CHARACTER_POSITIONS.BATTLE_ADVENTURER_BOTTOM,
  zIndex: 4,
}));

// Dynamic battle monster positioning based on monster type
const BattleMonster = styled(Box)(({ theme, monster }) => ({
  position: 'absolute',
  right: monster === 'orc' ? CHARACTER_POSITIONS.BATTLE_ORC_RIGHT : CHARACTER_POSITIONS.BATTLE_PLURIBOG_RIGHT,
  bottom: monster === 'orc' ? CHARACTER_POSITIONS.BATTLE_ORC_BOTTOM : CHARACTER_POSITIONS.BATTLE_PLURIBOG_BOTTOM,
  zIndex: 4,
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  width: '900px',
  maxWidth: '90vw',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '130px', // Position on top of the platform (90px ground + 40px height)
  height: '250px', // More room for larger sprites
  zIndex: 3,
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

const dialogueSequence = [
  { speaker: 'Wizard', text: "We've entered Pluribog's Pit. Once, this land echoed with cheerful learning songs… now it reeks of confusion." },
  { speaker: 'Wizard', text: "Pluribog, the Bog Beast of Broken Words, lies ahead. He is the spirit of grammatical neglect—every misused plural breathes new life into him." },
  { speaker: 'Adventurer', text: "Wait—this place was a school?" },
  { speaker: 'Wizard', text: "Indeed. A great academy of grammar once stood at the center… until Pluribog emerged from the swamp. He swallowed every sentence, twisted every textbook. Now, nothing is singular. Or plural. Or anything at all." },
  { speaker: 'Adventurer', text: "Then I guess it's time to retake the test." },
  { speaker: 'Pluribog', text: "Sssssssssingular… pluuuuuuural… Who cares what's many or one? I prefer 'gooses' and 'mices' and 'sheeps'! Hehehe! You've come for the scroll? Foolish whelp. Drown in my grammar muck!" },
  { speaker: 'Orc', text: "Time to test your word-counting skills, 'hero'! If you say 'tooths' instead of 'teeth', I win! Let's begin, word-warrior!" },
];
const orcQuestions = [
  {
    type: "multiple_choice",
    question: "Choose the correct plural form: 'There are many ___ in the pond.'",
    options: ['fishs', 'fishes', 'fish'],
    correctAnswer: 2
  },
  {
    type: "4pics1word",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIcjVhgU-MNB6bRzGDTKOR7HtutPXA-xjSPA&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcvBdfECXLoN0PTIt7-HNUO9QsfKZ8H3KJiVctQECVM3CZ-OfhZgXZI2_gmmHl8n9nKp4&usqp=CAU",
      "https://i.pinimg.com/736x/31/a8/27/31a827800e24ade8e24313037a6b70a8.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvJWsIejMdRhck5ZPOJTEg0t2ESyb5zWrqwA&s"
    ],
    letters: "SKCUDKBIR",
    correct: "DUCKS"
  },
  {
    type: "spelling",
    definition: "The plural form of 'child' - young human beings.",
    correct: "CHILDREN"
  }
];
const prePluribogDialogue = [
  { speaker: 'Adventurer', text: "Tough orc warrior. Not bad, but I've handled worse." },
  { speaker: 'Pluribog', text: "You defeated my minion. Impressive. But I am the pit! I am the confusion! I AM THE MISPLACED 'S'! Come then, chosen one. Let's see if your mind is as sharp as your tongue!" },
];
const pluribogQuestions = [
  {
    type: "reading_comprehension",
    passage: "The farmer counted his animals. He had three sheep, five geese, and two oxen in the field. The children helped him feed all the animals.",
    causeOptions: ["Farmer counted animals", "Children helped", "Animals were hungry"],
    effectOptions: ["He knew how many he had", "Animals were fed", "Field was organized"],
    correctMatches: [
      { cause: "Farmer counted animals", effect: "He knew how many he had" },
      { cause: "Children helped", effect: "Animals were fed" }
    ]
  },
  {
    type: "4pics1word",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMJioYqbYRnhG4JeFGO5d1ZcT0aSwwVJZGeg&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSoJNC20IEZg0_ppCIYTWPCugD0dCbMkumBA&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRISm1kCYXogfr47bfj5L0cLI-FRy_ZzOYscQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStibwcdKQlPCuhqCjmJcF-35lBGoqMGM7uBw&s"
    ],
    letters: "EESEGKIRD",
    correct: "GEESE"
  },
  {
    type: "reading_comprehension",
    passage: "The mice ran through the house. They found some crumbs in the kitchen. The women screamed when they saw so many mice running around.",
    causeOptions: ["Mice found crumbs", "Women saw mice", "Mice ran around"],
    effectOptions: ["They stayed in kitchen", "Women screamed", "House was messy"],
    correctMatches: [
      { cause: "Mice found crumbs", effect: "They stayed in kitchen" },
      { cause: "Women saw mice", effect: "Women screamed" }
    ]
  },
  {
    type: "spelling",
    definition: "The plural form of 'tooth' - hard structures in the mouth used for biting.",
    correct: "TEETH"
  },
  {
    type: "multiple_choice",
    question: "What is the plural of 'phenomenon'?",
    options: ['phenomenons', 'phenomena', 'phenomenae'],
    correctAnswer: 1
  }
];
const MONSTER_MAX_HP = 100;

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
  fontFamily: 'monospace',
  textAlign: 'center',
}));
const VictoryButton = styled(Button)(({ theme }) => ({
  fontWeight: 700,
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  borderRadius: 16,
  margin: '12px 0',
  minWidth: 180,
  boxShadow: '0 2px 8px #b48a6e44',
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

const JungleLushLevel3 = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('dialogue');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [prePluribogDialogueIdx, setPrePluribogDialogueIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(100);
  const [monster, setMonster] = useState('orc');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const idleTimeout = useRef(null);
  const [orcState, setOrcState] = useState('idle');
  const [pluribogState, setPluribogState] = useState('idle');
  const [adventurerState, setAdventurerState] = useState('idle');
  // New states for diverse gameplay
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [spellingInput, setSpellingInput] = useState('');
  const [draggedItems, setDraggedItems] = useState({ causes: [], effects: [] });

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'prepluribog') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase, prePluribogDialogueIdx]);

  useEffect(() => {
    if ((phase === 'orc' || phase === 'pluribog') && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if ((phase === 'orc' || phase === 'pluribog') && timeLeft === 0 && !victory && !gameOver) {
      if (hearts > 1) {
        setHearts(h => h - 1);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setHearts(0);
        setGameOver(true);
      }
    }
  }, [phase, timeLeft, victory, gameOver, hearts]);

  // Gameplay initialization useEffect
  useEffect(() => {
    if ((phase === 'orc' || phase === 'pluribog')) {
      const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
      if (questions[currentQuestion]) {
        const question = questions[currentQuestion];
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
  }, [currentQuestion, phase, monster]);

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueSequence.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('orc');
        setMonster('orc');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
      }
    } else if (phase === 'prepluribog') {
      if (prePluribogDialogueIdx < prePluribogDialogue.length - 1) {
        setPrePluribogDialogueIdx(prePluribogDialogueIdx + 1);
      } else {
        setPhase('pluribog');
        setMonster('pluribog');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  };

  // Answer handler for multiple choice questions
  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    // Use setTimeout to ensure state updates properly
    setTimeout(() => {
      const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
      const question = questions[currentQuestion];
      const isCorrect = idx === question.correctAnswer;
      setShowResult(true);
      
      if (isCorrect) {
        // SFX: correct answer
        try { MainAudioManager.playEffect('correct_answer'); } catch {}
        // Correct answer - damage monster
        setAdventurerState('attack');
        setTimeout(() => setAdventurerState('idle'), 500);
        
        if (monster === 'orc') {
          setOrcState('hurt');
          setTimeout(() => setOrcState('idle'), 500);
        } else {
          setPluribogState('hurt');
          setTimeout(() => setPluribogState('idle'), 500);
        }
        
        setMonsterDamaged(true);
        setTimeout(() => setMonsterDamaged(false), 500);
        
        setMonsterHP(hp => {
          const newHP = Math.max(0, hp - Math.floor(100 / questions.length));
          if (currentQuestion === questions.length - 1 || newHP === 0) {
            if (monster === 'orc') {
              setOrcState('death');
              setPhase('prepluribog');
              setPrePluribogDialogueIdx(0);
            } else {
              setPluribogState('death');
              setVictory(true);
            }
          }
          return newHP;
        });
        
        if (currentQuestion < questions.length - 1) {
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
        // Wrong answer - deduct time and potentially hearts
        const newTime = Math.max(0, timeLeft - 5);
        setTimeLeft(newTime);
        
        if (newTime === 0) {
          // Time ran out, lose heart
          if (monster === 'orc') {
            setOrcState('attack');
            setTimeout(() => setOrcState('idle'), 500);
          } else {
            setPluribogState('attack');
            setTimeout(() => setPluribogState('idle'), 500);
          }
          
          setUserDamaged(true);
          setTimeout(() => setUserDamaged(false), 500);
          
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
        } else {
          // Just reset the question
          setTimeout(() => {
            setSelectedAnswer(null);
            setShowResult(false);
          }, 1000);
        }
      }
    }, 10);
  };

  // Generic validation function for all question types
  const validateAnswer = () => {
    const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
    const question = questions[currentQuestion];
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

  // Generic submit handler for all question types
  const handleSubmitAnswer = () => {
    const isCorrect = validateAnswer();
    const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
    
    setShowResult(true);
    
    if (isCorrect) {
      // SFX: correct answer
      try { MainAudioManager.playEffect('correct_answer'); } catch {}
      // Correct answer - damage monster
      setAdventurerState('attack');
      setTimeout(() => setAdventurerState('idle'), 500);
      
      if (monster === 'orc') {
        setOrcState('hurt');
        setTimeout(() => setOrcState('idle'), 500);
      } else {
        setPluribogState('hurt');
        setTimeout(() => setPluribogState('idle'), 500);
      }
      
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(100 / questions.length));
        if (currentQuestion === questions.length - 1 || newHP === 0) {
          if (monster === 'orc') {
            setOrcState('death');
            setPhase('prepluribog');
            setPrePluribogDialogueIdx(0);
          } else {
            setPluribogState('death');
            setVictory(true);
          }
        }
        return newHP;
      });
      
      if (currentQuestion < questions.length - 1) {
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
      // Wrong answer - deduct time and potentially hearts
      const newTime = Math.max(0, timeLeft - 5);
      setTimeLeft(newTime);
      
      if (newTime === 0) {
        // Time ran out, lose heart
        if (monster === 'orc') {
          setOrcState('attack');
          setTimeout(() => setOrcState('idle'), 500);
        } else {
          setPluribogState('attack');
          setTimeout(() => setPluribogState('idle'), 500);
        }
        
        setUserDamaged(true);
        setTimeout(() => setUserDamaged(false), 500);
        
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
      } else {
        // Just reset the question
        setTimeout(() => {
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedLetters([]);
          setSpellingInput('');
          setDraggedItems({ causes: [], effects: [] });
          // Re-shuffle letters for 4pics1word
          const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
          const question = questions[currentQuestion];
          if (question.type === '4pics1word') {
            const shuffled = question.letters.split('').sort(() => Math.random() - 0.5);
            setAvailableLetters(shuffled);
          }
        }, 1000);
      }
    }
  };

  // 4 Pics 1 Word helper functions
  const handleLetterClick = (letter, index) => {
    const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
    const question = questions[currentQuestion];
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
    const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
    const question = questions[currentQuestion];
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

  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    // Reset diverse gameplay states
    setSelectedLetters([]);
    setAvailableLetters([]);
    setSpellingInput('');
    setDraggedItems({ causes: [], effects: [] });
    setOrcState('idle');
    setPluribogState('idle');
    setAdventurerState('idle');
    if (phase === 'pluribog') {
      setPhase('pluribog');
      setMonster('pluribog');
    } else {
      setPhase('orc');
      setMonster('orc');
    }
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
    setPhase('dialogue');
    setDialogueIdx(0);
    setPrePluribogDialogueIdx(0);
    setMonster('orc');
    setOrcState('idle');
    setPluribogState('idle');
    setAdventurerState('idle');
  };

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/adventure/level-progress/save', {
            levelName: "Pluribog's Pit",
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
  }, [victory]);

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
        <PositionedMonster monster={d.speaker === 'Pluribog' ? 'pluribog' : 'orc'}>
          {d.speaker === 'Pluribog' && <MonsterSprite monster="pluribog" state="idle" />}
          {d.speaker === 'Orc' && <MonsterSprite monster="orc" state="idle" />}
        </PositionedMonster>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <DialogueText variant="h6" gutterBottom>
            {d.text}
          </DialogueText>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'orc' || phase === 'pluribog') {
    const questions = monster === 'orc' ? orcQuestions : pluribogQuestions;
    const monsterName = monster === 'orc' ? 'Orc Minion' : 'Pluribog';
    content = (
      <>
        <>
          <BattleAdventurer>
            <AdventurerSprite state={adventurerState} isDamaged={userDamaged} />
          </BattleAdventurer>
          <BattleMonster monster={monster}>
            <MonsterSprite monster={monster} state={monster === 'orc' ? orcState : pluribogState} isDamaged={monsterDamaged} />
          </BattleMonster>
          {/* HP UI positioned independently of monster sprite */}
          <Box sx={{
            position: 'absolute',
            right: monster === 'orc' ? 
              `calc(${CHARACTER_POSITIONS.BATTLE_ORC_RIGHT} + 60px)` : 
              `calc(${CHARACTER_POSITIONS.BATTLE_PLURIBOG_RIGHT} + 60px)`,
            bottom: monster === 'orc' ? 
              `calc(${CHARACTER_POSITIONS.BATTLE_ORC_BOTTOM} + 220px)` : 
              `calc(${CHARACTER_POSITIONS.BATTLE_PLURIBOG_BOTTOM} + 250px)`,
            zIndex: 10,
            transform: 'translateX(-50%)',
          }}>
            <MonsterHPText>{monsterName} HP</MonsterHPText>
            <MonsterHPBar>
              <MonsterHPFill hp={monsterHP} />
            </MonsterHPBar>
          </Box>
          <VS style={{ position: 'absolute', left: '50%', bottom: '250px', transform: 'translateX(-50%)', zIndex: 5 }}>VS</VS>
        </>
        <BattleBottomBar>
          {(() => {
            const question = questions[currentQuestion];
            
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
          })()}
        </BattleBottomBar>
      </>
    );
  } else if (phase === 'prepluribog') {
    const d = prePluribogDialogue[prePluribogDialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        <PositionedMonster monster={d.speaker === 'Pluribog' ? 'pluribog' : 'orc'}>
          {d.speaker === 'Pluribog' && <MonsterSprite monster="pluribog" state="idle" />}
          {d.speaker === 'Orc' && <MonsterSprite monster="orc" state="idle" />}
        </PositionedMonster>
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
        {(phase === 'orc' || phase === 'pluribog') ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <HeartIcon key={idx} filled={idx < hearts} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {(phase === 'orc' || phase === 'pluribog') ? (
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
              You've defeated Pluribog!
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
              🐸 The pit is calm, and the scroll is yours! 🐸
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/jungle-lush/level4')}
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
              🚀 Go to Next Level
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

export default JungleLushLevel3; 