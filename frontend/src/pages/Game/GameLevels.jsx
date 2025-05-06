import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Paper,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GamesIcon from '@mui/icons-material/Games';
import '../../styles/Game.css';

// Styled components
const LevelItem = styled(Paper)(({ theme, completed, locked }) => ({
  background: completed ? 'rgba(0, 255, 170, 0.2)' : 'rgba(30, 30, 80, 0.7)',
  borderRadius: '10px',
  padding: '15px',
  textAlign: 'center',
  border: `1px solid ${completed ? 'rgba(0, 255, 170, 0.5)' : 'rgba(0, 255, 170, 0.2)'}`,
  transition: 'all 0.3s ease',
  cursor: locked ? 'not-allowed' : 'pointer',
  opacity: locked ? 0.6 : 1,
  '&:hover': {
    transform: locked ? 'none' : 'scale(1.05)',
    borderColor: locked ? 'rgba(0, 255, 170, 0.2)' : 'rgba(0, 255, 170, 0.5)',
    boxShadow: locked ? 'none' : '0 0 15px rgba(0, 255, 170, 0.3)',
  }
}));

const GameLevels = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isLoggedIn = !!token;
        
        if (isLoggedIn) {
          // Authenticated user flow
          try {
            // Fetch all levels for this category
            const levelsResponse = await axios.get(`http://localhost:8081/api/game/categories/${category}/levels`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            });
            
            // Fetch user progress for this category
            const progressResponse = await axios.get(`http://localhost:8081/api/game/progress/me/categories/${category}`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            });
            
            // Create a map of completed levels for easy lookup
            const completedLevelsMap = {};
            progressResponse.data.forEach(progress => {
              completedLevelsMap[progress.gameLevel.id] = true;
            });
            
            // Add 'completed' flag to each level
            const levelsWithCompletion = levelsResponse.data.map(level => ({
              ...level,
              completed: completedLevelsMap[level.id] || false
            }));
            
            setLevels(levelsWithCompletion);
          } catch (authError) {
            console.error('Error fetching authenticated data:', authError);
            // Fall back to public endpoints if authentication fails
            await fetchPublicLevels();
          }
        } else {
          // Non-authenticated user flow
          await fetchPublicLevels();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError('Failed to load levels. Please try again later.');
        setLoading(false);
      }
    };
    
    // Function to fetch public levels without authentication
    const fetchPublicLevels = async () => {
      try {
        // Fetch all levels for this category from public endpoint
        const response = await axios.get(`http://localhost:8081/api/game/public/categories/${category}/levels`);
        
        // Mark all levels as not completed for non-authenticated users
        const levelsWithCompletion = response.data.map(level => ({
          ...level,
          completed: false
        }));
        
        setLevels(levelsWithCompletion);
      } catch (publicError) {
        console.error('Error fetching public levels:', publicError);
        throw publicError; // Re-throw to be caught by the outer catch
      }
    };

    fetchLevels();
  }, [category]);

  const handleLevelClick = (level) => {
    // Check if this level is locked
    const levelNumber = level.levelNumber;
    const isLocked = !completedLevels.includes(level.id) && 
                     levelNumber > 1 && 
                     !completedLevels.includes(
                       levels.find(l => l.levelNumber === levelNumber - 1)?.id
                     );
    
    if (!isLocked) {
      navigate(`/game/play/${category}/${level.levelNumber}`);
    }
  };

  const isLevelLocked = (level) => {
    // First level is always unlocked
    if (level.levelNumber === 1) return false;
    
    // Check if previous level is completed
    const previousLevel = levels.find(l => l.levelNumber === level.levelNumber - 1);
    if (!previousLevel) return false;
    
    return !completedLevels.includes(previousLevel.id);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#00ffaa' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          Loading levels...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'white' }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            mt: 3, 
            background: 'linear-gradient(135deg, #00ffaa, #00aaff)',
            color: '#0a0a2e'
          }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ 
          mb: 3, 
          '& .MuiBreadcrumbs-ol': { color: 'rgba(255, 255, 255, 0.7)' },
          '& .MuiBreadcrumbs-separator': { color: 'rgba(255, 255, 255, 0.5)' }
        }}
      >
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/game');
          }}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            textDecoration: 'none',
            '&:hover': { color: '#00ffaa' }
          }}
        >
          Game Categories
        </Link>
        <Typography sx={{ color: '#00ffaa', textTransform: 'capitalize' }}>
          {category}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/game')}
          sx={{ 
            color: 'white', 
            borderColor: 'rgba(255, 255, 255, 0.3)',
            mr: 2,
            '&:hover': { borderColor: '#00ffaa', color: '#00ffaa' }
          }}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ color: 'white', textTransform: 'capitalize' }}>
          <GamesIcon sx={{ fontSize: 30, mr: 1, verticalAlign: 'middle' }} />
          {category} Challenges
        </Typography>
      </Box>

      <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4 }}>
        Select a level to start solving word puzzles. Complete each level to unlock the next one!
      </Typography>

      <Grid container spacing={2}>
        {levels.length > 0 ? (
          levels
            .sort((a, b) => a.levelNumber - b.levelNumber)
            .map((level) => {
              const isCompleted = completedLevels.includes(level.id);
              const isLocked = isLevelLocked(level);
              
              return (
                <Grid item xs={6} sm={4} md={3} key={level.id}>
                  <LevelItem 
                    completed={isCompleted ? 1 : 0} 
                    locked={isLocked ? 1 : 0}
                    onClick={() => handleLevelClick(level)}
                  >
                    <Typography variant="h6" component="h3" sx={{ color: 'white' }}>
                      Level {level.levelNumber}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ color: '#00ffaa', fontSize: 24 }} />
                      ) : isLocked ? (
                        <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 24 }} />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Available
                        </Typography>
                      )}
                    </Box>
                  </LevelItem>
                </Grid>
              );
            })
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', p: 4, border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                No levels available yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Check back later for new word challenges!
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default GameLevels;
