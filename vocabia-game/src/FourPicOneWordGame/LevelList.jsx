import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardContent, CircularProgress, Box, Breadcrumbs, Link, Lock
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ListAltIcon from "@mui/icons-material/ListAlt";
import axios from "axios";

const SERVER_URL = "http://localhost:8080";

export default function LevelList() {
  const { category } = useParams();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLevelsAndProgress() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${SERVER_URL}/api/4pic1word-assets/categories/${category}/levels`);
        setLevels(res.data);
        const token = localStorage.getItem("token");
        const progress = await axios.get(`${SERVER_URL}/api/4pic1word/progress/unlocked-level`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnlockedLevel(progress.data.unlockedLevel || 1);
      } catch (err) {
        setError("Failed to load levels.");
        console.error("Error loading levels or progress:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLevelsAndProgress();
  }, [category]);

  if (loading) return (
    <Container sx={{ mt: 8, textAlign: "center" }}>
      <CircularProgress color="secondary" />
      <Typography sx={{ mt: 2 }}>Loading levels...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate("/4pic1word")} style={{ cursor: "pointer" }}>
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Categories
        </Link>
        <Typography color="text.primary">{category}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" sx={{ mb: 4 }}>
        <ListAltIcon sx={{ mr: 1, color: "#29b6f6" }} />
        Levels
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={4}>
        {levels.length === 0 ? (
          <Grid item xs={12}><Typography>No levels found.</Typography></Grid>
        ) : levels.map((level, idx) => {
            const levelNum = Number(level.replace(/level/i, "")) || (idx+1);
            const locked = levelNum > unlockedLevel + 1;
            return (
            <Grid item xs={12} sm={6} md={4} key={level}>
              <Card
                sx={{
                  background: locked ? "rgba(70, 10, 10, 0.7)" : "rgba(10, 70, 20, 0.93)",
                  borderRadius: 3,
                  cursor: locked ? "not-allowed" : "pointer",
                  border: locked ? "2px solid #e57373" : "2px solid #a5d6a7",
                  opacity: locked ? 0.6 : 1,
                  "&:hover": { borderColor: locked ? "#e57373" : "#43a047" }
                }}
                onClick={() => !locked && navigate(`/4pic1word/play/${category}/${level}`)}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ color: "#fff" }}>
                    Level: {level.replace(/level/i, "")}
                  </Typography>
                  <Typography sx={{ color: locked ? "#ffcdd2" : "#c8e6c9" }}>
                    {locked ? "Locked" : "Play this level"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
        )})}
      </Grid>
    </Container>
  );
}
