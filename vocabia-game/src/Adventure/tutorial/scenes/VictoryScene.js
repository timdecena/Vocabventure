import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Enhanced animations
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(60px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const heartbeat = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const confettiFall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(2px 2px at 20px 30px, #eee, transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 160px 30px, #fff, transparent)
    `,
    backgroundRepeat: 'repeat',
    backgroundSize: '200px 100px',
    animation: `${sparkle} 3s ease-in-out infinite`,
    pointerEvents: 'none',
  },
}));

// Floating confetti particles
const ConfettiParticle = styled('div')(({ color, delay, duration }) => ({
  position: 'absolute',
  width: '10px',
  height: '10px',
  backgroundColor: color,
  top: '-10px',
  left: `${Math.random() * 100}%`,
  animation: `${confettiFall} ${duration}s linear ${delay}s infinite`,
  pointerEvents: 'none',
}));

const VictoryContainer = styled(Paper)(({ theme }) => ({
  padding: '60px 50px 50px 50px',
  background: 'linear-gradient(145deg, #2a2a3e 0%, #1e1e2f 50%, #16213e 100%)',
  color: '#fff',
  borderRadius: '32px',
  textAlign: 'center',
  maxWidth: '650px',
  width: '90%',
  position: 'relative',
  border: '3px solid rgba(255, 215, 0, 0.3)',
  boxShadow: `
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  animation: `${fadeInUp} 1s ease-out`,
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6347, #FFD700)',
    borderRadius: '34px',
    zIndex: -1,
    animation: `${heartbeat} 2s ease-in-out infinite`,
  },
}));

const VictoryTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Cinzel", "Serif", Georgia, serif',
  fontWeight: 900,
  fontSize: '4rem',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
  marginBottom: '20px',
  position: 'relative',
  '&::before': {
    content: '"✨"',
    position: 'absolute',
    left: '-60px',
    top: '10px',
    fontSize: '3rem',
    animation: `${sparkle} 2s ease-in-out infinite`,
  },
  '&::after': {
    content: '"✨"',
    position: 'absolute',
    right: '-60px',
    top: '10px',
    fontSize: '3rem',
    animation: `${sparkle} 2s ease-in-out infinite 1s`,
  },
}));

const StarRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  margin: '30px 0',
  position: 'relative',
}));

const Star = styled('div')(({ filled, delay }) => ({
  fontSize: '3.5rem',
  color: filled ? '#FFD700' : '#555',
  filter: filled ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'none',
  transition: 'all 0.5s ease',
  animation: filled ? `${fadeInUp} 0.8s ease-out ${delay}s both, ${sparkle} 3s ease-in-out infinite ${delay + 1}s` : 'none',
  transform: filled ? 'scale(1)' : 'scale(0.8)',
  '&::before': {
    content: '"⭐"',
  },
}));

const ScoreContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  padding: '25px',
  margin: '25px 0',
  border: '2px solid rgba(255, 215, 0, 0.2)',
  backdropFilter: 'blur(10px)',
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontWeight: 700,
  fontSize: '1.4rem',
  color: '#FFD700',
  textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)',
  margin: '8px 0',
}));

const FlavorText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Cinzel", "Serif", Georgia, serif',
  fontStyle: 'italic',
  fontSize: '1.3rem',
  color: '#E6E6FA',
  textShadow: '0 2px 10px rgba(230, 230, 250, 0.3)',
  margin: '25px 0 35px 0',
  lineHeight: 1.6,
  maxWidth: '500px',
  margin: '25px auto 35px auto',
}));

const ContinueButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 30%, #3d8b40 100%)',
  color: '#fff',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontWeight: 800,
  fontSize: '1.3rem',
  borderRadius: '25px',
  padding: '16px 40px',
  border: '3px solid #2e7d32',
  boxShadow: `
    0 8px 25px rgba(76, 175, 80, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3)
  `,
  textTransform: 'none',
  letterSpacing: '1px',
  minWidth: '220px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '"🗺️"',
    marginRight: '10px',
    fontSize: '1.5rem',
  },
  '&::after': {
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
    background: 'linear-gradient(145deg, #66bb6a 0%, #4caf50 30%, #388e3c 100%)',
    transform: 'translateY(-3px)',
    boxShadow: `
      0 12px 35px rgba(76, 175, 80, 0.5),
      0 6px 15px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `,
    '&::after': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0px)',
    boxShadow: `
      0 6px 20px rgba(76, 175, 80, 0.4),
      0 3px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
  },
}));

const VictoryScene = ({ results, onClose }) => {
  const navigate = useNavigate();
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    // Mark tutorial as completed in the backend
    const markTutorialCompleted = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await axios.post('/api/adventure/profile/complete-tutorial', {}, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
      } catch (err) {
        // Optionally log error
        // console.error('Failed to mark tutorial as completed:', err);
      }
    };
    markTutorialCompleted();

    // Trigger star animation after a delay
    setTimeout(() => setShowStars(true), 800);
  }, []);

  // Generate confetti particles
  const confettiColors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#87CEEB', '#DDA0DD'];
  const confettiParticles = Array.from({ length: 50 }, (_, i) => (
    <ConfettiParticle
      key={i}
      color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
      delay={Math.random() * 3}
      duration={3 + Math.random() * 2}
    />
  ));

  return (
    <SceneContainer>
      {confettiParticles}
      
      <VictoryContainer elevation={24}>
        <VictoryTitle variant="h1">
          Victory!
        </VictoryTitle>
        
        {showStars && (
          <StarRow>
            {[0, 1, 2].map((index) => (
              <Star
                key={index}
                filled={index < (results?.hearts || 3)}
                delay={index * 0.3}
              />
            ))}
          </StarRow>
        )}
        
        <ScoreContainer>
          <ScoreText>
            ⚔️ Score: {results?.score || 5}/{results?.totalQuestions || 5}
          </ScoreText>
          <ScoreText>
            ❤️ Hearts Remaining: {results?.hearts || 3}
          </ScoreText>
        </ScoreContainer>
        
        <FlavorText>
          "Well done, chosen one. You have mastered the ancient arts of grammar and proven yourself worthy. Now your true journey begins..."
        </FlavorText>
        
        <ContinueButton
          variant="contained"
          onClick={() => { 
            if (onClose) onClose(); 
            navigate('/map'); 
          }}
        >
          VIEW MAP
        </ContinueButton>
      </VictoryContainer>
    </SceneContainer>
  );
};

export default VictoryScene; 