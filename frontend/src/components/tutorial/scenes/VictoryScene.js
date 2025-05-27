import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import { keyframes } from '@mui/system';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
  backgroundImage: `linear-gradient(135deg, #232526cc 0%, #414345cc 100%), url('https://vjloopsfarm.com/wp-content/uploads/2016/11/Confetti-Falling-Color-LIMEART_003.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  animation: `${fadeIn} 2s ease-in`,
}));

const ResultsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  borderRadius: '15px',
  textAlign: 'center',
  maxWidth: '600px',
  width: '90%',
  marginBottom: theme.spacing(4),
}));

const StarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  margin: theme.spacing(2, 0),
}));

const Star = styled(StarIcon)(({ theme, active }) => ({
  color: active ? '#ffd700' : '#666666',
  fontSize: '3rem',
}));

const ContinueButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#4CAF50',
  color: 'white',
  '&:hover': {
    backgroundColor: '#45a049',
  },
}));

const Island = styled(Box)(({ theme, unlocked }) => ({
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: unlocked ? '#4CAF50' : '#666666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  cursor: unlocked ? 'pointer' : 'not-allowed',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: unlocked ? 'scale(1.1)' : 'none',
  },
}));

const VictoryScene = ({ results }) => {
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mark tutorial as completed in the backend
    const markTutorialCompleted = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        await axios.put(`http://localhost:8081/api/adventure-profile/complete-tutorial?userId=${user.id}`);
      } catch (err) {
        // Optionally log error
        // console.error('Failed to mark tutorial as completed:', err);
      }
    };
    markTutorialCompleted();
  }, []);

  return (
    <SceneContainer>
      <ResultsContainer elevation={3} sx={{ position: 'relative', overflow: 'hidden' }}>
        <Typography variant="h4" gutterBottom sx={{ position: 'relative', zIndex: 2 }}>
          Victory!
        </Typography>
        <StarContainer sx={{ position: 'relative', zIndex: 2 }}>
          {[...Array(3)].map((_, index) => (
            <Star key={index} active={index < results.stars} />
          ))}
        </StarContainer>
        <Typography variant="h6" gutterBottom sx={{ position: 'relative', zIndex: 2 }}>
          Score: {results.score}/{results.totalQuestions}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ position: 'relative', zIndex: 2 }}>
          Hearts Remaining: {results.hearts}
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ position: 'relative', zIndex: 2 }}>
          Well done, chosen one. Now your journey truly begins...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, position: 'relative', zIndex: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/map')}
            sx={{ minWidth: '180px', fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            View Map
          </Button>
        </Box>
      </ResultsContainer>
    </SceneContainer>
  );
};

export default VictoryScene; 