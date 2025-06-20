// File: src/Student/StudentHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api/api';
import '../styles/StudentHomeNature.css';

const fantasyMascots = [
  { name: "Wizard", src: "/fantasy/wizard_avatar.png" },
  { name: "Elf", src: "/fantasy/elf_avatar.png" },
  { name: "Fairy", src: "/fantasy/fairy_avatar.png" }
];

const StudentHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [mascot, setMascot] = useState(fantasyMascots[0]);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    setMascot(fantasyMascots[Math.floor(Math.random() * fantasyMascots.length)]);
    fetchClasses();
    // eslint-disable-next-line
  }, []);

  const fetchClasses = async () => {
    try {
      const classRes = await api.get("/student/classes");
      setClasses(classRes.data);
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleJoinClassSubmit = async (e) => {
    e.preventDefault();
    setJoinError("");
    try {
      await api.post("/student/classes/join", { joinCode });
      setJoinModalOpen(false);
      setJoinCode("");
      await fetchClasses();
    } catch (err) {
      setJoinError("Failed to join class: " + (err.response?.data || "Unknown error"));
    }
  };

  return (
    <Box className="fantasy-root arcade-neon" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Sidebar */}
      <Box className="arcade-sidebar">
        <Box className="arcade-sidebar-btn-group">
          <Button className="arcade-sidebar-btn" startIcon={<span role="img" aria-label="castle">🏰</span>} onClick={() => navigate('/student/classes')}>My Classes</Button>
          <Button className="arcade-sidebar-btn" startIcon={<span role="img" aria-label="scroll">📜</span>} onClick={() => setJoinModalOpen(true)}>Join Class</Button>
          <Button className="arcade-sidebar-btn" startIcon={<span role="img" aria-label="spellbook">📖</span>} onClick={() => navigate('/student/word-of-the-day')}>Word of the Day</Button>
          <Button className="arcade-sidebar-btn" startIcon={<span role="img" aria-label="trophy">🏆</span>} onClick={() => navigate('/leaderboard/wotd')}>Leaderboard</Button>
        </Box>
        <Box className="arcade-sidebar-bottom">
          <Button className="arcade-sidebar-btn" startIcon={<span role="img" aria-label="feedback">💬</span>}>Comments and Feedback</Button>
        </Box>
      </Box>
      {/* Main Content */}
      <Box className="fantasy-content" p={2}>
        {/* Arcade Neon Animated Grid Background */}
        <div className="fantasy-bg" />
        <div className="fantasy-sparkle" />
        {/* Mascot + Greeting */}
        <Box className="mascot-row" display="flex" alignItems="center" mb={2}>
          <Avatar
            src={mascot.src}
            alt={mascot.name}
            className="fantasy-avatar"
            sx={{ width: 64, height: 64, marginRight: 2, boxShadow: 3 }}
          />
          <Box>
            <Typography className="arcade-welcome" variant="h4" fontWeight="bold" gutterBottom>
              Welcome, Apprentice!
            </Typography>
          </Box>
        </Box>
        {/* XP / Level */}
        <Box className="fantasy-xp-bar" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" color="secondary" mb={0.5} style={{ fontFamily: 'Press Start 2P' }}>
            XP PROGRESS
          </Typography>
          <Box sx={{ width: '100%', mt: 1 }}>
            <Box sx={{ height: 8, bgcolor: '#e0c3fc', borderRadius: 4, mb: 1 }}>
              <Box sx={{ width: '60%', height: '100%', bgcolor: '#2563eb', borderRadius: 4 }} />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt={0.5} gap={1}>
            <span role="img" aria-label="magic">🕹️</span>
            <Typography variant="body2" color="text.secondary" style={{ fontFamily: 'Press Start 2P' }}>
              Wizard Level 3 (120 / 200 XP)
            </Typography>
          </Box>
        </Box>
        {/* Spelling Challenge Section */}
        <Typography className="arcade-section-title" variant="h5" mt={2} mb={1} fontWeight="bold">
          <span role="img" aria-label="crystal">👾</span> Spelling Challenge Levels
        </Typography>
        <Box>
          {classes.length === 0 && (
            <Typography color="text.secondary" fontStyle="italic" className="arcade-body">
              (You have not joined any classes yet.)
            </Typography>
          )}
          {classes.map(cls => (
            <Card
              key={cls.id}
              className="arcade-card"
              sx={{
                my: 1.5,
                boxShadow: 4,
                borderRadius: 3,
                transition: "transform 0.2s",
                '&:hover': { transform: "scale(1.03) translateY(-2px)" }
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <span role="img" aria-label="treasure">🪙</span>
                <Box flexGrow={1}>
                  <Typography variant="h6" fontWeight="bold" color="primary.dark" className="arcade-body">
                    {cls.name}
                  </Typography>
                </Box>
                <Button
                  className="arcade-btn"
                  variant="contained"
                  endIcon={<ArrowForwardIosIcon />}
                  onClick={() => navigate(`/student/classes/${cls.id}/spelling-levels`)}
                >
                  View Levels
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
        {/* Logout Button */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            className="arcade-btn logout-btn"
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
        {/* Join Class Modal */}
        <Dialog open={joinModalOpen} onClose={() => setJoinModalOpen(false)}>
          <DialogTitle>Join Class</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Class Code *"
              type="text"
              fullWidth
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              error={!!joinError}
              helperText={joinError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJoinModalOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={handleJoinClassSubmit} className="arcade-btn" color="primary">Join</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default StudentHome;
