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
        const res = await api.get(`/fpow/levels`, { params: { category } });
        if (!Array.isArray(res.data)) throw new Error('Invalid response format for levels');
        if (isMounted) setLevels(res.data);

        // Initialize unlock map - level 1 is always unlocked
        const unlockMap = { 1: true };
        const completedLevels = loadCompletedLevels();
        
        // Sort levels numerically to ensure proper progression
        const sortedLevels = [...res.data].sort((a, b) => Number(a) - Number(b));
        
        // First pass: mark completed levels as unlocked
        sortedLevels.forEach(lvl => {
          const levelNum = Number(lvl);
          if (completedLevels[levelNum]) {
            unlockMap[levelNum] = true;
          }
        });
        
        // Find the highest completed level
        const completedLevelNumbers = Object.keys(completedLevels).map(Number);
        const highestCompletedLevel = Math.max(...completedLevelNumbers, 0);
        
        // Second pass: only unlock the next level after the highest completed level
        // This prevents skipping levels when returning to the level list
        sortedLevels.forEach(lvl => {
          const levelNum = Number(lvl);
          
          // Level 1 is always unlocked
          if (levelNum === 1) {
            unlockMap[levelNum] = true;
          }
          // Only unlock the next sequential level after the highest completed level
          else if (levelNum === highestCompletedLevel + 1) {
            unlockMap[levelNum] = true;
          }
        });
        
        // Try to get authenticated user progress if available
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const progressRes = await api.get('/user-progress/last-played');
            if (progressRes.data && progressRes.data.category === category) {
              const serverHighestLevel = progressRes.data.currentLevel;
              
              // Compare server data with local data and use the higher value
              const effectiveHighestLevel = Math.max(serverHighestLevel, highestCompletedLevel);
              
              // Mark all levels up to the highest completed as unlocked
              for (let i = 1; i <= effectiveHighestLevel; i++) {
                unlockMap[i] = true;
              }
              
              // Only unlock the next level after the highest completed
              if (effectiveHighestLevel > 0) {
                unlockMap[effectiveHighestLevel + 1] = true;
              }
            }
          }
        } catch (e) {
          // Continue with local unlock state if API call fails
          console.warn("Could not fetch user progress, using local data", e);
        }
        
        if (isMounted) setUnlocked(unlockMap);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || err.message || 'Failed to load levels');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLevels();
    return () => { isMounted = false; };
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
