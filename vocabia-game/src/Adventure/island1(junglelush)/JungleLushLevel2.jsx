import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import '../../styles/MapView.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Character Assets
// Orc Animation Frames
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

// Tensaphant Animation Frames
import TensaphantIdle1 from '../AdventureAssets/Tensaphant/Idle_1.png';
import TensaphantIdle2 from '../AdventureAssets/Tensaphant/Idle_2.png';
import TensaphantIdle3 from '../AdventureAssets/Tensaphant/Idle_3.png';
import TensaphantIdle4 from '../AdventureAssets/Tensaphant/Idle_4.png';
import TensaphantAttack1 from '../AdventureAssets/Tensaphant/Attack2_1.png';
import TensaphantAttack2 from '../AdventureAssets/Tensaphant/Attack2_2.png';
import TensaphantAttack3 from '../AdventureAssets/Tensaphant/Attack2_3.png';
import TensaphantAttack4 from '../AdventureAssets/Tensaphant/Attack2_4.png';
import TensaphantAttack5 from '../AdventureAssets/Tensaphant/Attack2_5.png';
import TensaphantAttack6 from '../AdventureAssets/Tensaphant/Attack2_6.png';
import TensaphantHurt1 from '../AdventureAssets/Tensaphant/Hurt_1.png';
import TensaphantHurt2 from '../AdventureAssets/Tensaphant/Hurt_2.png';
import TensaphantHurt3 from '../AdventureAssets/Tensaphant/Hurt_3.png';
import TensaphantHurt4 from '../AdventureAssets/Tensaphant/Hurt_4.png';
import TensaphantDeath1 from '../AdventureAssets/Tensaphant/Death_1.png';
import TensaphantDeath2 from '../AdventureAssets/Tensaphant/Death_2.png';
import TensaphantDeath3 from '../AdventureAssets/Tensaphant/Death_3.png';
import TensaphantDeath4 from '../AdventureAssets/Tensaphant/Death_4.png';
import TensaphantDeath5 from '../AdventureAssets/Tensaphant/Death_5.png';
import TensaphantDeath6 from '../AdventureAssets/Tensaphant/Death_6.png';

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
  DIALOGUE_TENSAPHANT_RIGHT: '50px',
  DIALOGUE_TENSAPHANT_BOTTOM: '120px', // ⭐ ADJUST THIS for Tensaphant in dialogue
  // Battle scene positioning
  BATTLE_ADVENTURER_LEFT: '500px',
  BATTLE_ADVENTURER_BOTTOM: '120px',
  BATTLE_ORC_RIGHT: '420px',
  BATTLE_ORC_BOTTOM: '90px', // ⭐ ADJUST THIS for Orc in battle
  BATTLE_TENSAPHANT_RIGHT: '420px',
  BATTLE_TENSAPHANT_BOTTOM: '250px', // ⭐ ADJUST THIS for Tensaphant in battle
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
  bottom: '130px', // Position on top of the platform (90px ground + 40px height)
  height: '250px', // More room for larger sprites
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

// Dynamic dialogue monster positioning based on monster type
const PositionedMonster = styled(Box)(({ theme, monster }) => ({
  position: 'absolute',
  right: monster === 'orc' ? CHARACTER_POSITIONS.DIALOGUE_ORC_RIGHT : CHARACTER_POSITIONS.DIALOGUE_TENSAPHANT_RIGHT,
  bottom: monster === 'orc' ? CHARACTER_POSITIONS.DIALOGUE_ORC_BOTTOM : CHARACTER_POSITIONS.DIALOGUE_TENSAPHANT_BOTTOM,
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
  right: monster === 'orc' ? CHARACTER_POSITIONS.BATTLE_ORC_RIGHT : CHARACTER_POSITIONS.BATTLE_TENSAPHANT_RIGHT,
  bottom: monster === 'orc' ? CHARACTER_POSITIONS.BATTLE_ORC_BOTTOM : CHARACTER_POSITIONS.BATTLE_TENSAPHANT_BOTTOM,
  zIndex: 4,
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
        setCurrentFrame(prev => (prev + 1) % 6); // Cycle through 6 frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 attack frames
      }
    }, state === 'attack' ? 400 : 800); // Faster animation for attacks
    
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
      // idle state
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
    transform: state === 'hurt' ? 'scaleX(-1)' : 'scaleX(-1)', // Face adventurer when hurt, face away normally
  }));

  return <OrcImg src={getOrcFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

// Animated Tensaphant Sprite Component
const TensaphantSprite = ({ state, isDamaged, ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 4); // 4 idle frames
      } else if (state === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 attack frames
      } else if (state === 'hurt') {
        setCurrentFrame(prev => (prev + 1) % 4); // 4 hurt frames
      } else if (state === 'death') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 death frames
      }
    }, 600); // Frame speed
    
    return () => clearInterval(interval);
  }, [state]);

  const getTensaphantFrame = () => {
    switch (state) {
      case 'attack':
        switch (currentFrame) {
          case 0: return TensaphantAttack1;
          case 1: return TensaphantAttack2;
          case 2: return TensaphantAttack3;
          case 3: return TensaphantAttack4;
          case 4: return TensaphantAttack5;
          case 5: return TensaphantAttack6;
          default: return TensaphantAttack1;
        }
      case 'hurt':
        switch (currentFrame) {
          case 0: return TensaphantHurt1;
          case 1: return TensaphantHurt2;
          case 2: return TensaphantHurt3;
          case 3: return TensaphantHurt4;
          default: return TensaphantHurt1;
        }
      case 'death':
        switch (currentFrame) {
          case 0: return TensaphantDeath1;
          case 1: return TensaphantDeath2;
          case 2: return TensaphantDeath3;
          case 3: return TensaphantDeath4;
          case 4: return TensaphantDeath5;
          case 5: return TensaphantDeath6;
          default: return TensaphantDeath1;
        }
      default: // idle
        switch (currentFrame) {
          case 0: return TensaphantIdle1;
          case 1: return TensaphantIdle2;
          case 2: return TensaphantIdle3;
          case 3: return TensaphantIdle4;
          default: return TensaphantIdle1;
        }
    }
  };

  const TensaphantImg = styled('img')(({ isDamaged, state }) => ({
    width: '420px', // Larger Tensaphant size for boss
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    animation: isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none',
    transform: state === 'hurt' ? 'scaleX(-1)' : 'scaleX(1)', // Face adventurer when hurt, face left normally
  }));

  return <TensaphantImg src={getTensaphantFrame()} isDamaged={isDamaged} state={state} {...props} />;
};

// Monster Sprite Wrapper Component
const MonsterSprite = ({ monster, state, isDamaged, ...props }) => {
  if (monster === 'orc') {
    return <OrcSprite state={state} isDamaged={isDamaged} {...props} />;
  } else if (monster === 'tensaphant') {
    return <TensaphantSprite state={state} isDamaged={isDamaged} {...props} />;
  }
  // Fallback to orc if unknown monster
  return <OrcSprite state={state} isDamaged={isDamaged} {...props} />;
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
const DialogueWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 20,
  isolation: 'isolate',
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
const CenterBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  minHeight: '300px', // More room for larger sprites
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

// Dialogue sequence for Level 2
const dialogueSequence = [
  { speaker: 'Wizard', text: "We've entered the edge of the jungle where time behaves… unusually." },
  { speaker: 'User', text: "It feels like everything is… stuck, or skipping forward?" },
  { speaker: 'Wizard', text: "That is the influence of Tensaphant, the Tinkerer of Time. His distortions ripple through every sentence, every moment." },
  { speaker: 'Wizard', text: "Here, verbs bend out of shape. The past forgets itself. The future speaks in riddles. Be on guard." },
  { speaker: 'User', text: "So we're dealing with time grammar?" },
  { speaker: 'Wizard', text: "Exactly. Master this, and you'll make the jungle breathe freely again." },
  { speaker: 'Tensaphant', text: "Foolish mortal... trudging through my warped domain." },
  { speaker: 'Tensaphant', text: "The villagers babble nonsense now, caught in echoes of incorrect tenses. I like it that way." },
  { speaker: 'User', text: "Then you won't like what comes next." },
  { speaker: 'Tensaphant', text: "Before you challenge me, face my echo from a fractured timeline." },
  { speaker: 'Orc Minion', text: "HAH! Another weakling stumbles into MY domain!" },
  { speaker: 'Orc Minion', text: "Me no care about your fancy grammar rules! Me CRUSH you with bad tenses!" },
  { speaker: 'User', text: "Your grammar is as broken as your ugly face will be." },
];

// Questions for Orc Minion (3)
const orcQuestions = [
  {
    question: 'Choose the correct sentence (past tense):',
    options: [
      'She eats dinner already.',
      'She ate dinner already.',
      'She eat dinner already.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Select the correct future tense:',
    options: [
      'They will go to the museum tomorrow.',
      'They goes to the museum tomorrow.',
      'They going to the museum tomorrow.'
    ],
    correctAnswer: 0
  },
  {
    question: 'Choose the proper tense:',
    options: [
      'He has finish his test.',
      'He have finished his test.',
      'He has finished his test.'
    ],
    correctAnswer: 2
  },
];

// Pre-Tensaphant battle dialogue
const preTensaphantDialogue = [
  { speaker: 'Orc Minion', text: "GRAAAH! You... you actually beat me?! IMPOSSIBLE! *faints" },
  { speaker: 'Tensaphant', text: "You've disrupted my rhythm!" },
  { speaker: 'User', text: "Then I'll break the rest of your clock!" },
  { speaker: 'Tensaphant', text: "Let's see how well you handle me, time meddler!" },
];

// Questions for Tensaphant (5)
const tensaphantQuestions = [
  {
    question: 'Which sentence is in the simple past tense?',
    options: [
      'She has baked a cake.',
      'She baked a cake.',
      'She was baking a cake.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Choose the correct future perfect tense:',
    options: [
      'I will have finish my work before lunch.',
      'I will have finished my work before lunch.',
      'I had finished my work before lunch.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Which sentence is in the past continuous tense?',
    options: [
      'They were play outside.',
      'They had been playing outside.',
      'They were playing outside.'
    ],
    correctAnswer: 2
  },
  {
    question: 'Pick the correct present perfect continuous sentence:',
    options: [
      'I have been studied all night.',
      'I have been studying all night.',
      'I was studying all night.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Which one is in the future continuous tense?',
    options: [
      'She will be sing at the event.',
      'She will be singing at the event.',
      'She is singing at the event tomorrow.'
    ],
    correctAnswer: 1
  },
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

const JungleLushLevel2 = () => {
  const navigate = useNavigate();
  // Dialogue and battle state
  const [phase, setPhase] = useState('dialogue'); // dialogue, orc, pretense, tensephant, victory, gameover
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [preTenseDialogueIdx, setPreTenseDialogueIdx] = useState(0);
  // Battle state
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(MONSTER_MAX_HP);
  const [monster, setMonster] = useState('orc'); // 'orc' or 'tensephant'
  const [monsterState, setMonsterState] = useState('idle'); // idle, attack, hurt, death
  const [adventurerState, setAdventurerState] = useState('idle'); // idle, attack
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
  // Star rating state
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 2; // This is level 2

  // Dialogue click/idle logic
  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'pretense') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase, preTenseDialogueIdx]);

  // Timer logic
  useEffect(() => {
    if ((phase === 'orc' || phase === 'tensephant') && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if ((phase === 'orc' || phase === 'tensephant') && timeLeft === 0 && !victory && !gameOver) {
      // Decrease heart, reset timer or game over
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

  // Dialogue click handler
  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueSequence.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        // Start Orc battle
        setPhase('orc');
        setMonster('orc');
        setMonsterHP(MONSTER_MAX_HP);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
        setMonsterState('idle');
      }
    } else if (phase === 'pretense') {
      if (preTenseDialogueIdx < preTensaphantDialogue.length - 1) {
        setPreTenseDialogueIdx(preTenseDialogueIdx + 1);
      } else {
        // Start Tensephant battle
        setPhase('tensephant');
        setMonster('tensaphant');
        setMonsterHP(MONSTER_MAX_HP);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  };

  // Answer handler
  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    setShowResult(true);
    const questions = monster === 'orc' ? orcQuestions : tensaphantQuestions;
    if (idx === questions[currentQuestion].correctAnswer) {
      // Adventurer attacks first
      setAdventurerState('attack');
      setTimeout(() => {
        setAdventurerState('idle');
        // Then monster gets hurt
        setMonsterDamaged(true);
        setMonsterState('hurt');
        setTimeout(() => {
          setMonsterDamaged(false);
          setMonsterState('idle');
        }, 500);
      }, 300); // Small delay to show attack animation
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(MONSTER_MAX_HP / questions.length));
        if (currentQuestion === questions.length - 1 || newHP === 0) {
          if (monster === 'orc') {
            // Pre-Tensephant dialogue
            setMonsterState('death');
            setTimeout(() => {
              setPhase('pretense');
              setPreTenseDialogueIdx(0);
              setMonsterState('idle');
            }, 1000);
          } else {
            setMonsterState('death');
            setTimeout(() => setVictory(true), 1000);
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
      setUserDamaged(true);
      setMonsterState('attack');
      setTimeout(() => {
        setUserDamaged(false);
        setMonsterState('idle');
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

  // Retry handler for current battle (used on game over)
  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(MONSTER_MAX_HP);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    // Only reset the current battle phase, not the whole level
    if (phase === 'tensephant') {
      setPhase('tensephant');
      setMonster('tensaphant');
    } else {
      setPhase('orc');
      setMonster('orc');
    }
    setMonsterState('idle');
    setAdventurerState('idle');
  };

  // Retry handler for whole level (used on victory)
  const handleRetryWholeLevel = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(MONSTER_MAX_HP);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setPhase('dialogue');
    setDialogueIdx(0);
    setPreTenseDialogueIdx(0);
    setMonster('orc');
    setMonsterState('idle');
    setAdventurerState('idle');
  };

  // Persist progress: save stars on victory
  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/adventure/level-progress/save', {
            levelName: "Orc Minion's Lair",
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
        <PositionedMonster monster={d.speaker === 'Tensaphant' ? 'tensaphant' : 'orc'}>
          {d.speaker === 'Tensaphant' && <MonsterSprite monster="tensaphant" state="idle" />}
          {d.speaker === 'Orc Minion' && <MonsterSprite monster="orc" state="idle" />}
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
  } else if (phase === 'orc' || phase === 'tensephant') {
    const questions = monster === 'orc' ? orcQuestions : tensaphantQuestions;
    const monsterName = monster === 'orc' ? 'Orc Minion' : 'Tensaphant';
    content = (
      <>
        <>
          <BattleAdventurer>
            <AdventurerSprite state={adventurerState} isDamaged={userDamaged} />
          </BattleAdventurer>
          <BattleMonster monster={monster}>
            <MonsterHPText>{monsterName} HP</MonsterHPText>
            <MonsterHPBar>
              <MonsterHPFill hp={monsterHP} />
            </MonsterHPBar>
            <MonsterSprite monster={monster} state={monsterState} isDamaged={monsterDamaged} />
          </BattleMonster>
          <VS style={{ position: 'absolute', left: '50%', bottom: '250px', transform: 'translateX(-50%)', zIndex: 5 }}>VS</VS>
        </>
        <BattleBottomBar>
          <QuestionText>
            {questions[currentQuestion].question}
          </QuestionText>
          <ChoicesGrid count={questions[currentQuestion].options.length}>
            {questions[currentQuestion].options.map((option, idx) => (
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
        </BattleBottomBar>
      </>
    );
  } else if (phase === 'pretense') {
    const d = preTensaphantDialogue[preTenseDialogueIdx];
    content = (
      <>
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite state={adventurerState} />
        </PositionedAdventurer>
        <PositionedMonster monster={d.speaker === 'Tensaphant' ? 'tensaphant' : 'orc'}>
          {d.speaker === 'Tensaphant' && <MonsterSprite monster="tensaphant" state="idle" />}
          {d.speaker === 'Orc Minion' && <MonsterSprite monster="orc" state="idle" />}
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
        {(phase === 'orc' || phase === 'tensephant') ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <HeartIcon key={idx} filled={idx < hearts} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {(phase === 'orc' || phase === 'tensephant') ? (
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
      <StyledDialog open={showQuit} onClose={() => setShowQuit(false)}>
        <StyledDialogContent>
          <Typography variant="h6">Are you sure you want to quit?</Typography>
        </StyledDialogContent>
        <StyledDialogActions>
          <DialogButton variant="cancel" onClick={() => setShowQuit(false)}>Cancel</DialogButton>
          <DialogButton variant="quit" onClick={() => navigate('/jungle-lush')}>Quit</DialogButton>
        </StyledDialogActions>
      </StyledDialog>
      {/* Game over dialog only (not for victory) */}
      <StyledDialog open={gameOver && hearts === 0} onClose={() => {}}>
        <StyledDialogContent>
          <Typography variant="h5">Game Over! Try again?</Typography>
        </StyledDialogContent>
        <StyledDialogActions>
          <DialogButton variant="cancel" onClick={handleRetryBattle}>Retry</DialogButton>
          <DialogButton variant="quit" onClick={() => navigate('/jungle-lush')}>Quit</DialogButton>
        </StyledDialogActions>
      </StyledDialog>
      {victory && (
        <VictoryOverlay>
          <VictoryContainer elevation={12}>
            {/* Star rating */}
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', marginBottom: 2, textAlign: 'center', letterSpacing: 1 }}>Battle Rating</Typography>
            <StarRow>
              {[1,2,3].map(i => (
                <Star key={i} filled={hearts >= i} style={newRecord && hearts >= i ? { animation: 'popIn 0.5s' } : {}}>
                  ★
                </Star>
              ))}
            </StarRow>
            {newRecord && (
              <Typography style={{ color: '#d32f2f', fontWeight: 900, fontFamily: 'monospace', fontSize: '1.3rem', marginBottom: 8, textAlign: 'center', letterSpacing: 1, animation: 'popIn 0.7s' }}>
                New Record!
              </Typography>
            )}
            <VictoryTitle>Victory!<br />You've defeated the Orc Minion!</VictoryTitle>
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>
              The timeline is restored, and the jungle breathes freely again.
            </Typography>
            <VictoryButton variant="contained" color="success" onClick={() => navigate('/jungle-lush/level3')}>Go to Next Level</VictoryButton>
            <VictoryButton variant="outlined" color="primary" onClick={handleRetryWholeLevel}>Retry Level</VictoryButton>
            <VictoryButton variant="outlined" color="error" onClick={() => navigate('/jungle-lush')}>Quit</VictoryButton>
          </VictoryContainer>
        </VictoryOverlay>
      )}
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/jungle-lush')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
  };
  
  export default JungleLushLevel2; 