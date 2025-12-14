import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import SoundManager from "../sound/SoundManager";
import AudioControls from "../components/AudioControls";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Container,
  Alert,
  CircularProgress,
  Zoom,
  Fade,
  Avatar,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { keyframes } from '@mui/system';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { LEVEL_LIST_STRINGS } from './strings';

// Enhanced level themes with gradients and animations
const LEVEL_THEMES = [
  {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glowColor: '#667eea',
    icon: '🎯',
    difficulty: 'Beginner'
  },
  {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    glowColor: '#f093fb', 
    icon: '🚀',
    difficulty: 'Easy'
  },
  {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    glowColor: '#4facfe',
    icon: '⚡',
    difficulty: 'Medium'
  },
  {
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    glowColor: '#43e97b',
    icon: '🔥',
    difficulty: 'Hard'
  },
  {
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    glowColor: '#fa709a',
    icon: '💎',
    difficulty: 'Expert'
  },
  {
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    glowColor: '#a8edea',
    icon: '👑',
    difficulty: 'Master'
  }
];

// Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), 0 0 40px rgba(102, 126, 234, 0.6); }
`;

// Capitalize
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

export default function LevelList() {
  const { id, category } = useParams();
  const [levels, setLevels] = useState([]);
  const [unlocked, setUnlocked] = useState(() => ({ 1: true })); // level 1 always unlocked
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Removed unused userProgress state
  const [completedLevels, setCompletedLevels] = useState([]); // unique completed levels for progress display
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedLockedLevel, setSelectedLockedLevel] = useState(null);
  const [levelStatuses, setLevelStatuses] = useState({}); // Track active/inactive status for each level
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [selectedInactiveLevel, setSelectedInactiveLevel] = useState(null);
  const navigate = useNavigate();
  
  // Check if this is the Adventure Chronicles category
  const isAdventureChronicles = category === "Adventure Chronicles";

  // Preload effects and try to ensure BGM is running when user is inside the game module
  useEffect(() => {
    SoundManager.preloadEffects();
    SoundManager.playBgm();
    return () => {
      const path = window.location.pathname || '';
      if (!path.includes('4pic1word')) {
        SoundManager.stopAllAudio();
      }
    };
  }, []);

  // Load completed levels from localStorage or initialize empty object
  const loadCompletedLevels = useCallback(() => {
    try {
      // Get user ID from localStorage or use anonymous if not available
      const userId = localStorage.getItem("userId") || "anonymous";
      const saved = localStorage.getItem(`vocabVenture_${userId}_${category}_completed`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading completed levels:", e);
      return {};
    }
  }, [category]);

  // Removed local saveCompletedLevel (handled by GamePlay and backend)

  useEffect(() => {
    let isMounted = true;

    const loadLevels = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch available levels for the category (classroom-specific if id is provided)
        const res = await api.get(`/api/fpow/levels`, { 
          params: id ? { classroomId: id, category } : { category } 
        });
        if (!Array.isArray(res.data)) throw new Error('Invalid response format for levels');
        if (isMounted) setLevels(res.data);
        
        // Fetch level statuses (active/inactive) for each level
        if (id && res.data.length > 0) {
          const statusPromises = res.data.map(async (level) => {
            try {
              const statusRes = await api.get(`/api/fpow/level-status`, {
                params: { classroomId: id, category, level }
              });
              return { level: Number(level), isActive: statusRes.data?.isActive !== false };
            } catch (err) {
              console.warn(`Failed to fetch status for level ${level}:`, err);
              return { level: Number(level), isActive: true }; // Default to active if status fetch fails
            }
          });
          const statuses = await Promise.all(statusPromises);
          const statusMap = {};
          statuses.forEach(s => {
            statusMap[s.level] = s.isActive;
          });
          if (isMounted) setLevelStatuses(statusMap);
        } else {
          // For non-classroom categories (Adventure Mode), assume all are active
          const statusMap = {};
          res.data.forEach(level => {
            statusMap[Number(level)] = true;
          });
          if (isMounted) setLevelStatuses(statusMap);
        }

        // Initialize unlock map
        const unlockMap = {};
        
        // Special handling for Adventure Chronicles category
        if (isAdventureChronicles) {
          try {
            // Fetch unlocked levels from Adventure progress
            const adventureRes = await api.get('/api/adventure/profile/unlocked-fpow-levels');
            const unlockedLevels = adventureRes.data?.unlockedLevels || [];
            const unlockedSet = new Set(unlockedLevels.map(Number));
            
            // Ensure we have all 10 levels (even if not in database)
            const allLevels = res.data.length > 0 ? res.data : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            // Only unlock levels that have been earned through Adventure Mode
            allLevels.forEach(lvl => {
              unlockMap[Number(lvl)] = unlockedSet.has(Number(lvl));
            });
            
            console.log("Adventure Chronicles - Total levels:", allLevels.length);
            console.log("Adventure Chronicles unlocks:", Array.from(unlockedSet));
            console.log("Unlock map:", unlockMap);
            
            // Update levels state if we had to use default list
            if (res.data.length === 0 && isMounted) {
              setLevels(allLevels);
            }
            
            // Fetch completed levels for progress tracking
            try {
              const token = localStorage.getItem("token");
              if (token) {
                const completedRes = await api.get(`/api/user-progress/completed-levels`, { 
                  params: id ? { category, classroomId: id } : { category } 
                });
                const completedArr = (completedRes.data && Array.isArray(completedRes.data.completedLevels)) ? completedRes.data.completedLevels : [];
                const completedLevelNumbers = completedArr.map(Number);
                console.log("Adventure Chronicles completed levels:", completedLevelNumbers);
                if (isMounted) {
                  setCompletedLevels(completedLevelNumbers);
                }
              } else {
                // Fallback to localStorage for non-authenticated users
                const localCompleted = loadCompletedLevels();
                const localCompletedNumbers = Object.keys(localCompleted).map(Number);
                if (isMounted) {
                  setCompletedLevels(localCompletedNumbers);
                }
              }
            } catch (completedErr) {
              console.warn("Could not fetch completed levels:", completedErr);
              if (isMounted) {
                setCompletedLevels([]);
              }
            }
          } catch (adventureErr) {
            console.warn("Could not fetch Adventure unlocks, all levels locked:", adventureErr);
            // If can't fetch, lock all levels
            const allLevels = res.data.length > 0 ? res.data : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            allLevels.forEach(lvl => {
              unlockMap[Number(lvl)] = false;
            });
            if (res.data.length === 0 && isMounted) {
              setLevels(allLevels);
            }
          }
          
          if (isMounted) {
            setUnlocked(unlockMap);
            setLoading(false);
          }
          return; // Skip normal unlock logic for Adventure Chronicles
        }
        
        // Normal unlock logic for other categories
        // level 1 is always unlocked for non-Adventure categories
        unlockMap[1] = true;
        
        // Sort levels numerically to ensure proper progression
        const sortedLevels = [...res.data].sort((a, b) => Number(a) - Number(b));
        
        // First try to get authenticated user progress from server
        let serverHighestLevel = 0;
        let localHighestLevel = 0;
        let serverCompletedLevelsList = [];
        let localCompletedLevels = {};
        let isAuthenticated = false;
        
        // Always load local data as a backup
        localCompletedLevels = loadCompletedLevels();
        const localCompletedLevelNumbers = Object.keys(localCompletedLevels).map(Number);
        localHighestLevel = localCompletedLevelNumbers.length > 0 ? 
                           Math.max(...localCompletedLevelNumbers) : 0;
        
        // Try to get server data if user is authenticated
        try {
          const token = localStorage.getItem("token");
          if (token) {
            isAuthenticated = true;
            // Use dedicated endpoint that returns unique completed levels and next unlocked
            const completedRes = await api.get(`/api/user-progress/completed-levels`, { 
              params: id ? { category, classroomId: id } : { category } 
            });
            const completedArr = (completedRes.data && Array.isArray(completedRes.data.completedLevels)) ? completedRes.data.completedLevels : [];
            serverCompletedLevelsList = completedArr.map(Number);
            serverHighestLevel = Math.max(...serverCompletedLevelsList, 0);
            console.log("Server completed levels:", serverCompletedLevelsList);
            console.log("Server highest level:", serverHighestLevel);
          }
        } catch (progressError) {
          console.warn("Error fetching user progress from server:", progressError);
          // Continue with localStorage as fallback
        }
        
        // Determine which data source to use (server takes priority if available)
        const useServerData = isAuthenticated && serverCompletedLevelsList.length > 0;
        
        // Calculate the effective highest level from either server or local data
        const effectiveHighestLevel = useServerData ? 
                                     Math.max(serverHighestLevel, localHighestLevel) : 
                                     localHighestLevel;
        
        console.log("Using server data:", useServerData);
        console.log("Local highest level:", localHighestLevel);
        console.log("Effective highest level:", effectiveHighestLevel);
        
        // For new accounts with no progress, only level 1 should be unlocked
        if (effectiveHighestLevel === 0) {
          // Reset unlock map to only have level 1 unlocked
          Object.keys(unlockMap).forEach(key => {
            if (Number(key) !== 1) {
              delete unlockMap[key];
            }
          });
        } else {
          // For accounts with progress, unlock all levels up to highestCompleted + 1 (progression model)
          const completedArray = useServerData 
            ? serverCompletedLevelsList 
            : Object.keys(localCompletedLevels).map(Number);

          // Persist completed levels for rendering and progress bar
          if (isMounted) setCompletedLevels(completedArray);

          // Determine threshold to unlock: highest completed + 1
          const threshold = Math.min(effectiveHighestLevel + 1, Math.max(...sortedLevels, 1));
          sortedLevels.forEach(lvlVal => {
            if (lvlVal <= threshold) {
              unlockMap[lvlVal] = true;
            }
          });
        }
        
        // Always ensure level 1 is unlocked
        unlockMap[1] = true;
        
        if (isMounted) {
          console.log("Final unlock map:", unlockMap);
          setUnlocked(unlockMap);
        }
      } catch (err) {
        console.error("Error loading levels:", err);
        if (isMounted) setError("Failed to load levels. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLevels();

    return () => {
      isMounted = false;
    };
  }, [category, id, loadCompletedLevels, isAdventureChronicles]);

  const handlePlay = (lvl) => {
    // Check if level is inactive
    if (id && levelStatuses[lvl] === false) {
      setSelectedInactiveLevel(lvl);
      setShowInactiveDialog(true);
      return;
    }
    
    if (!unlocked[lvl]) {
      // For Adventure Chronicles, show special unlock message
      if (isAdventureChronicles) {
        setSelectedLockedLevel(lvl);
        setShowUnlockDialog(true);
        return;
      }
      return; // guard against playing locked levels
    }
    SoundManager.playEffect('button_press');
    SoundManager.playBgm();
    navigate(`/student/classes/${id}/4pic1word/${category}/level/${lvl}`);
  };
  
  const handleCloseDialog = () => {
    setShowUnlockDialog(false);
    setSelectedLockedLevel(null);
  };
  
  const handleGoToAdventure = () => {
    SoundManager.playEffect('button_press');
    navigate('/map'); // Navigate to Adventure Mode map
  };
  
  // Removed unused handleLevelComplete function

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
  if (error) return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        minHeight: '100vh',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 6, md: 8 },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        animation: `${float} 6s ease-in-out infinite`
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        animation: `${float} 8s ease-in-out infinite reverse`
      }} />
      
      <Container maxWidth="lg">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{
            textAlign: 'center',
            mb: 6,
            position: 'relative',
            zIndex: 2
          }}>
            <IconButton
              onClick={() => {
                SoundManager.playEffect('button_press');
                navigate(`/student/classes/${id}/4pic1word`);
              }}
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              color="white"
              sx={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(45deg, #ffffff, #e3f2fd, #ffffff)',
                backgroundSize: '200% auto',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                animation: 'shine 3s linear infinite',
                '@keyframes shine': {
                  'to': {
                    backgroundPosition: '200% center'
                  }
                }
              }}
            >
              {capitalize(category)} Levels
            </Typography>
            
            <Typography
              variant="h6"
              color="rgba(255,255,255,0.8)"
              sx={{
                fontWeight: 400,
                letterSpacing: '1px'
              }}
            >
              {LEVEL_LIST_STRINGS.chooseChallenge}
            </Typography>
            
            {/* Progress indicator */}
            <Box sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  {LEVEL_LIST_STRINGS.progress}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  {completedLevels.length}/{levels.length}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(completedLevels.length / Math.max(levels.length, 1)) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
                  }
                }}
              />
            </Box>
          </Box>
        </Fade>
        
        {levels.length === 0 ? (
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            {LEVEL_LIST_STRINGS.noLevels}
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(180px, 1fr))',
              gap: 4,
              justifyContent: 'center',
              justifyItems: 'center',
              alignItems: 'stretch',
              mx: 'auto',
              maxWidth: { xs: '100%', lg: 1200 }
            }}
          >
            {levels.map((level, i) => {
              const theme = LEVEL_THEMES[i % LEVEL_THEMES.length];
              const isUnlocked = Boolean(unlocked[Number(level)]);
              const isActive = levelStatuses[Number(level)] !== false; // Default to true if not loaded yet
              const isInactive = id && levelStatuses[Number(level)] === false;

              return (
                <Zoom in timeout={600 + i * 100} key={level}>
                  <Card
                      sx={{
                        background: theme.gradient,
                        borderRadius: 6,
                        position: 'relative',
                        overflow: 'visible',
                        minHeight: 260,
                        width: 220,
                        cursor: (isUnlocked && isActive) ? 'pointer' : 'default',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: (isUnlocked && isActive) ? 'none' : isInactive ? 'grayscale(1) brightness(0.5)' : 'grayscale(0.8) brightness(0.6)',
                        opacity: (isUnlocked && isActive) ? 1 : isInactive ? 0.4 : 0.5,
                        boxShadow: isUnlocked 
                          ? `0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px ${theme.glowColor}40`
                          : '0 5px 15px rgba(0,0,0,0.1)',
                        '&:hover': isUnlocked ? {
                          transform: 'translateY(-15px) scale(1.02)',
                          boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${theme.glowColor}60`,
                          animation: `${glow} 2s ease-in-out infinite`
                        } : {
                          filter: 'grayscale(0.7) brightness(0.7)',
                          opacity: 0.6
                        },
                        '&::before': isUnlocked ? {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: theme.gradient,
                          borderRadius: 8,
                          zIndex: -1,
                          opacity: 0.7,
                          filter: 'blur(8px)'
                        } : {},
                        '&::after': !isUnlocked ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
                          borderRadius: 6,
                          zIndex: 1,
                          pointerEvents: 'none'
                        } : {}
                      }}
                      onClick={() => isUnlocked && handlePlay(level)}
                    >
                      <CardContent sx={{
                        textAlign: 'center',
                        py: 4,
                        px: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '100%',
                        position: 'relative'
                      }}>
                        {/* Level Icon/Avatar */}
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              fontSize: '2rem',
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '2px solid rgba(255,255,255,0.3)',
                              animation: isUnlocked ? `${pulse} 2s ease-in-out infinite` : 'none',
                              zIndex: 2,
                              position: 'relative'
                            }}
                          >
                            {isUnlocked ? theme.icon : '🔒'}
                          </Avatar>
                          
                          {/* Level number badge */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              border: '2px solid rgba(255,255,255,0.9)',
                              zIndex: 2
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={800}
                              color="white"
                              fontSize="0.8rem"
                            >
                              {level}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Level Info */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="white"
                            gutterBottom
                            sx={{
                              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                              fontSize: { xs: '1.3rem', sm: '1.5rem' }
                            }}
                          >
                            Level {level}
                          </Typography>
                          
                          <Chip
                            label={isInactive ? 'Inactive' : (isUnlocked ? theme.difficulty : 'Locked')}
                            size="small"
                            icon={!isUnlocked ? <Box sx={{ 
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}>🔒</Box> : undefined}
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              mt: 1,
                              zIndex: 2,
                              position: 'relative',
                              '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: '0.9rem'
                              }
                            }}
                          />
                        </Box>
                      
                      {/* Action Button */}
                      <Button
                        variant="contained"
                        startIcon={(isUnlocked && isActive) ? <PlayArrowIcon /> : <Box sx={{ fontSize: '1.2rem' }}>🔒</Box>}
                        fullWidth
                        disabled={!isUnlocked || isInactive}
                        aria-label={(isUnlocked && isActive) ? `Play level ${level}` : isInactive ? 'Level inactive' : LEVEL_LIST_STRINGS.locked}
                        sx={{
                          mt: 2,
                          py: 1.6,
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          borderRadius: 999,
                          background: isUnlocked
                            ? 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.12))',
                          color: isUnlocked ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          boxShadow: isUnlocked 
                            ? '0 10px 30px rgba(255, 193, 7, 0.45), 0 2px 8px rgba(0,0,0,0.25)'
                            : 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '1.2px',
                          zIndex: 2,
                          position: 'relative',
                          textShadow: isUnlocked ? '0 2px 6px rgba(0,0,0,0.25)' : 'none',
                          border: isUnlocked ? '2px solid rgba(255,255,255,0.85)' : '1px solid rgba(255,255,255,0.2)',
                          '& .MuiButton-startIcon': {
                            color: isUnlocked ? '#ffffff' : 'rgba(255,255,255,0.6)'
                          },
                          '&:hover': isUnlocked ? {
                            background: 'linear-gradient(135deg, #FFDF4D 0%, #FFB300 100%)',
                            transform: 'translateY(-3px) scale(1.02)',
                            boxShadow: '0 14px 36px rgba(255, 193, 7, 0.55), 0 4px 12px rgba(0,0,0,0.3)'
                          } : {},
                          '&:focus-visible': isUnlocked ? {
                            outline: '3px solid rgba(255,255,255,0.9)',
                            outlineOffset: '2px'
                          } : {},
                          '&:disabled': {
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08))',
                            color: 'rgba(255,255,255,0.45)',
                            border: '1px solid rgba(255,255,255,0.18)'
                          },
                          transition: 'all 0.25s ease'
                        }}
                        onClick={(e) => { e.stopPropagation(); (isUnlocked && isActive) && handlePlay(level); }}
                      >
                        {isInactive ? 'Inactive' : (isUnlocked ? LEVEL_LIST_STRINGS.play : LEVEL_LIST_STRINGS.locked)}
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              );
            })}
          </Box>
        )}
      </Container>
      
      {/* Floating Audio Controls */}
      <AudioControls />
      
      {/* Adventure Chronicles Unlock Dialog */}
      <Dialog
        open={showUnlockDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontSize: '1.8rem', 
          fontWeight: 800,
          pt: 4
        }}>
          🔒 Level Locked
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Continue your adventure to unlock this word!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
            This level contains a story keyword from Adventure Mode. 
            Complete the corresponding Jungle Lush level to unlock it and discover the word hidden in the narrative.
          </Typography>
          {selectedLockedLevel && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                💡 Hint: Level {selectedLockedLevel} unlocks after progressing through the Adventure story!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4, gap: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              },
              borderRadius: 999,
              px: 3,
              py: 1
            }}
          >
            Stay Here
          </Button>
          <Button
            onClick={handleGoToAdventure}
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              color: 'white',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #FFDF4D 0%, #FFB300 100%)',
                transform: 'scale(1.05)'
              },
              borderRadius: 999,
              px: 4,
              py: 1,
              boxShadow: '0 8px 20px rgba(255, 193, 7, 0.4)'
            }}
          >
            Go to Adventure Mode
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Inactive Level Dialog */}
      <Dialog
        open={showInactiveDialog}
        onClose={() => setShowInactiveDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontSize: '1.8rem', 
          fontWeight: 800,
          pt: 4
        }}>
          ⚠️ Level Inactive
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            This level is currently inactive and has been disabled by the teacher.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
            Level {selectedInactiveLevel} is not available for play at this time. 
            Please check back later or contact your teacher if you have questions.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
          <Button
            onClick={() => setShowInactiveDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              color: 'white',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #FFDF4D 0%, #FFB300 100%)',
                transform: 'scale(1.05)'
              },
              borderRadius: 999,
              px: 4,
              py: 1,
              boxShadow: '0 8px 20px rgba(255, 193, 7, 0.4)'
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}