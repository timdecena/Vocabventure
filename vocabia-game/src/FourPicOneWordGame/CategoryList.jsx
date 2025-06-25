// src/FourPicOneWordGame/CategoryList.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  Container,
  Avatar,
  Chip,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import PetsIcon from "@mui/icons-material/Pets";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import HomeIcon from "@mui/icons-material/Home";
import api from "../api/api";
import { Zoom } from "@mui/material";

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
  const [userProgress, setUserProgress] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [animationReady, setAnimationReady] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);

        // Fetch categories
        const categoriesRes = await api.get("/api/fpow/categories");
        const categoriesData = categoriesRes.data || [];
        setCategories(categoriesData);

        // Initialize progress object
        const progressData = {};

        // If authenticated, try to get progress from server
        if (token) {
          try {
            // Fetch all user progress
            const progressRes = await api.get("/api/user-progress/all");

            // Process server data
            if (progressRes.data && Array.isArray(progressRes.data)) {
              progressRes.data.forEach(progress => {
                const category = progress.category;
                if (category) {
                  progressData[category] = {
                    completedLevels: progress.puzzlesSolved || 0,
                    Level: progress.Level || 1,
                  };
                }
              });
            }
          } catch (progressError) {
            console.warn("Error fetching user progress:", progressError);
            // Continue with local storage as fallback
          }
        }

        // Only use localStorage as fallback when not authenticated
        if (!token) {
          categoriesData.forEach(category => {
            if (!progressData[category]) {
              // Add user ID to localStorage keys to ensure per-user progress
              const userId = localStorage.getItem("userId") || "anonymous";
              const completedKey = `vocabVenture_${userId}_${category}_completed`;
              const highestKey = `vocabVenture_${userId}_${category}_highest`;

              const completedLevels = localStorage.getItem(completedKey);
              const highestLevel = localStorage.getItem(highestKey) || "1";

              progressData[category] = {
                completedLevels: completedLevels ? JSON.parse(completedLevels) : [],
                Level: parseInt(highestLevel, 10),
              };
            }
          });
        } else {
          // For authenticated users without progress, initialize empty progress
          categoriesData.forEach(category => {
            if (!progressData[category]) {
              progressData[category] = {
                completedLevels: [],
                Level: 1,
              };
            }
          });
        }

        setUserProgress(progressData);
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
  }, []);
  
  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (isXs) return 12; // 1 column on mobile
    if (isSm) return 6;  // 2 columns on tablet
    if (isMd) return 4;  // 3 columns on medium screens
    return 3;            // 4 columns on large screens
  };

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
    
          {/* Category Grid */}
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            {categories.map((cat, idx) => {
              const theme =
                categoryThemes[cat] || categoryThemes.default;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat}>
                  <Zoom in={animationReady} style={{ transitionDelay: `${idx * 100}ms` }}>
                    <Card
                      sx={{
                        background: theme.gradient,
                        color: theme.color,
                        borderRadius: 6,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                        position: "relative",
                        overflow: "visible",
                        minHeight: 370,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 2,
                      }}
                      elevation={5}
                    >
                      <CardContent>
                        {/* Icon */}
                        <Box
                          sx={{
                            mb: 2,
                            mt: 1,
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.25)',
                              position: 'absolute',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': {
                                  transform: 'scale(0.95)',
                                  boxShadow: '0 0 0 0 rgba(255,255,255,0.5)',
                                },
                                '70%': {
                                  transform: 'scale(1)',
                                  boxShadow: '0 0 0 10px rgba(255,255,255,0)',
                                },
                                '100%': {
                                  transform: 'scale(0.95)',
                                  boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                                },
                              },
                            }}
                          />
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              color: theme.secondaryColor,
                              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            }}
                          >
                            {theme.icon}
                          </Avatar>
                          <Badge
                            badgeContent={userProgress[cat]?.completedLevels || 0}
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
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              }
                            }}
                          />
                        </Box>
                        {/* Category Name */}
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          gutterBottom
                          fontSize={{ xs: '1.3rem', sm: '1.5rem' }}
                          textAlign="center"
                          sx={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            letterSpacing: '0.5px',
                            mb: 2,
                          }}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Typography>
                        {/* Stats Section */}
                        <Box
                          sx={{
                            width: '100%',
                            mb: 3,
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(5px)',
                          }}
                        >
                          {/* Stats Grid */}
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 1.5,
                          }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={800} sx={{ color: 'inherit' }}>
                                {userProgress[cat]?.completedLevels || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8, fontSize: '0.7rem' }}>
                                COMPLETED
                              </Typography>
                            </Box>
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
                            px: { xs: 2, sm: 3, md: 4 },
                            py: { xs: 1.5, sm: 1.8 },
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: theme.secondaryColor,
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
                          onClick={() => navigate(`/student/classes/${id}/4pic1word/${cat}`)}
                        >
                          Play Now
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    );    
}

export default CategoryList;