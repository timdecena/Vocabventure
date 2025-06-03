// File: src/Student/StudentHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ForestIcon from '@mui/icons-material/Forest';
import PetsIcon from '@mui/icons-material/Pets';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import StarRateIcon from '@mui/icons-material/StarRate';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api/api';
import '../styles/StudentHomeNature.css';

const animalMascots = [
  { name: "Owl", src: "/nature/owl_mascot.png" },
  { name: "Fox", src: "/nature/fox_mascot.png" },
  { name: "Squirrel", src: "/nature/squirrel_mascot.png" }
];

const StudentHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [mascot, setMascot] = useState(animalMascots[0]); // Random mascot

  useEffect(() => {
    setMascot(animalMascots[Math.floor(Math.random() * animalMascots.length)]);
    const fetchData = async () => {
      try {
        const classRes = await api.get("/student/classes");
        setClasses(classRes.data);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <Box className="nature-root">
      {/* Parallax Adventure Background */}
      <div className="nature-bg-parallax" />
      {/* Animated overlays */}
      <div className="nature-bg-foreground" />

      {/* Page content */}
      <Box className="nature-content" p={2}>
        {/* Mascot + Greeting */}
        <Box className="mascot-row" display="flex" alignItems="center" mb={2}>
          <Avatar
            src={mascot.src}
            alt={mascot.name}
            className="nature-mascot"
            sx={{ width: 64, height: 64, marginRight: 2, boxShadow: 3 }}
          />
          <Box>
            <Typography className="welcome-text" variant="h4" fontWeight="bold" gutterBottom>
              Welcome, Explorer!
            </Typography>

          </Box>
        </Box>

        {/* XP / Level (placeholder, connect to real progress system later) */}
        <Box className="xp-bar" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" color="secondary" mb={0.5}>
            XP Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={60}
            className="nature-xp-progress"
            sx={{ height: 12, borderRadius: 6, background: "#bfe0c7" }}
          />
          <Box display="flex" alignItems="center" mt={0.5} gap={1}>
            <StarRateIcon color="warning" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Level 3 (120 / 200 XP)
            </Typography>
          </Box>
        </Box>

        {/* Main navigation buttons */}
        <Grid container spacing={2} className="nature-nav-btns" mb={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              className="nature-btn"
              variant="contained"
              fullWidth
              startIcon={<ForestIcon />}
              onClick={() => navigate('/student/classes')}
            >
              My Classes
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              className="nature-btn"
              variant="contained"
              fullWidth
              startIcon={<Home />}
              onClick={() => navigate('/student/classes/join')}
            >
              Join Class
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              className="nature-btn"
              variant="contained"
              fullWidth
              startIcon={<EmojiNatureIcon />}
              onClick={() => navigate('/student/word-of-the-day')}
            >
              Word of the Day
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              className="nature-btn"
              variant="contained"
              fullWidth
              startIcon={<StarRateIcon />}
              onClick={() => navigate('/leaderboard/wotd')}
            >
              WOTD Leaderboard
            </Button>
          </Grid>
        </Grid>

        {/* Spelling Challenge Section */}
        <Typography className="section-title" variant="h5" mt={2} mb={1} fontWeight="bold">
          <EmojiNatureIcon sx={{ mr: 1, color: "#4caf50" }} /> Spelling Challenge Levels
        </Typography>
        <Box>
          {classes.length === 0 && (
            <Typography color="text.secondary" fontStyle="italic">
              (You have not joined any classes yet.)
            </Typography>
          )}
          {classes.map(cls => (
            <Card
              key={cls.id}
              className="nature-card"
              sx={{
                my: 1.5,
                boxShadow: 4,
                borderRadius: 3,
                transition: "transform 0.2s",
                '&:hover': { transform: "scale(1.03) translateY(-2px)" }
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <PetsIcon className="class-icon" sx={{ mr: 2, fontSize: 32, color: "#78a06b" }} />
                <Box flexGrow={1}>
                  <Typography variant="h6" fontWeight="bold" color="primary.dark">
                    {cls.name}
                  </Typography>
                </Box>
                <Tooltip title="Explore Levels!" arrow>
                  <Button
                    className="nature-btn"
                    variant="contained"
                    endIcon={<ArrowForwardIosIcon />}
                    onClick={() => navigate(`/student/classes/${cls.id}/spelling-levels`)}
                  >
                    View Levels
                  </Button>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Logout */}
        <Box mt={5} mb={2} textAlign="center">
          <Button
            className="nature-btn logout-btn"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentHome;
