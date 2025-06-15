import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Container,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarRateIcon from "@mui/icons-material/StarRate";

const LEVEL_BG = [
  "#D0F8EF", "#F0E7FF", "#F9F3D2", "#FFDDE4", "#D6E4FF", "#FFEEBC"
];

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
  const [userProgress, setUserProgress] = useState(null);
  const navigate = useNavigate();

  // Load completed levels from localStorage or initialize empty object
  const loadCompletedLevels = () => {
    try {
      const saved = localStorage.getItem(`vocabVenture_${category}_completed`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading completed levels:", e);
      return {};
    }
  };

  // Save completed level to localStorage
  const saveCompletedLevel = (level) => {
    try {
      const completed = loadCompletedLevels();
      completed[level] = true;
      localStorage.setItem(`vocabVenture_${category}_completed`, JSON.stringify(completed));
    } catch (e) {
      console.error("Error saving completed level:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadLevels = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch available levels for the category
        // The backend expects requests at /api/fpow/levels based on SecurityConfig
        const res = await api.get(`/api/fpow/levels`, { params: { category } });
        if (!Array.isArray(res.data)) throw new Error('Invalid response format for levels');
        if (isMounted) setLevels(res.data);

        // Initialize unlock map - level 1 is always unlocked
        const unlockMap = { 1: true };
        
        // Sort levels numerically to ensure proper progression
        const sortedLevels = [...res.data].sort((a, b) => Number(a) - Number(b));
        
        // First try to get authenticated user progress from server
        let serverHighestLevel = 0;
        let localHighestLevel = 0;
        let serverCompletedLevels = {};
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
            // Get user progress from server
            // The backend expects requests at /api/user-progress/category based on SecurityConfig
            const progressRes = await api.get(`/api/user-progress/category/${category}`);
            
            if (progressRes.data && Array.isArray(progressRes.data)) {
              // Process server data to get completed levels
              progressRes.data.forEach(progress => {
                const levelNum = Number(progress.level);
                if (levelNum > 0) {
                  serverCompletedLevels[levelNum] = true;
                  if (levelNum > serverHighestLevel) {
                    serverHighestLevel = levelNum;
                  }
                }
              });
              
              console.log("Server completed levels:", serverCompletedLevels);
              console.log("Server highest level:", serverHighestLevel);
            }
          }
        } catch (progressError) {
          console.warn("Error fetching user progress from server:", progressError);
          // Continue with localStorage as fallback
        }
        
        // Determine which data source to use (server takes priority if available)
        const useServerData = isAuthenticated && Object.keys(serverCompletedLevels).length > 0;
        
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
          // For accounts with progress, unlock completed levels and the next one
          const completedLevels = useServerData ? serverCompletedLevels : localCompletedLevels;
          
          // Mark all completed levels as unlocked
          Object.keys(completedLevels).forEach(lvl => {
            unlockMap[Number(lvl)] = true;
          });
          
          // Unlock the next level after the highest completed
          unlockMap[effectiveHighestLevel + 1] = true;
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
  }, [category, id]);

  const handlePlay = lvl => {
    if (!unlocked[lvl]) return; // guard against playing locked levels
    navigate(`/student/classes/${id}/4pic1word/${category}/level/${lvl}`);
  };
  
  // This function would be called when a level is completed
  // It should be passed to the GamePlay component
  const handleLevelComplete = (level) => {
    // Mark the current level as completed
    saveCompletedLevel(level);
    
    // Get the numeric level
    const currentLevel = Number(level);
    
    // Update local state for unlocking levels properly
    setUnlocked(prev => {
      // Create a copy of the current unlock state
      const newUnlocked = { ...prev };
      
      // Always mark the current level as unlocked
      newUnlocked[currentLevel] = true;
      
      // Only unlock the next level if the current level is the highest completed level
      // This prevents skipping levels when replaying earlier levels
      const completedLevels = loadCompletedLevels();
      const completedLevelNumbers = Object.keys(completedLevels).map(Number);
      const highestCompletedLevel = Math.max(...completedLevelNumbers, 0);
      
      // If this is the highest level completed so far, unlock the next level
      if (currentLevel >= highestCompletedLevel) {
        newUnlocked[currentLevel + 1] = true;
      }
      
      return newUnlocked;
    });
  };

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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            {capitalize(category)} Levels
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ fontWeight: 600, borderRadius: 2 }}
            onClick={() => navigate(`/student/classes/${id}/4pic1word`)}
          >
            Categories
          </Button>
        </Box>
        {levels.length === 0 ? (
          <Alert severity="info">No levels available for this category.</Alert>
        ) : (
          <Grid container spacing={3}>
            {levels.map((level, i) => (
              <Grid item xs={12} sm={6} md={2.4} key={level}>
                <Card
                  elevation={4}
                  sx={{
                    background: `linear-gradient(135deg, ${LEVEL_BG[i % LEVEL_BG.length]}, #fff)`,
                    borderRadius: 4,
                    transition: "transform 0.21s",
                    boxShadow: "0 2px 14px rgba(0,0,0,0.10)",
                    '&:hover': unlocked[level] ? { transform: "scale(1.04)", boxShadow: "0 6px 30px rgba(0,80,160,0.13)" } : {},
                  }}
                >
                  <CardContent sx={{
                    textAlign: "center",
                    py: 5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}>
                    {unlocked[level] ? (
                      <>
                        <LockOpenIcon sx={{ fontSize: 38, mb: 1, color: "#388e3c" }} />
                        <Typography variant="h6" fontWeight={600} color="#3b4361" gutterBottom>
                          Level {level}
                        </Typography>
                        <Chip
                          label={<><StarRateIcon sx={{ fontSize: 18, mr: 0.5 }} />Unlocked</>}
                          sx={{ mb: 2, fontWeight: 500, bgcolor: "#388e3c", color: "#fff" }}
                        />
                        <Tooltip title="Play this level!">
                          <Button
                            variant="contained"
                            style={{
                              background: "#9900cc",
                              color: "#fff",
                              borderRadius: 20,
                              fontWeight: 700,
                              marginTop: 12,
                              boxShadow: "0 3px 10px 0 #cacaca"
                            }}
                            startIcon={<VideogameAssetIcon />}
                            onClick={() => handlePlay(level)}
                          >
                            PLAY
                          </Button>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <LockIcon color="disabled" sx={{ fontSize: 38, mb: 1 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                          Level {level}
                        </Typography>
                        <Chip
                          label="Locked"
                          color="default"
                          sx={{ fontWeight: 500, mt: 2 }}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}