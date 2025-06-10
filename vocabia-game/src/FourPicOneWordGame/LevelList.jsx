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

export default function LevelList() {
  const { id, category } = useParams(); // id = classroom id
  const [levels, setLevels] = useState([]);
  const [unlocked, setUnlocked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");

    api.get(`/fpow/levels`, { params: { category } })
      .then(res => {
        if (!Array.isArray(res.data)) throw new Error('Invalid response format for levels');
        setLevels(res.data);

        // Simulate unlock logic: only level 1 is unlocked for new user, rest are locked
        // In production, request unlocked status for each level from backend
        const unlockedStatus = {};
        res.data.forEach(lvl => unlockedStatus[lvl] = false);
        if (res.data.includes(1)) unlockedStatus[1] = true;
        setUnlocked(unlockedStatus);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to load levels');
        setLoading(false);
      });
  }, [category, id]);

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
            {category.charAt(0).toUpperCase() + category.slice(1)} Levels
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
              <Grid item xs={12} sm={6} md={4} key={level}>
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
                        <LockOpenIcon color="success" sx={{ fontSize: 38, mb: 1 }} />
                        <Typography variant="h6" fontWeight={600} color="#3b4361" gutterBottom>
                          Level {level}
                        </Typography>
                        <Chip
                          label={<><StarRateIcon sx={{ fontSize: 18, mr: 0.5 }} />Unlocked</>}
                          color="success"
                          sx={{ mb: 2, fontWeight: 500 }}
                        />
                        <Tooltip title="Play this level!">
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<VideogameAssetIcon />}
                            sx={{ fontWeight: 600, borderRadius: 8, mt: 2 }}
                            onClick={() => navigate(`/student/classes/${id}/4pic1word/${category}/level/${level}`)}
                          >
                            Play
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
