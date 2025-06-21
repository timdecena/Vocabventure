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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import api from '../api/api';
import '../styles/StudentHomeNature.css';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TodayIcon from '@mui/icons-material/Today';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FeedbackIcon from '@mui/icons-material/Feedback';
import StudentWOTDCard from "../WordOfTheDay/StudentWOTDCard"; // update path as needed

const GlobalSidebarStyles = () => (
  <style>{`
    .arcade-sidebar {
      position: fixed;
      top: 64px;
      left: 0;
      width: 200px;
      height: calc(100vh - 64px);
      background: rgba(24, 24, 27, 0.85);
      border-right: 2px solid #00eaff;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 100;
      padding: 32px 0 0 0;
      box-shadow: 0 0 32px #00eaff33;
      transition: transform 0.4s ease-in-out;
      transform: translateX(0);
    }
    .arcade-sidebar.hidden {
      transform: translateX(-100%);
    }

    /* This group will stay at the top */
    .arcade-sidebar-btn-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      align-items: center;
    }

    /* This container will be pushed to the very bottom */
    .arcade-sidebar-bottom {
      margin-top: auto;
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 36px;
      padding-bottom: 0;
    }
    
    .sidebar-toggle-btn {
      position: fixed;
      top: calc(64px + (100vh - 64px) / 2);
      left: 200px;
      transform: translate(-50%, -50%);
      z-index: 101;
      background: #18181b !important;
      color: #00eaff !important;
      border: 1px solid #00eaff !important;
      
      /* --- RECTANGULAR REDESIGN START --- */
      width: 28px !important;
      height: 60px !important;
      min-width: unset !important;
      border-radius: 0 8px 8px 0 !important;
      /* --- RECTANGULAR REDESIGN END --- */

      padding: 0 !important;
      box-shadow: 0 0 12px #00eaff80;
      transition: all 0.4s ease;
    }
    .sidebar-toggle-btn:hover {
      background-color: #00eaff22 !important;
      transform: translate(-50%, -50%) scale(1.05); /* Keep centering transform */
    }
    .sidebar-toggle-btn.open {
      left: 200px;
    }
    .sidebar-toggle-btn:not(.open) {
      left: 14px; /* Half of the new width (28px) to sit flush against the edge */
    }
    .fantasy-content {
        transition: margin-left 0.4s ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: flex-start; /* Align content to the top */
        align-items: center;
        flex-grow: 1;
        padding: 2rem;
    }
    .arcade-sidebar-btn {
      width: 176px;
      height: auto;
      min-height: 48px;
      background: #18181b80;
      color: #fff !important;
      font-family: 'Press Start 2P', cursive;
      font-size: 0.7rem !important;
      font-weight: 500;
      justify-content: space-between !important;
      align-items: center;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      border: 1px solid #00eaff;
      box-shadow: 0 0 8px #00eaff80;
      display: flex !important;
      white-space: normal;
      line-height: 1.3;
      transition: all 0.3s ease;
      position: relative;
    }

    .arcade-btn-text {
      text-align: left;
      pointer-events: none;
    }

    .arcade-btn-arrow {
      font-family: 'Press Start 2P', cursive;
      font-size: 1rem;
      color: #00eaff;
      text-shadow: 0 0 8px #00eaff;
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .arcade-sidebar-btn:hover {
      transform: translateX(5px);
      border-color: #ff00c8;
      box-shadow: 0 0 16px #ff00c8;
    }

    .arcade-sidebar-btn:hover .arcade-btn-arrow {
      color: #ff00c8;
      text-shadow: 0 0 8px #ff00c8;
      transform: translateX(3px);
    }
    
    .arcade-sidebar-btn-feedback {
        border-color: #ffb86c;
    }

    .arcade-sidebar-btn-feedback:hover {
        border-color: #ff5af7;
        box-shadow: 0 0 16px #ff5af7;
    }
  `}</style>
);

const fantasyMascots = [
  { name: "Wizard", src: "/fantasy/wizard_avatar.png" },
  { name: "Elf", src: "/fantasy/elf_avatar.png" },
  { name: "Fairy", src: "/fantasy/fairy_avatar.png" }
];

const StudentHome = ({ setIsAuthenticated, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [mascot, setMascot] = useState(fantasyMascots[0]);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [customWordListModalOpen, setCustomWordListModalOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});

  useEffect(() => {
api.get("/user-progress/student-info")
    .then(res => setStudentInfo(res.data))
    .catch(err => console.error("Failed to load student info", err));
}, []);


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
    <>
      <GlobalSidebarStyles />
      <Box className="fantasy-root arcade-neon" style={{ display: 'flex', minHeight: '100vh', position: 'relative', alignItems: 'flex-start', paddingTop: '75px' }}>
        {/* Sidebar and Toggle Button Wrapper */}
        <Box>
          <Box className={`arcade-sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
            {/* Sidebar Content */}
            <Box className="arcade-sidebar-btn-group">
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/student/classes')}>
                <span className="arcade-btn-text">My Classes</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => setJoinModalOpen(true)}>
                <span className="arcade-btn-text">Join Class</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/student/word-of-the-day')}>
                <span className="arcade-btn-text">Word of the Day</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => setCustomWordListModalOpen(true)}>
                <span className="arcade-btn-text">Custom Word List</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/leaderboard/wotd')}>
                <span className="arcade-btn-text">Leaderboard</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
            </Box>
            <Box className="arcade-sidebar-bottom">
              <Button className="arcade-sidebar-btn arcade-sidebar-btn-feedback" onClick={() => navigate('/student/feedback')}>
                <span className="arcade-btn-text">Comments and Feedback</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
            </Box>
          </Box>

          {/* TOGGLE BUTTON IS NOW OUTSIDE THE SIDEBAR */}
          <Button className={`sidebar-toggle-btn ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </Button>
        </Box>

        {/* Main Content */}
        <Box
          className="fantasy-content"
          style={{
            marginLeft: isSidebarOpen ? '200px' : '0px',
            flexGrow: 1,
            padding: '2rem',
            position: 'relative',
            top: '-80px',

          }}
        >
          {/* Arcade Neon Animated Grid Background */}
          <div className="fantasy-bg" />
          <div className="fantasy-sparkle" />
          
          {/* The one and only content container */}
          <Box className="arcade-profile-container">
            {/* Rank Icon in top right corner */}
            <div className="arcade-profile-rank-icon">
              <span role="img" aria-label="rank">🏆</span>
              <span>LVL 24</span>
            </div>

            {/* Top Row: Avatar + Name/Subtitle + Stats */}
            <Box className="arcade-profile-header" sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 3 }}>
              <Avatar className="arcade-profile-avatar" sx={{ width: 90, height: 90, mr: 4 }} />
              <Box sx={{ flexGrow: 1 }}>
                <div className="arcade-profile-name">
  {studentInfo.firstName} {studentInfo.lastName}
</div>
                <div className="arcade-profile-subtitle">Bonus booster 24lv</div>
                <Box className="arcade-profile-stats-row">
                <Box className="arcade-profile-stat-card">
  <div className="arcade-profile-stat-icon">💰</div>
  <div className="arcade-profile-stat-value">{studentInfo.gold ?? 0}</div>
  <div className="arcade-profile-stat-label">Gold</div>
</Box>

                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">📚</div>
                    <div className="arcade-profile-stat-value">27</div>
                    <div className="arcade-profile-stat-label">Levels Passed</div>
                  </Box>
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">⏱️</div>
                    <div className="arcade-profile-stat-value">27min</div>
                    <div className="arcade-profile-stat-label">Fastest Time</div>
                  </Box>
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">✔️</div>
                    <div className="arcade-profile-stat-value">200</div>
                    <div className="arcade-profile-stat-label">Correct Answers</div>
                  </Box>
                </Box>
              </Box>
            </Box>
            {/* --- Middle Row: Current Classes + Word of the Day --- */ }
            <Box className="arcade-middle-row">
              {/* Current Classes Card */}
              <Box className="arcade-middle-card">
                <div className="arcade-middle-card-title">Current Classes</div>
                <Box className="arcade-class-list">
                  {classes.length > 0 ? (
                    classes.map(cls => (
                      <div key={cls.id} className="arcade-class-item">
                        <div className="arcade-class-info">
                          <span className="arcade-class-name">{cls.name}</span>
                          <span className="arcade-class-details">Section: {cls.section || 'A'}</span>
                          <span className="arcade-class-details">Teacher: {cls.teacherName || 'Mr. Smith'}</span>
                          <span className="arcade-class-details">S.Y.: 2024-2025</span>
                        </div>
                        <button className="arcade-view-btn" onClick={() => navigate(`/student/classes/${cls.id}/spelling-levels`)}>View</button>
                      </div>
                    ))
                  ) : (
                    <div className="arcade-class-info">No classes joined.</div>
                  )}
                </Box>
              </Box>

              {/* Word of the Day Card */}
              <StudentWOTDCard />

            </Box>
            {/* Section Title */}
            <div className="arcade-profile-section-title">Game Modes:</div>
            {/* Game Mode Cards Row */}
            <Box className="arcade-profile-modes-row">
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #23232b 100%)'}}></div>
                <div className="arcade-profile-mode-title">Adventure Mode</div>
                <div className="arcade-profile-mode-desc">Game Mode Description here.</div>
              </Box>
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #ff00c833 100%)'}}></div>
                <div className="arcade-profile-mode-title">Time Attack Mode</div>
                <div className="arcade-profile-mode-desc">Game Mode Description here.</div>
              </Box>
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #00eaff33 100%)'}}></div>
                <div className="arcade-profile-mode-title">4pics1word Mode</div>
                <div className="arcade-profile-mode-desc">Game Mode Description here.</div>
              </Box>
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #ff5af733 100%)'}}></div>
                <div className="arcade-profile-mode-title">Meteor Mash</div>
                <div className="arcade-profile-mode-desc">Destroy incoming meteors by typing!</div>
              </Box>
            </Box>
          </Box>

          {/* NEW Right-Side Container - Positioned separately */}
          <div className="arcade-leaderboard-container">
            <div className="arcade-middle-card-title">CLASSMATES LEADERBOARD</div>
            <p style={{ color: '#fff', fontSize: '0.9rem', textAlign: 'center', marginTop: 'rem' }}>
              Leaderboard content will go here
            </p>
          </div>

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
          {/* Custom Word List Modal */}
<Dialog
  open={customWordListModalOpen}
  onClose={() => setCustomWordListModalOpen(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Custom Word Lists</DialogTitle>
  <DialogContent dividers>
    {classes.length > 0 ? (
      classes.map(cls => (
        <Box
          key={cls.id}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid #00eaff',
            borderRadius: 2,
            backgroundColor: '#23232b'
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Press Start 2P',
              color: '#00eaff',
              mb: 1,
              fontSize: '0.85rem'
            }}
          >
            {cls.name}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate(`/student/classes/${cls.id}/spelling-levels`);
              setCustomWordListModalOpen(false);
            }}
            sx={{
              color: '#00eaff',
              borderColor: '#00eaff',
              fontFamily: 'Press Start 2P',
              fontSize: '0.7rem',
              '&:hover': {
                backgroundColor: '#00eaff22',
                borderColor: '#ff00c8',
                color: '#fff'
              }
            }}
          >
            View Word List
          </Button>
        </Box>
      ))
    ) : (
      <Typography sx={{ fontFamily: 'Press Start 2P', fontSize: '0.75rem', color: '#888' }}>
        You haven't joined any classes yet.
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => setCustomWordListModalOpen(false)}
      sx={{
        fontFamily: 'Press Start 2P',
        fontSize: '0.75rem',
        color: '#ff00c8',
        border: '1px solid #ff00c8',
        '&:hover': {
          backgroundColor: '#ff00c822',
          color: '#fff'
        }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>          


        </Box>
      </Box>
      <style>{`
        /* Modal background and border */
        .MuiDialog-paper {
          background: #18181b !important;
          border: 2px solid #00eaff !important;
          box-shadow: 0 0 32px #00eaff80, 0 0 64px #ff00c880 !important;
          border-radius: 16px !important;
          color: #fff !important;
          font-family: 'Press Start 2P', cursive !important;
        }
        .MuiDialogTitle-root {
          color: #00eaff !important;
          font-family: 'Press Start 2P', cursive !important;
          font-size: 1.1rem !important;
          text-shadow: 0 0 8px #00eaff;
          letter-spacing: 1px;
          padding-bottom: 8px !important;
        }
        .MuiDialogContent-root {
          color: #fff !important;
          font-family: 'Press Start 2P', cursive !important;
          font-size: 0.9rem !important;
        }
        .MuiTextField-root {
          width: 100%;
          margin-top: 12px;
        }
        .MuiInputBase-root {
          background: #23232b !important;
          border-radius: 8px !important;
          color: #fff !important;
          font-family: 'Press Start 2P', cursive !important;
          border: 1.5px solid #00eaff !important;
          box-shadow: 0 0 8px #00eaff40;
          transition: border 0.2s;
        }
        .MuiInputBase-root.Mui-focused {
          border: 2px solid #ff00c8 !important;
          box-shadow: 0 0 12px #ff00c8;
        }
        .MuiInputBase-input {
          color: #fff !important;
          font-family: 'Press Start 2P', cursive !important;
          font-size: 0.9rem !important;
          letter-spacing: 1px;
          padding: 12px 10px !important;
        }
        .MuiDialogActions-root {
          justify-content: flex-end;
          padding: 16px 8px 8px 8px !important;
          gap: 12px;
        }
        .MuiDialogActions-root .MuiButton-root {
          font-family: 'Press Start 2P', cursive !important;
          font-size: 0.8rem !important;
          border-radius: 8px !important;
          padding: 8px 20px !important;
          text-transform: none !important;
          box-shadow: 0 0 8px #00eaff80;
          transition: all 0.2s;
        }
        .MuiDialogActions-root .MuiButton-root:nth-of-type(1) {
          color: #ff00c8 !important;
          border: 1.5px solid #ff00c8 !important;
          background: #18181b !important;
        }
        .MuiDialogActions-root .MuiButton-root:nth-of-type(1):hover {
          background: #ff00c822 !important;
          box-shadow: 0 0 16px #ff00c8;
          color: #fff !important;
        }
        .MuiDialogActions-root .MuiButton-root:nth-of-type(2) {
          color: #00eaff !important;
          border: 1.5px solid #00eaff !important;
          background: #18181b !important;
        }
        .MuiDialogActions-root .MuiButton-root:nth-of-type(2):hover {
          background: #00eaff22 !important;
          box-shadow: 0 0 16px #00eaff;
          color: #fff !important;
        }
        .Mui-error {
          color: #ff00c8 !important;
          font-family: 'Press Start 2P', cursive !important;
          font-size: 0.8rem !important;
          text-shadow: 0 0 8px #ff00c8;
        }
        .MuiInputLabel-root {
          color: #00eaff !important;
          font-family: 'Press Start 2P', cursive !important;
          font-size: 1rem !important;
          font-weight: bold !important;
          letter-spacing: 1px;
          text-shadow: 0 0 6px #00eaff;
          z-index: 2;
        }
        .MuiInputLabel-root.Mui-focused {
          color: #ff00c8 !important;
          text-shadow: 0 0 8px #ff00c8;
        }
        .arcade-profile-container {
          margin-bottom: auto;
          position: relative; /* Needed for absolute positioning of the rank icon */
          min-width: 350px;
          min-height: 200px;
          background: #18181b;
          border: 2.5px solid #00eaff;
          border-radius: 24px;
          box-shadow: 0 0 32px #00eaff80, 0 0 64px #ff00c880;
          padding: 36px 32px 32px 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          z-index: 2;
          max-width: 1100px;
          width: 95vw;
          margin: 0 auto;
        }
        .arcade-profile-header {
          width: 100%;
          margin-bottom: 24px;
        }
        .arcade-profile-avatar {
          border: 2px solid #00eaff;
          box-shadow: 0 0 16px #00eaff;
        }
        .arcade-profile-name {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1.3rem;
          margin-bottom: 2px;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-profile-subtitle {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
        .arcade-profile-stats-row {
          display: flex;
          gap: 18px;
          margin-top: 8px;
        }
        .arcade-profile-stat-card {
          background: #23232b;
          border: 2px solid #00eaff;
          border-radius: 12px;
          box-shadow: 0 0 8px #00eaff80;
          min-width: 110px;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 10px 6px 10px;
        }
        .arcade-profile-stat-icon {
          font-size: 1.2rem;
          margin-bottom: 2px;
        }
        .arcade-profile-stat-value {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1.1rem;
          font-weight: bold;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-profile-stat-label {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.7rem;
          margin-top: 2px;
          text-align: center;
        }
        .arcade-profile-section-title {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1.1rem;
          margin-bottom: 18px;
          text-shadow: 0 0 8px #00eaff;
          align-self: flex-start;
        }
        .arcade-profile-modes-row {
          display: flex;
          gap: 20px;
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
        .arcade-profile-mode-card {
          background: #23232b;
          border: 2px solid #00eaff;
          border-radius: 16px;
          box-shadow: 0 0 16px #00eaff80;
          width: 230px;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 16px;
          padding: 0 0 14px 0;
          transition: box-shadow 0.2s, border 0.2s;
          overflow: hidden;
        }
        .arcade-profile-mode-img {
          width: 100%;
          height: 90px;
          border-bottom: 2px solid #00eaff;
          border-radius: 16px 16px 0 0;
          background-size: cover;
          background-position: center;
        }
        .arcade-profile-mode-title {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          margin: 12px 0 6px 16px;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-profile-mode-desc {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.85rem;
          text-align: left;
          margin-left: 16px;
          margin-right: 10px;
        }
        .arcade-current-class {
          background: #23232b;
          border: 2px solid #00eaff;
          border-radius: 14px;
          box-shadow: 0 0 12px #00eaff80;
          padding: 16px 24px 10px 24px;
          margin-bottom: 22px;
          margin-top: 2px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 420px;
        }
        .arcade-current-class-title {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          margin-bottom: 6px;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-current-class-info {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.85rem;
          margin-bottom: 2px;
        }
        .arcade-current-class-value {
          color: #ff00c8;
          font-weight: bold;
          text-shadow: 0 0 8px #ff00c8;
        }
        .arcade-current-class-section-title {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1.1rem;
          margin-bottom: 6px;
          margin-top: 2px;
          text-shadow: 0 0 8px #00eaff;
          align-self: flex-start;
        }
        .arcade-view-class-btn {
          margin-top: 10px;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.9rem;
          color: #00eaff;
          background: #18181b;
          border: 2px solid #00eaff;
          border-radius: 8px;
          padding: 8px 24px;
          box-shadow: 0 0 8px #00eaff80;
          cursor: pointer;
          transition: all 0.2s;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-view-class-btn:hover {
          background: #00eaff22;
          color: #fff;
          border-color: #ff00c8;
          box-shadow: 0 0 16px #ff00c8;
          text-shadow: 0 0 8px #ff00c8;
        }
        .arcade-current-class-section {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.95rem;
          margin-bottom: 4px;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-current-class-section-value {
          color: #00eaff;
          font-weight: bold;
          text-shadow: 0 0 8px #00eaff;
        }
        /* NEW middle row styles */
        .arcade-middle-row {
          display: flex;
          width: 100%;
          gap: 28px;
          margin-bottom: 24px;
          align-items: stretch;
        }
        .arcade-middle-card {
          background: #23232b;
          border: 2px solid #00eaff;
          border-radius: 14px;
          box-shadow: 0 0 12px #00eaff80;
          padding: 16px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .arcade-middle-card-title {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          margin-bottom: 12px;
          text-shadow: 0 0 8px #00eaff;
        }
        .arcade-class-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .arcade-class-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .arcade-class-info {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-start;
        }
        .arcade-class-name {
          color: #ff00c8;
          font-weight: bold;
        }
        .arcade-class-section {
          font-size: 0.7rem;
          color: #ccc;
        }
        .arcade-view-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 0.8rem;
          color: #00eaff;
          background: transparent;
          border: 1px solid #00eaff;
          border-radius: 6px;
          padding: 4px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .arcade-view-btn:hover {
          background: #00eaff22;
          color: #fff;
          box-shadow: 0 0 8px #00eaff;
        }
        .arcade-wotd-word {
          color: #ff00c8;
          font-family: 'Press Start 2P', cursive;
          font-size: 1.2rem;
          text-shadow: 0 0 8px #ff00c8;
          margin-bottom: 8px;
        }
        .arcade-wotd-definition {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.8rem;
          line-height: 1.4;
        }
        /* NEW styles for more details */
        .arcade-class-details {
          font-size: 0.7rem;
          color: #ccc;
        }
        /* NEW styles for the rank icon */
        .arcade-profile-rank-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #18181b;
          border: 2px solid #ff00c8;
          border-radius: 10px;
          box-shadow: 0 0 12px #ff00c880;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.9rem;
          color: #ff00c8;
          text-shadow: 0 0 8px #ff00c8;
        }
        /* Right-side leaderboard container */
        .arcade-leaderboard-container {
          position: absolute;
          top: 1;
          left: calc(103.5vw - 380px);
          width: 250px;
          height: 610px;
          background: #18181b;
          border: 2.5px solid #00eaff;
          border-radius: 24px;
          box-shadow: 0 0 32px #00eaff80, 0 0 64px #ff00c880;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          z-index: 2;
        }
      `}</style>
    </>
  );
};

export default StudentHome;
