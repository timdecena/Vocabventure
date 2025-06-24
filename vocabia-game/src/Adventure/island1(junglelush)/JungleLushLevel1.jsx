import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent, Grid } from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import '../../styles/MapView.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const JUNGLE_BG = 'https://png.pngtree.com/background/20220727/original/pngtree-jungle-game-background-arcade-art-picture-image_1829537.jpg';

// Enhanced Avatar Components - Detailed Silhouettes with Icons
const WizardAvatar = styled(Box)(({ theme }) => ({
  width: '120px',
  height: '150px',
  position: 'relative',
  filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.6))',
  animation: `${bounce} 2.2s infinite`,
  
  // Robe base
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '85px',
    height: '115px',
    background: 'linear-gradient(180deg, #4a2c1a 0%, #3d2414 30%, #2c1810 70%, #1a0f08 100%)',
    borderRadius: '45px 45px 8px 8px',
    boxShadow: 'inset 0 0 25px rgba(218, 165, 32, 0.15)',
  },
  
  // Hat
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '65px',
    height: '45px',
    background: 'linear-gradient(135deg, #1a0f08 0%, #3d2414 50%, #2c1810 100%)',
    borderRadius: '40px 40px 0 0',
    clipPath: 'polygon(15% 100%, 20% 15%, 80% 15%, 85% 100%)',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
  }
}));

const WizardBeard = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '55px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '45px',
  height: '35px',
  background: 'linear-gradient(135deg, #8B7355, #A0845C)',
  borderRadius: '50% 50% 60% 40%',
  clipPath: 'polygon(20% 0%, 80% 0%, 90% 70%, 70% 100%, 30% 100%, 10% 70%)',
  boxShadow: 'inset 0 0 10px rgba(139, 115, 85, 0.4)',
}));

const WizardIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '65px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '35px',
  height: '35px',
  background: 'radial-gradient(circle, #FFD700 20%, #FFA500 60%, #DAA520 100%)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  color: '#4a2c1a',
  fontWeight: 'bold',
  animation: 'wizardGlow 2s ease-in-out infinite alternate',
  boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
  '&::before': {
    content: '"🔮"',
  },
  '@keyframes wizardGlow': {
    '0%': { 
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.3)',
      transform: 'translateX(-50%) scale(1)'
    },
    '100%': { 
      boxShadow: '0 0 25px rgba(255, 215, 0, 0.8), 0 0 35px rgba(255, 165, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.5)',
      transform: 'translateX(-50%) scale(1.05)'
    }
  }
}));

const UserAvatar = styled(Box)(({ theme, isDamaged }) => ({
  width: '100px',
  height: '130px',
  position: 'relative',
  filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.5))',
  animation: `${bounce} 2s infinite, ${isDamaged ? `${shake} 0.5s ease-in-out, ${userFlash} 0.5s ease-in-out` : 'none'}`,
  
  // Body armor/tunic
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '65px',
    height: '95px',
    background: 'linear-gradient(180deg, #8B4513 0%, #A0522D 20%, #6b3e1a 50%, #4a2c1a 100%)',
    borderRadius: '32px 32px 15px 15px',
    boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.3)',
  },
  
  // Head
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '42px',
    height: '42px',
    background: 'linear-gradient(135deg, #D2B48C 0%, #DEB887 30%, #F5DEB3 60%, #D2B48C 100%)',
    borderRadius: '50%',
    boxShadow: 'inset 0 0 12px rgba(210, 180, 140, 0.4)',
  }
}));

const UserCape = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '35px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '50px',
  height: '70px',
  background: 'linear-gradient(135deg, #228B22 0%, #32CD32 40%, #20B2AA 100%)',
  borderRadius: '25px 25px 8px 8px',
  clipPath: 'polygon(20% 0%, 80% 0%, 85% 80%, 60% 100%, 40% 100%, 15% 80%)',
  zIndex: -1,
  boxShadow: 'inset 0 0 15px rgba(34, 139, 34, 0.3)',
}));

const UserIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '55px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '30px',
  height: '30px',
  background: 'radial-gradient(circle, #32CD32 20%, #228B22 60%, #006400 100%)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  color: 'white',
  fontWeight: 'bold',
  animation: 'heroicPulse 1.5s ease-in-out infinite',
  boxShadow: '0 0 12px rgba(50, 205, 50, 0.6)',
  '&::before': {
    content: '"⚔️"',
  },
  '@keyframes heroicPulse': {
    '0%': { 
      transform: 'translateX(-50%) scale(1)',
      boxShadow: '0 0 12px rgba(50, 205, 50, 0.6)'
    },
    '50%': { 
      transform: 'translateX(-50%) scale(1.1)',
      boxShadow: '0 0 20px rgba(50, 205, 50, 0.8), 0 0 30px rgba(34, 139, 34, 0.4)'
    },
    '100%': { 
      transform: 'translateX(-50%) scale(1)',
      boxShadow: '0 0 12px rgba(50, 205, 50, 0.6)'
    }
  }
}));

const CommawidowAvatar = styled(Box)(({ theme, isDamaged }) => ({
  width: '140px',
  height: '160px',
  position: 'relative',
  filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.7))',
  animation: `${bounce} 2.3s infinite, ${isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none'}`,
  
  // Main body (thorax)
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '85px',
    height: '85px',
    background: 'radial-gradient(ellipse, #2a1a1a 0%, #1a0a0a 40%, #000000 80%, #0a0000 100%)',
    borderRadius: '50%',
    boxShadow: 'inset 0 0 25px rgba(139, 0, 0, 0.4), 0 0 20px rgba(0,0,0,0.5)',
  },
  
  // Abdomen (larger rear section)
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '55px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '60px',
    background: 'radial-gradient(ellipse, #3a2a2a 0%, #2a1a1a 30%, #1a0a0a 70%, #0a0000 100%)',
    borderRadius: '50%',
    boxShadow: 'inset 0 0 20px rgba(139, 0, 0, 0.5), 0 0 15px rgba(0,0,0,0.3)',
  }
}));

const SpiderMarkings = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '25px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '65px',
  height: '65px',
  
  // Red hourglass marking
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30px',
    height: '20px',
    background: 'linear-gradient(45deg, #DC143C, #B22222)',
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
    boxShadow: '0 0 10px rgba(220, 20, 60, 0.6)',
  },
  
  // Additional dark patterns
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '8px',
    background: 'linear-gradient(90deg, transparent, #000000, transparent)',
    borderRadius: '4px',
  }
}));

const CommawidowIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '35px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '40px',
  height: '40px',
  background: 'radial-gradient(circle, #DC143C 20%, #8B0000 60%, #4B0000 100%)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  color: 'white',
  fontWeight: 'bold',
  animation: 'spiderMenace 3s ease-in-out infinite',
  boxShadow: '0 0 15px rgba(220, 20, 60, 0.7), inset 0 0 10px rgba(139, 0, 0, 0.5)',
  '&::before': {
    content: '"🕷️"',
    textShadow: '0 0 8px rgba(0,0,0,0.8)',
  },
  '@keyframes spiderMenace': {
    '0%': { 
      transform: 'translateX(-50%) rotate(0deg) scale(1)',
      boxShadow: '0 0 15px rgba(220, 20, 60, 0.7), inset 0 0 10px rgba(139, 0, 0, 0.5)'
    },
    '25%': { 
      transform: 'translateX(-50%) rotate(-3deg) scale(1.05)',
      boxShadow: '0 0 20px rgba(220, 20, 60, 0.8), inset 0 0 15px rgba(139, 0, 0, 0.6)'
    },
    '75%': { 
      transform: 'translateX(-50%) rotate(3deg) scale(1.05)',
      boxShadow: '0 0 20px rgba(220, 20, 60, 0.8), inset 0 0 15px rgba(139, 0, 0, 0.6)'
    },
    '100%': { 
      transform: 'translateX(-50%) rotate(0deg) scale(1)',
      boxShadow: '0 0 15px rgba(220, 20, 60, 0.7), inset 0 0 10px rgba(139, 0, 0, 0.5)'
    }
  }
}));

// Enhanced spider legs with joints
const SpiderLegs = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '130px',
  height: '130px',
  
  '& .leg': {
    position: 'absolute',
    width: '45px',
    height: '4px',
    background: 'linear-gradient(90deg, #3a2a2a 0%, #1a0a0a 50%, #000000 100%)',
    transformOrigin: 'left center',
    borderRadius: '2px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '6px',
      height: '6px',
      background: '#2a1a1a',
      borderRadius: '50%',
      boxShadow: '0 0 2px rgba(0,0,0,0.8)',
    }
  },
  
  '& .leg1': { top: '15px', left: '8px', transform: 'rotate(-50deg)' },
  '& .leg2': { top: '25px', left: '3px', transform: 'rotate(-25deg)' },
  '& .leg3': { top: '75px', left: '3px', transform: 'rotate(25deg)' },
  '& .leg4': { top: '85px', left: '8px', transform: 'rotate(50deg)' },
  '& .leg5': { top: '15px', right: '8px', transform: 'rotate(-130deg)' },
  '& .leg6': { top: '25px', right: '3px', transform: 'rotate(-155deg)' },
  '& .leg7': { top: '75px', right: '3px', transform: 'rotate(155deg)' },
  '& .leg8': { top: '85px', right: '8px', transform: 'rotate(130deg)' },
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

const flash = keyframes`
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.2); }
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
  height: '160px',
  zIndex: 3,
  pointerEvents: 'none',
}));

const WizardUserGroup = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '24px',
}));

const CommawidowGroup = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '32px',
}));



const FLESH_BROWN = '#e6c7b2';
const NAME_BG = '#d1a97a';

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 0,
  transform: 'translateX(-50%)',
  width: '900px',
  maxWidth: '90vw',
  minWidth: '320px',
  padding: theme.spacing(3, 4),
  backgroundColor: FLESH_BROWN,
  color: '#3a2a1a',
  textAlign: 'left',
  borderRadius: '18px 18px 0 0',
  zIndex: 10,
  boxShadow: '0 -2px 16px 2px rgba(0,0,0,0.18)',
  border: '3px solid #b48a6e',
  fontFamily: 'monospace',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
}));

const NameTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-22px',
  left: '18px',
  background: NAME_BG,
  color: '#3a2a1a',
  borderRadius: '16px',
  padding: '4px 18px',
  fontWeight: 700,
  fontSize: '1.1rem',
  boxShadow: '0 2px 8px #b48a6e44',
  border: '2px solid #b48a6e',
  fontFamily: 'monospace',
  zIndex: 2,
}));

const ClickPrompt = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '16px',
  right: '32px',
  color: '#00996b',
  fontSize: '1.1rem',
  fontWeight: 700,
  opacity: 0.85,
  pointerEvents: 'none',
  zIndex: 5,
  fontFamily: 'monospace',
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
  background: '#fffbe6',
  color: '#3a2a1a',
  borderRadius: '12px',
  padding: '6px 18px',
  fontWeight: 700,
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  boxShadow: '0 2px 8px #b48a6e44',
  border: '2px solid #b48a6e',
  zIndex: 20,
  marginLeft: 16,
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
  marginBottom: '180px',
  zIndex: 20,
  pointerEvents: 'none',
  minHeight: '220px',
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
  background: 'rgba(122,62,46,0.97)',
  minHeight: '100px',
  padding: '38px 0 18px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
  borderTopLeftRadius: '32px',
  borderTopRightRadius: '32px',
  boxShadow: '0 -2px 24px 2px rgba(0,0,0,0.32)',
  position: 'absolute',
  left: 0,
  bottom: 0,
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 600,
  fontSize: '1.35rem',
  marginBottom: '22px',
  textAlign: 'center',
  textShadow: '0 2px 8px #000',
}));

const MONSTER_MAX_HP = 100;
const TIMER_DURATION = 30;

const MonsterHPBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-30px',
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
  top: '-48px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textShadow: '0 2px 8px #000',
  zIndex: 10,
}));

const ChoicesGrid = styled(Box)(({ theme, count }) => ({
  width: count === 3 ? '520px' : '520px',
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
  minHeight: '64px',
  background: '#f8f8f8',
  color: '#222',
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  border: selected ? '2.5px solid #d32f2f' : '2.5px solid #444',
  borderRadius: '4px',
  boxShadow: selected ? '0 0 0 2px #ffbdbd' : '0 0 0 2px #222',
  outline: selected ? '2px solid #d32f2f' : 'none',
  textAlign: 'center',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  transition: 'border 0.1s, box-shadow 0.1s',
  '&:hover': {
    border: '2.5px solid #d32f2f',
    boxShadow: '0 0 0 2px #ffbdbd',
    background: '#fff3f3',
  },
}));

const dialogueSequence = [
  { speaker: "Wizard", text: "This is it... the jungle where Grammowl's corruption began." },
  { speaker: "User", text: "So this is where the first scroll was stolen?" },
  { speaker: "Wizard", text: "Yes. The Scroll of Grammar lies deep within Grammowl's territory. But the path is twisted with beasts that warp language into nonsense." },
  { speaker: "Grammowl(offscreen)", text: "Foolish fledgling... You flutter into my grove thinking you can rewrite fate?" },
  { speaker: "User", text: "Grammowl!" },
  { speaker: "Grammowl(offscreen)", text: "The Scroll belongs to me now. Without it, the villagers' minds will stay broken... just how I like them." },
  { speaker: "Wizard", text: "Grammowl, your reign of confusion ends here! Chosen one, prepare yourself!" },
  { speaker: "Grammowl(offscreen)", text: "You'll have to get through my little pets first… if your tiny brain can handle proper punctuation!" },
  { speaker: "Commawidow", text: "Welcome to my web, sweet reader. One misplaced pause… and you'll be tangled for eternity!" },
  { speaker: "User", text: "I'm not afraid of your tricks!" },
  { speaker: "Commawidow", text: "Then let's play a little game… Answer wrong, and you'll feel the sting of silence!" },
];

const questions = [
  {
    question: "Which sentence uses commas correctly in a list?",
    options: [
      "I packed my books pencils and erasers.",
      "I packed my books, pencils and erasers.",
      "I packed my books, pencils, and erasers."
    ],
    correctAnswer: 2
  },
  {
    question: "Which greeting is correctly punctuated?",
    options: [
      "Hello John.",
      "Hello, John.",
      "Hello John,"
    ],
    correctAnswer: 1
  },
  {
    question: "Choose the sentence with correct punctuation.",
    options: [
      "I wanted to play but it started raining.",
      "I wanted to play, but it started raining.",
      "I wanted to play but, it started raining."
    ],
    correctAnswer: 1
  },
  {
    question: "Which sentence uses a comma correctly?",
    options: [
      "After dinner we went for a walk.",
      "After dinner, we went for a walk.",
      "After, dinner we went for a walk."
    ],
    correctAnswer: 1
  },
  {
    question: "Which sentence uses commas correctly?",
    options: [
      "It was a cold dark night.",
      "It was a cold, dark night.",
      "It was a cold dark, night."
    ],
    correctAnswer: 1
  }
];

// Overlay for dimming background
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

const JungleLushLevel1 = () => {
  const navigate = useNavigate();
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const idleTimeout = useRef(null);
  const [showQuit, setShowQuit] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(MONSTER_MAX_HP);
  const [retryBattle, setRetryBattle] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 1; // This is level 1

  // Show Commawidow sprite only when she is speaking
  const showCommawidow = !showQuiz && dialogueSequence[currentDialogue].speaker === 'Commawidow';
  // Hide left sprites for Grammowl (off-screen)
  const showLeftSprites = !showQuiz && dialogueSequence[currentDialogue].speaker !== 'Grammowl';

  // Dialogue click/idle logic
  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (!showQuiz) {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [currentDialogue, showQuiz]);

  useEffect(() => {
    if (showQuiz && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (showQuiz && timeLeft === 0 && !victory && !gameOver) {
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
  }, [showQuiz, timeLeft, victory, gameOver, hearts]);

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (currentDialogue < dialogueSequence.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === questions[currentQuestion].correctAnswer) {
      // Correct answer - damage monster
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(MONSTER_MAX_HP / questions.length));
        if (currentQuestion === questions.length - 1 || newHP === 0) {
          setVictory(true);
        }
        return newHP;
      });
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(TIMER_DURATION);
      }
    } else {
      // Wrong answer - damage user
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
    }
  };

  const handleContinue = () => {
    if (victory || gameOver) {
      navigate('/jungle-lush');
    }
  };

  // Retry handler for battle only
  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(MONSTER_MAX_HP);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setShowQuiz(true);
    setRetryBattle(false);
  };

  // Persist progress: save stars on victory
  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/adventure/level-progress/save', {
            levelName: "Commawidow's Web",
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

  return (
    <SceneContainer>
      <Ground />
      <TopBar>
        {showQuiz ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <HeartIcon key={idx} filled={idx < hearts} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {showQuiz ? (
          <TimerBox>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>TIMER</Typography>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>{timeLeft}s</Typography>
          </TimerBox>
        ) : <div style={{ width: 90 }} />}
        <Button variant="contained" color="error" onClick={() => setShowQuit(true)} startIcon={<CloseIcon />} style={{ fontWeight: 700, fontFamily: 'monospace', borderRadius: 18, marginRight: 48, marginTop: 12 }}>
          Quit
        </Button>
      </TopBar>
      {!showQuiz ? (
        <>
          <SpritesRow>
            {showLeftSprites && (
              <WizardUserGroup>
                <WizardAvatar>
                  <WizardBeard />
                  <WizardIcon />
                </WizardAvatar>
                <UserAvatar>
                  <UserCape />
                  <UserIcon />
                </UserAvatar>
              </WizardUserGroup>
            )}
            <CommawidowGroup>
              {showCommawidow && (
                <CommawidowAvatar isDamaged={false}>
                  <SpiderLegs>
                    <div className="leg leg1"></div>
                    <div className="leg leg2"></div>
                    <div className="leg leg3"></div>
                    <div className="leg leg4"></div>
                    <div className="leg leg5"></div>
                    <div className="leg leg6"></div>
                    <div className="leg leg7"></div>
                    <div className="leg leg8"></div>
                  </SpiderLegs>
                  <SpiderMarkings />
                  <CommawidowIcon />
                </CommawidowAvatar>
              )}
            </CommawidowGroup>
          </SpritesRow>
          <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
            <NameTag>{dialogueSequence[currentDialogue].speaker}</NameTag>
            <Typography variant="h6" gutterBottom style={{ marginTop: 18, fontFamily: 'monospace' }}>
              {dialogueSequence[currentDialogue].text}
            </Typography>
            {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
          </DialogueBox>
        </>
      ) : (
        <>
          <BattleSpritesRow>
            <UserAvatar isDamaged={userDamaged}>
              <UserCape />
              <UserIcon />
            </UserAvatar>
            <VS>VS</VS>
            <MonsterSpriteWrapper>
              <MonsterHPText>Commawidow HP</MonsterHPText>
              <MonsterHPBar>
                <MonsterHPFill hp={monsterHP} />
              </MonsterHPBar>
              <CommawidowAvatar isDamaged={monsterDamaged}>
                <SpiderLegs>
                  <div className="leg leg1"></div>
                  <div className="leg leg2"></div>
                  <div className="leg leg3"></div>
                  <div className="leg leg4"></div>
                  <div className="leg leg5"></div>
                  <div className="leg leg6"></div>
                  <div className="leg leg7"></div>
                  <div className="leg leg8"></div>
                </SpiderLegs>
                <SpiderMarkings />
                <CommawidowIcon />
              </CommawidowAvatar>
            </MonsterSpriteWrapper>
          </BattleSpritesRow>
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
                  style={{ fontFamily: 'monospace' }}
                  disabled={showResult}
                >
                  {option}
                </MoveButton>
              ))}
            </ChoicesGrid>
          </BattleBottomBar>
        </>
      )}
      <Dialog open={showQuit} onClose={() => setShowQuit(false)}>
        <DialogContent>
          <Typography variant="h6" align="center">Are you sure you want to quit?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuit(false)} color="primary">Cancel</Button>
          <Button onClick={() => navigate('/jungle-lush')} color="error">Quit</Button>
        </DialogActions>
      </Dialog>
      {/* Game over dialog only (not for victory) */}
      <Dialog open={gameOver && hearts === 0} onClose={() => {}}>
        <DialogContent>
          <Typography variant="h5" align="center">Game Over! Try again?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRetryBattle} color="primary">Retry</Button>
          <Button onClick={() => navigate('/jungle-lush')} color="error">Quit</Button>
        </DialogActions>
      </Dialog>
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
            <VictoryTitle>Victory!<br />You've defeated Commawidow!</VictoryTitle>
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>
              The web is broken, and the path forward is clear.
            </Typography>
            <VictoryButton variant="contained" color="success" onClick={() => navigate('/jungle-lush/level2')}>Go to Next Level</VictoryButton>
            <VictoryButton variant="outlined" color="primary" onClick={handleRetryBattle}>Retry Level</VictoryButton>
            <VictoryButton variant="outlined" color="error" onClick={() => navigate('/jungle-lush')}>Quit</VictoryButton>
          </VictoryContainer>
        </VictoryOverlay>
      )}
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/jungle-lush')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
};

export default JungleLushLevel1; 