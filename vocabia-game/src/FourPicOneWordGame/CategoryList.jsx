// src/FourPicOneWordGame/CategoryList.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Badge,
  CircularProgress,
  Avatar,
  LinearProgress,
} from "@mui/material";
// import { useTheme } from "@mui/material/styles"; // Removed as not used in optimized version
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import PetsIcon from "@mui/icons-material/Pets";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SchoolIcon from "@mui/icons-material/School";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import api from "../api/api";
import { Zoom } from "@mui/material";
import SoundManager from "../sound/SoundManager";
import AudioControls from "../components/AudioControls";

// Category theme mapping
const categoryThemes = {
  animals: {
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    secondaryColor: '#2E7D32',
    color: '#fff',
    icon: <PetsIcon sx={{ fontSize: 40 }} />
  },
  food: {
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFEB3B 100%)',
    secondaryColor: '#E65100',
    color: '#fff',
    icon: <RestaurantIcon sx={{ fontSize: 40 }} />
  },
  sports: {
    gradient: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
    secondaryColor: '#0D47A1',
    color: '#fff',
    icon: <SportsSoccerIcon sx={{ fontSize: 40 }} />
  },
  vehicles: {
    gradient: 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)',
    secondaryColor: '#B71C1C',
    color: '#fff',
    icon: <DirectionsCarIcon sx={{ fontSize: 40 }} />
  },
  plants: {
    gradient: 'linear-gradient(135deg, #009688 0%, #4CAF50 100%)',
    secondaryColor: '#004D40',
    color: '#fff',
    icon: <LocalFloristIcon sx={{ fontSize: 40 }} />
  },
  travel: {
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)',
    secondaryColor: '#1A237E',
    color: '#fff',
    icon: <BeachAccessIcon sx={{ fontSize: 40 }} />
  },
  school: {
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    secondaryColor: '#4A148C',
    color: '#fff',
    icon: <SchoolIcon sx={{ fontSize: 40 }} />
  },
  // Default theme for any other categories
  default: {
    gradient: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
    secondaryColor: '#263238',
    color: '#fff',
    icon: <EmojiNatureIcon sx={{ fontSize: 40 }} />
  }
};

function CategoryList() {
  // Fix: remove any reference to XP, stars, or player rank/level in progress
  // Only show completed levels per category

  const { id } = useParams(); // classroom id
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryProgress, setCategoryProgress] = useState({});
  const [, setIsAuthenticated] = useState(false);
  const [, setError] = useState(null);
  const [animationReady, setAnimationReady] = useState(false);
  const [adventureUnlocks, setAdventureUnlocks] = useState(0);
  const navigate = useNavigate();
  // const theme = useTheme(); // Removed as not used in optimized version

  // Filter out Adventure Mode categories from regular Four Pics One Word game
  // Adventure Chronicles and Jungle Lush are only accessible through Adventure Mode
  // All other categories shown here are teacher-created content
  const displayCategories = categories.filter(cat => 
    cat.toLowerCase() !== 'adventure chronicles' && 
    cat.toLowerCase() !== 'jungle lush'
  );

  // Function to refresh category progress
  const refreshCategoryProgress = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const progressRes = await api.get("/api/user-progress/category-progress", { params: { classroomId: id } });
        setCategoryProgress(progressRes.data || {});
      } catch (progressError) {
        console.warn("Error refreshing category progress:", progressError);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);

        // Fetch categories (classroom-specific if id is provided)
        const categoriesRes = await api.get("/api/fpow/categories", {
          params: id ? { classroomId: id } : {}
        });
        const categoriesData = categoriesRes.data || [];
        setCategories(categoriesData);
        
        // Fetch Adventure Chronicles unlock status
        try {
          const adventureRes = await api.get('/api/adventure/profile/unlocked-fpow-levels');
          setAdventureUnlocks(adventureRes.data.unlockedLevels?.length || 0);
        } catch (err) {
          console.warn('Could not fetch Adventure unlocks:', err);
          setAdventureUnlocks(0);
        }

        // If authenticated, fetch category progress with totals
        if (token) {
          try {
            const progressRes = await api.get("/api/user-progress/category-progress", { params: { classroomId: id } });
            setCategoryProgress(progressRes.data || {});
          } catch (progressError) {
            console.warn("Error fetching category progress:", progressError);
            // Initialize empty progress for all categories
            const emptyProgress = {};
            categoriesData.forEach(category => {
              emptyProgress[category] = {
                completedLevels: 0,
                totalLevels: 0,
                currentLevel: 1,
                progressPercentage: 0
              };
            });
            setCategoryProgress(emptyProgress);
          }
        } else {
          // For non-authenticated users, use localStorage fallback
          const localProgress = {};
          categoriesData.forEach(category => {
            const userId = localStorage.getItem("userId") || "anonymous";
            const completedKey = `vocabVenture_${userId}_${category}_completed`;
            const completedLevels = localStorage.getItem(completedKey);
            const completedCount = completedLevels ? Object.keys(JSON.parse(completedLevels)).length : 0;
            
            localProgress[category] = {
              completedLevels: completedCount,
              totalLevels: 5, // Default fallback
              currentLevel: 1,
              progressPercentage: 0
            };
          });
          setCategoryProgress(localProgress);
        }
        // Set animation ready after a short delay for staggered entrance
        setTimeout(() => setAnimationReady(true), 100);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Preload sound effects and start BGM when this page mounts (user is entering FPOW module)
  useEffect(() => {
    SoundManager.preloadEffects();
    // Try to start BGM immediately, but it may be blocked until user interaction
    SoundManager.playBgm();

    // Cleanup: Stop music when leaving FPOW completely
    return () => {
      // Only stop music if navigating away from FPOW entirely
      const currentPath = window.location.pathname;
      if (!currentPath.includes('4pic1word')) {
        SoundManager.stopAllAudio();
      }
    };
  }, []);

  // Refresh progress when user returns to this page
  useEffect(() => {
    const handleFocus = () => {
      refreshCategoryProgress();
    };

    window.addEventListener('focus', handleFocus);
    
    // Also refresh when component becomes visible (for navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshCategoryProgress();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);
  

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );

    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
          minHeight: '100vh',
          pt: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 4, sm: 6, md: 8 },
          px: { xs: 0, sm: 3 },
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          py: 4,
          px: { xs: 2, sm: 3 },
          maxWidth: "lg",
          mx: "auto",
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          borderRadius: { xs: 0, sm: 4 },
          mb: 4,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          width: '100%',
        }}>
          {/* Decorative elements */}
          <Box sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }} />
          <Box sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }} />
    
          {/* Header */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            position: "relative",
            zIndex: 2,
          }}>
            <SportsEsportsIcon sx={{
              fontSize: { xs: 45, sm: 55, md: 65 },
              color: "#fff",
              mr: { xs: 0, sm: 2 },
              mb: { xs: 1, sm: 0 },
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
            }} />
            <Typography
              variant="h4"
              component="h1"
              fontWeight={800}
              color="#fff"
              textAlign={{ xs: "center", sm: "left" }}
              sx={{
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                letterSpacing: "1px",
                background: "linear-gradient(90deg, #ffffff, #e0e0e0, #ffffff)",
                backgroundSize: "200% auto",
                color: "transparent",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                animation: "shine 3s linear infinite",
                "@keyframes shine": {
                  "to": {
                    backgroundPosition: "200% center"
                  }
                }
              }}
            >
              VOCAB ADVENTURE
            </Typography>
          </Box>
    
          {/* Category Grid - Centered and Space Efficient */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            mt: 2,
            justifyContent: 'center',
            maxWidth: 1200,
            mx: 'auto'
          }}>
            {displayCategories.map((cat, idx) => {
              const cardTheme = categoryThemes[cat] || categoryThemes.default;
              return (
                <Zoom in={animationReady} style={{ transitionDelay: `${idx * 100}ms` }} key={cat}>
                  <Card
                    sx={{
                      background: cardTheme.gradient,
                      color: cardTheme.color,
                      borderRadius: 6,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                      position: "relative",
                      overflow: "visible",
                      width: { xs: 280, sm: 260, md: 240, lg: 220 },
                      height: 370,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                      }
                    }}
                    elevation={5}
                    onClick={() => {
                      SoundManager.playEffect('button_press');
                      SoundManager.playBgm(); // Ensure BGM starts on user interaction
                      navigate(`/student/classes/${id}/4pic1word/${cat}`);
                    }}
                  >
                    <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Icon with Badge */}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        mb: 2,
                        mt: 1
                      }}>
                        <Box sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.25)',
                          position: 'absolute',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(255,255,255,0.5)' },
                            '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(255,255,255,0)' },
                            '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(255,255,255,0)' }
                          }
                        }} />
                        <Avatar sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: cardTheme.secondaryColor,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }}>
                          {cardTheme.icon}
                        </Avatar>
                        <Badge
                          badgeContent={categoryProgress[cat]?.completedLevels || 0}
                          color="error"
                          max={99}
                          overlap="circular"
                          sx={{
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            '& .MuiBadge-badge': {
                              fontSize: '0.9rem',
                              height: 28,
                              minWidth: 28,
                              borderRadius: '50%',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }
                          }}
                        />
                      </Box>
                      
                      {/* Category Name */}
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        textAlign="center"
                        sx={{
                          fontSize: '1.4rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          letterSpacing: '0.5px',
                          mb: 2,
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Typography>
                      
                      {/* Stats Section */}
                      <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        mb: 3,
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(5px)'
                      }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={800} sx={{ color: 'inherit' }}>
                            {categoryProgress[cat]?.completedLevels || 0}/{categoryProgress[cat]?.totalLevels || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8, fontSize: '0.7rem' }}>
                            LEVELS COMPLETED
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={categoryProgress[cat]?.progressPercentage || 0}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      {/* Play Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIosIcon />}
                        size="large"
                        fullWidth
                        sx={{
                          fontWeight: 700,
                          borderRadius: 8,
                          py: 1.5,
                          fontSize: '1rem',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: cardTheme.secondaryColor,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,1)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                            transform: 'translateY(-3px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          SoundManager.playEffect('button_press');
                          SoundManager.playBgm(); // Ensure BGM starts on user interaction
                          navigate(`/student/classes/${id}/4pic1word/${cat}`);
                        }}
                      >
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              );
            })}
          </Box>
          
          {/* Adventure Chronicles Section - Redesigned */}
          
          <Box sx={{ 
            mt: 6, 
            pt: 4,
            borderTop: '2px solid rgba(255,255,255,0.2)'
          }}>

            {/* 
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h4" 
                fontWeight={800} 
                color="#fff" 
                sx={{ 
                  mb: 1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}
              >
                <AutoStoriesIcon sx={{ fontSize: 40 }} />
                Story Mode
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Unlock word puzzles by progressing through Adventure Mode
              </Typography>
            </Box>
            */}
            <Zoom in={animationReady} style={{ transitionDelay: '800ms' }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  maxWidth: 600,
                  mx: 'auto',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 48px rgba(102, 126, 234, 0.5)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)',
                    pointerEvents: 'none'
                  }
                }}
                onClick={() => {
                  SoundManager.playEffect('button_press');
                  SoundManager.playBgm();
                  navigate(`/student/classes/${id}/4pic1word/Adventure Chronicles`);
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3,
                    mb: 3,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}>
                    <Avatar sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      color: '#4a148c',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}>
                      <AutoStoriesIcon sx={{ fontSize: 45 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="h5" fontWeight={800} color="#fff" gutterBottom>
                        Adventure Chronicles
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', mb: 1 }}>
                        Discover words hidden in the adventure story
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.5,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 999,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Typography variant="body2" fontWeight={700} color="#fff">
                          {adventureUnlocks}/10 Levels Unlocked
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForwardIosIcon />}
                    sx={{
                      py: 1.5,
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      color: '#4a148c',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: '#fff',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      SoundManager.playEffect('button_press');
                      navigate(`/student/classes/${id}/4pic1word/Adventure Chronicles`);
                    }}
                  >
                    Explore Story Words
                  </Button>
                </CardContent>
              </Card>
            </Zoom>
          </Box>
        </Box>
        
        {/* Floating Audio Controls */}
        <AudioControls />
      </Box>
    );    
}

export default CategoryList;