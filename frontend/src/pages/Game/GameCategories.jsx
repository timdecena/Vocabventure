import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  LinearProgress,
  Button,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GamesIcon from '@mui/icons-material/Games';
import CategoryIcon from '@mui/icons-material/Category';
import '../../styles/Game.css';

// Styled components
const CategoryCard = styled(Card)(({ theme }) => ({
  background: 'rgba(20, 20, 70, 0.7)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 255, 170, 0.2)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(0, 255, 170, 0.5)',
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #00ffaa, #00aaff)',
  }
}));

const GameCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isLoggedIn = !!token;
        
        if (isLoggedIn) {
          // Authenticated user flow - get categories and progress
          try {
            // Fetch all available categories
            const categoriesResponse = await axios.get('http://localhost:8081/api/game/categories', {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            });
            
            // Fetch user progress summary
            const progressResponse = await axios.get('http://localhost:8081/api/game/progress/me/summary', {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            });
            
            setCategories(categoriesResponse.data);
            setProgress(progressResponse.data.completionByCategory || {});
          } catch (authError) {
            console.error('Error fetching authenticated data:', authError);
            // Fall back to public endpoints if authentication fails
            await fetchPublicData();
          }
        } else {
          // Non-authenticated user flow - get public data only
          await fetchPublicData();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data. Please try again later.');
        setLoading(false);
      }
    };
    
    // Function to fetch public data without authentication
    const fetchPublicData = async () => {
      try {
        // Fetch initial game data from public endpoint
        const response = await axios.get('http://localhost:8081/api/game/public/initial-data');
        
        setCategories(response.data.categories || []);
        
        // Create empty progress for each category
        const emptyProgress = {};
        response.data.categories.forEach(category => {
          const categoryData = response.data.categoryData[category] || {};
          emptyProgress[category] = {
            completed: 0,
            total: categoryData.totalLevels || 0,
            percentage: 0
          };
        });
        
        setProgress(emptyProgress);
      } catch (publicError) {
        console.error('Error fetching public data:', publicError);
        throw publicError; // Re-throw to be caught by the outer catch
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/game/levels/${category}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#00ffaa' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          Loading adventure challenges...
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
            color: '#0a0a2e',
            '&:hover': {
              background: 'linear-gradient(135deg, #00ffaa, #00ccff)',
            }
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
      <Box className="game-header">
        <Typography variant="h3" component="h1" gutterBottom>
          <GamesIcon sx={{ fontSize: 35, mr: 1, verticalAlign: 'middle' }} />
          4 Pics 1 Word Challenge
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4 }}>
          Guess the word that connects all four images and expand your vocabulary!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {categories.length > 0 ? (
          categories.map((category) => {
            // Get progress data for this category
            const categoryProgress = progress[category] || { completed: 0, total: 0, percentage: 0 };
            
            return (
              <Grid item xs={12} sm={6} key={category}>
                <CategoryCard onClick={() => handleCategoryClick(category)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CategoryIcon sx={{ color: '#00ffaa', mr: 1 }} />
                      <Typography variant="h5" component="h2" sx={{ color: 'white', textTransform: 'capitalize' }}>
                        {category}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      Solve word puzzles related to {category.toLowerCase()}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#00ffaa' }}>
                          {categoryProgress.completed} / {categoryProgress.total}
                        </Typography>
                      </Box>
                      <ProgressBar 
                        variant="determinate" 
                        value={categoryProgress.percentage || 0} 
                      />
                    </Box>
                  </CardContent>
                </CategoryCard>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', p: 4, border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                No categories available yet
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

export default GameCategories;
