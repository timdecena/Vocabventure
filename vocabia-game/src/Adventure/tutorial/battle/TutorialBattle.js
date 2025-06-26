import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

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
  ADVENTURER_BOTTOM: '-30px',     // 🔧 Adventurer distance from bottom
  ORC_RIGHT: '32%',            // 🔧 Orc position from right  
  ORC_BOTTOM: '-30px',           // 🔧 Orc distance from bottom
  
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
  minHeight: '350px',
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  marginBottom: CHARACTER_POSITIONS.SPRITES_MARGIN_BOTTOM, // 🎯 ADJUST THIS
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
  top: '100px',
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
  top: '55px',
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

// Updated Bottom Bar (same style as JungleLushLevel2)
const BottomBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  background: 'linear-gradient(180deg, rgba(139,69,19,0.95) 0%, rgba(101,67,33,0.98) 50%, rgba(62,39,35,1) 100%)',
  minHeight: '180px', // Increased height to match JungleLushLevel2
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

// Updated Question Text (same style as JungleLushLevel2)
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

const TutorialBattle = ({ onComplete, showQuitButton, onQuit, quitButtonText, initialState, onStateChange }) => {
  const [hearts, setHearts] = useState(initialState?.hearts || 3);
  const [score, setScore] = useState(initialState?.score || 0);
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 30);
  const [selectedOption, setSelectedOption] = useState(initialState?.selectedOption || null);
  const [isAnswered, setIsAnswered] = useState(initialState?.isAnswered || false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialState?.currentQuestionIndex || 0);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [adventurerState, setAdventurerState] = useState('idle'); // idle, attack
  const [orcState, setOrcState] = useState('idle'); // idle, attack, hurt, death
  const [monsterHP, setMonsterHP] = useState(initialState?.monsterHP || 100); // Add HP state
  const [gameOver, setGameOver] = useState(false); // Add game over state
  const [victory, setVictory] = useState(false); // Add victory state

  // 🎯 REVERTED TO ORIGINAL TUTORIAL QUESTIONS AS REQUESTED
  const questions = [
    {
      question: "What is the correct form of the verb in this sentence: 'She ___ to the store yesterday.'",
      options: ["go", "goes", "went", "going"],
      correct: 2 // "went"
    },
    {
      question: "Which word is a proper noun?",
      options: ["city", "London", "building", "street"],
      correct: 1 // "London"
    },
    {
      question: "What is the past tense of 'write'?",
      options: ["wrote", "written", "writed", "writing"],
      correct: 0 // "wrote"
    },
    {
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
      question: "What is the opposite of 'begin'?",
      options: ["start", "continue", "end", "pause"],
      correct: 2 // "end"
    }
  ];

  const handleAnswer = (answer) => {
    if (isAnswered) return;
    
    setSelectedOption(answer);
    setIsAnswered(true);
    
    if (answer === questions[currentQuestionIndex].correct) {
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

  const handleWrongAnswer = () => {
    setUserDamaged(true);
    setOrcState('attack');
    setTimeout(() => {
      setUserDamaged(false);
      setOrcState('idle');
    }, 500);
    
    // 🎯 FIXED BATTLE LOGIC - LOSE HEARTS AND CHECK FOR GAME OVER
    const newHearts = hearts - 1;
    setHearts(newHearts);
    
    if (newHearts <= 0) {
      // Game over - player loses
      setTimeout(() => {
        setGameOver(true);
      }, 600);
    } else {
      // Continue with same question after wrong answer
      setTimeout(() => {
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(30);
      }, 600);
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

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !victory && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && !victory && !gameOver) {
      handleWrongAnswer();
    }
  }, [timeLeft, isAnswered, victory, gameOver]);

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
        monsterHP
      };
      onStateChange(currentState);
    }
  }, [hearts, score, timeLeft, selectedOption, isAnswered, currentQuestionIndex, monsterHP, onStateChange]);

  return (
    <BattleContainer>
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
        <QuestionText>
          {questions[currentQuestionIndex].question}
        </QuestionText>
        <ChoicesGrid count={questions[currentQuestionIndex].options.length}>
          {questions[currentQuestionIndex].options.map((option, idx) => (
            <MoveButton
              key={idx}
              selected={selectedOption === idx}
              onClick={() => handleSelect(option, idx)}
              disabled={isAnswered}
            >
              {option}
            </MoveButton>
          ))}
        </ChoicesGrid>
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
            <Typography variant="h3" style={{ color: '#2e7d32', fontWeight: 800, marginBottom: '20px' }}>
              🎉 Victory! 🎉
            </Typography>
            <Typography variant="h6" style={{ color: '#3a2a1a', marginBottom: '30px' }}>
              You defeated the Orc Minion!
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