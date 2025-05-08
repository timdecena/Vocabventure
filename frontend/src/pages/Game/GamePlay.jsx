import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Dialog,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';

const LetterBox = styled(Box)(({ theme, filled }) => ({
  width: 40,
  height: 50,
  background: filled ? 'rgba(0, 255, 170, 0.2)' : 'rgba(30, 30, 80, 0.8)',
  border: `2px solid ${filled ? 'rgba(0, 255, 170, 0.7)' : 'rgba(0, 255, 170, 0.3)'}`,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'white',
  textTransform: 'uppercase',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.2s ease',
  transform: filled ? 'translateY(-3px)' : 'none',
  '@media (max-width: 768px)': {
    width: 35,
    height: 45,
    fontSize: '1.3rem',
  },
  '@media (max-width: 480px)': {
    width: 30,
    height: 40,
    fontSize: '1.2rem',
  }
}));

const LetterChoice = styled(Box)(({ theme, used }) => ({
  width: 40,
  height: 50,
  background: 'rgba(40, 40, 100, 0.8)',
  border: '2px solid rgba(0, 255, 170, 0.3)',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'white',
  textTransform: 'uppercase',
  cursor: used ? 'not-allowed' : 'pointer',
  opacity: used ? 0.3 : 1,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: used ? 'rgba(40, 40, 100, 0.8)' : 'rgba(0, 255, 170, 0.2)',
    transform: used ? 'none' : 'translateY(-3px)',
    boxShadow: used ? 'none' : '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  '@media (max-width: 768px)': {
    width: 35,
    height: 45,
    fontSize: '1.3rem',
  },
  '@media (max-width: 480px)': {
    width: 30,
    height: 40,
    fontSize: '1.2rem',
  }
}));

const GamePlay = () => {
  const { category, levelNumber } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [levelData, setLevelData] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [letterIndices, setLetterIndices] = useState([]);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  // Fetch level data
  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const isLoggedIn = !!token;
        
        let response;
        if (isLoggedIn) {
          // Try authenticated endpoint first
          try {
            response = await axios.get(
              `http://localhost:8081/api/game/categories/${category}/levels/${levelNumber}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
              }
            );
          } catch (authError) {
            console.log('Falling back to public endpoint');
            // Fall back to public endpoint
            response = await axios.get(`http://localhost:8081/api/game/public/categories/${category}/levels/${levelNumber}`);
          }
        } else {
          // Use public endpoint for non-authenticated users
          response = await axios.get(`http://localhost:8081/api/game/public/categories/${category}/levels/${levelNumber}`);
        }
        
        console.log('Level data received:', response.data);
        setLevelData(response.data);
      } catch (error) {
        console.error('Error fetching level data:', error);
      }
    };
    
    fetchLevelData();
  }, [category, levelNumber]);

  // Handle letter selection
  const handleLetterClick = (letter, index) => {
    if (letterIndices.includes(index)) return;
    
    setSelectedLetters([...selectedLetters, letter]);
    setLetterIndices([...letterIndices, index]);
    
    // Check if answer is complete and correct
    const newAnswer = [...selectedLetters, letter].join('');
    if (newAnswer.length === levelData.answer.length) {
      const isAnswerCorrect = newAnswer.toLowerCase() === levelData.answer.toLowerCase();
      setIsCorrect(isAnswerCorrect);
      
      if (isAnswerCorrect) {
        setMessage('Correct!');
        setTimeout(() => setSuccessDialogOpen(true), 1000);
      } else {
        setMessage('Try again!');
        // Reset after a short delay
        setTimeout(() => {
          setSelectedLetters([]);
          setLetterIndices([]);
          setMessage('');
        }, 1500);
      }
    }
  };
  
  // Remove a letter from the answer
  const handleRemoveLetter = (index) => {
    const newSelectedLetters = [...selectedLetters];
    const newLetterIndices = [...letterIndices];
    
    newSelectedLetters.splice(index, 1);
    newLetterIndices.splice(index, 1);
    
    setSelectedLetters(newSelectedLetters);
    setLetterIndices(newLetterIndices);
  };
  
  // Handle continue to next level
  const handleContinue = () => {
    setSuccessDialogOpen(false);
    navigate(`/game/play/${category}/${parseInt(levelNumber) + 1}`);
  };

  // Handle back to levels
  const handleBackToLevels = () => {
    setSuccessDialogOpen(false);
    navigate(`/game/levels/${category}`);
  };

  if (!levelData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#00ffaa' }} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      maxWidth: 600, 
      margin: '0 auto', 
      padding: 2,
      backgroundColor: '#1a1a2e',
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <IconButton 
          component={Link} 
          to={`/game/levels/${category}`}
          sx={{ color: 'white' }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" sx={{ color: 'white', textTransform: 'capitalize' }}>
          {category} - Level {levelNumber}
        </Typography>

        <IconButton 
          onClick={() => setShowHint(!showHint)}
          sx={{ color: '#00ffaa' }}
        >
          <LightbulbIcon />
        </IconButton>
      </Box>
      
      {/* Images Grid - 2x2 layout */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '8px',
        aspectRatio: '1/1',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        mb: 3
      }}>
        {levelData.images.map((image, index) => (
          <Box 
            key={index}
            sx={{ 
              position: 'relative',
              width: '100%',
              height: '100%',
              border: '2px solid rgba(0, 255, 170, 0.3)',
              borderRadius: '8px',
              backgroundColor: 'rgba(10, 10, 46, 0.5)',
              overflow: 'hidden'
            }}>
              <img 
                src={image.startsWith('http') ? image : `http://localhost:8081${image}`} 
                alt={`Clue ${index + 1}`} 
                style={{ 
                  height: '100%', 
                  width: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.log(`Error loading image: ${image}`);
                  // Try alternative URL format if the first one fails
                  const token = localStorage.getItem('token');
                  if (token && !e.target.src.includes('?token=')) {
                    const authUrl = `${e.target.src}?token=${token}`;
                    console.log(`Trying with auth token: ${authUrl}`);
                    e.target.src = authUrl;
                  } else {
                    // If auth token doesn't work or isn't available, use placeholder
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzBhMGEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzAwZmZhYSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                  }
                }}
              />
            </Box>
        ))}
      </Box>
      
      {/* Hint */}
      {showHint && levelData.hint && (
        <Box sx={{ 
          mb: 2, 
          p: 1, 
          backgroundColor: 'rgba(0, 255, 170, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(0, 255, 170, 0.3)'
        }}>
          <Typography variant="body2" sx={{ color: '#00ffaa' }}>
            Hint: {levelData.hint}
          </Typography>
        </Box>
      )}
      
      {/* Selected Letters */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mb: 2
      }}>
        {Array.from({ length: levelData.answer.length }).map((_, index) => (
          <Box 
            key={index} 
            onClick={() => selectedLetters[index] && handleRemoveLetter(index)}
            sx={{ 
              width: 40,
              height: 40,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid #00ffaa',
              borderRadius: '4px',
              margin: '0 4px',
              backgroundColor: selectedLetters[index] ? 'rgba(0, 255, 170, 0.2)' : 'transparent',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: selectedLetters[index] ? 'pointer' : 'default'
            }}
          >
            {selectedLetters[index] || ''}
          </Box>
        ))}
      </Box>
      
      {/* Message */}
      {message && (
        <Typography 
          align="center" 
          sx={{ 
            color: isCorrect ? '#00ffaa' : '#ff5555',
            fontWeight: 'bold',
            mb: 2
          }}
        >
          {message}
        </Typography>
      )}
      
      {/* Letter Choices */}
      <Box sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1,
        mb: 2
      }}>
        {levelData.letterChoices && levelData.letterChoices.map((letter, index) => (
          <Box 
            key={index}
            onClick={() => !letterIndices.includes(index) && handleLetterClick(letter, index)}
            sx={{ 
              width: 36,
              height: 36,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: letterIndices.includes(index) ? 'rgba(255, 255, 255, 0.2)' : '#3a3a5e',
              color: letterIndices.includes(index) ? 'rgba(255, 255, 255, 0.5)' : 'white',
              borderRadius: '4px',
              cursor: letterIndices.includes(index) ? 'default' : 'pointer',
              '&:hover': {
                backgroundColor: letterIndices.includes(index) ? 'rgba(255, 255, 255, 0.2)' : '#4a4a6e'
              }
            }}
          >
            {letter}
          </Box>
        ))}
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 70, 0.9)',
            borderRadius: '15px',
            border: '2px solid rgba(0, 255, 170, 0.5)',
            boxShadow: '0 0 30px rgba(0, 255, 170, 0.3)',
            maxWidth: '400px',
            width: '100%'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: '#00ffaa', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#00ffaa', mb: 2 }}>
            Correct!
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mb: 3 }}>
            You've successfully completed Level {levelNumber}!
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
              Attempts: {attempts}
            </Typography>
            {hintsUsed > 0 && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                Hints Used: {hintsUsed}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleBackToLevels}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': { borderColor: '#00ffaa', color: '#00ffaa' }
            }}
            variant="outlined"
          >
            Back to Levels
          </Button>
          <Button 
            onClick={handleContinue}
            sx={{ 
              background: 'linear-gradient(135deg, #00ffaa, #00aaff)',
              color: '#0a0a2e',
              '&:hover': {
                background: 'linear-gradient(135deg, #00ffaa, #00ccff)',
              }
            }}
            variant="contained"
          >
            Next Level
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GamePlay;
