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
  const [leaderboard, setLeaderboard] = useState([]);
const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
  api.get("/api/leaderboard/wotd")
    .then(res => {
      setLeaderboard(res.data);        // <-- data should be an array of entries
      setLeaderboardLoading(false);    // <-- don't forget this!
    })
    .catch(err => {
      console.error("Failed to load leaderboard:", err);
      setLeaderboardLoading(false);    // <-- hide loading even on error
    });
}, []);



  useEffect(() => {
    api.get("/api/user-progress/student-info")
      .then(res => setStudentInfo(res.data))
      .catch(err => {
        console.error("Failed to load student info", err);
        // Use fallback data if API fails
        setStudentInfo({
          firstName: localStorage.getItem('firstName') || "Student",
          lastName: localStorage.getItem('lastName') || "",
          profileImageUrl: localStorage.getItem('profileImageUrl') || ""
        });
      });
  }, []);


  useEffect(() => {
    setMascot(fantasyMascots[Math.floor(Math.random() * fantasyMascots.length)]);
    fetchClasses();
    // eslint-disable-next-line
  }, []);

  const fetchClasses = async () => {
    try {
      const classRes = await api.get("/api/student/classes");
      setClasses(classRes.data);
    } catch (err) {
      console.error("Failed to load classes", err);
      setClasses([]);
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
      await api.post("/api/student/classes/join", { joinCode });
      setJoinModalOpen(false);
      setJoinCode("");
      await fetchClasses();
    } catch (err) {
      console.error("Failed to join class:", err);
      setJoinError("Failed to join class: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };

  return (
    <>
      <GlobalSidebarStyles />
      <Box className="fantasy-root arcade-neon" sx={{ minHeight: '0', height: 'auto', position: 'relative', paddingTop: '56px', background: 'none', width: '100vw', fontFamily: 'Roboto, "Press Start 2P", Arial, sans-serif', overflow: 'visible' }}>
        {/* Sidebar and Toggle Button Wrapper */}
        <Box sx={{ height: 'auto', margin: 0, padding: 0 }}>
          <Box className={`arcade-sidebar ${isSidebarOpen ? '' : 'hidden'}`} sx={{ margin: 0, padding: 0, left: 0, width: { xs: '56px', md: '140px' }, background: '#18181b', borderRight: '2px solid #00eaff', minHeight: '0', boxShadow: '0 0 8px #00eaff40', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            {/* Sidebar Content */}
            <Box className="arcade-sidebar-btn-group" sx={{ width: '100%', mt: 2 }}>
              <Button className="arcade-sidebar-btn" sx={{ width: '90%', mb: 1, fontSize: '0.92rem', fontWeight: 500, color: '#00eaff', borderRadius: '10px', background: 'rgba(24,24,27,0.95)', boxShadow: '0 0 8px #00eaff40', '&:hover': { background: '#232336' } }} onClick={() => navigate('/student/classes')}>
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

        {/* Main Content + Leaderboard Grid Layout */}
        <Box
          className="fantasy-main-grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: 1,
            marginLeft: isSidebarOpen ? '140px' : '0px',
            padding: { xs: '8px 2px', md: '16px 16px 16px 16px' },
            minHeight: '0',
            height: 'auto',
            position: 'relative',
            alignItems: 'flex-start',
            transition: 'margin 0.4s cubic-bezier(0.77,0,0.18,1)',
            background: 'none',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'visible',
          }}
        >
          {/* Arcade Neon Animated Grid Background */}
          <div className="fantasy-bg" />
          <div className="fantasy-sparkle" />

          {/* --- MAIN CONTENT (spans columns 1-4, all rows) --- */}
          <Box className="arcade-profile-container" sx={{
            gridColumn: '1 / span 4',
            gridRow: '1 / span 5',
            width: '100%',
            maxWidth: '720px',
            margin: { xs: '0 auto', md: '0' },
            padding: { xs: '10px 6px 10px 6px', md: '18px 14px 14px 14px' },
            borderRadius: '12px',
            boxShadow: '0 0 10px #00eaff40, 0 0 20px #ff00c840',
            border: '2px solid #00eaff'
          }}>
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
  {`${studentInfo.firstName?.charAt(0).toUpperCase() + studentInfo.firstName?.slice(1) || ''} ${studentInfo.lastName?.charAt(0).toUpperCase() + studentInfo.lastName?.slice(1) || ''}`}
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
    <div className="arcade-profile-stat-value">{studentInfo.correctAnswers ?? 0}</div>
    <div className="arcade-profile-stat-label">Correct Answers</div>
                  </Box>
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">⏱️</div>
    <div className="arcade-profile-stat-value">{studentInfo.progressPoints ?? 0}</div>
    <div className="arcade-profile-stat-label">Progress Points</div>
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
                          <span className="arcade-class-details">Teacher: {cls.teacherName || 'Mr. Smith'}</span>
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
                <div className="arcade-profile-mode-desc">Dive into an epic jungle quest where every vocabulary challenge unlocks XP, levels, and thrilling new adventures!</div>
              </Box>
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #ff00c833 100%)'}}></div>
                <div className="arcade-profile-mode-title">Custom Word List (Time Attack)</div>
                <div className="arcade-profile-mode-desc">Race against the clock in a farm your gold to victory</div>
              </Box>
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #00eaff33 100%)'}}></div>
                <div className="arcade-profile-mode-title">4pics1word Mode</div>
                <div className="arcade-profile-mode-desc">Solve the puzzle by finding the one word that connects all four pictures. Test your brain and climb the leaderboard!</div>
              </Box>
              <Box className="arcade-profile-mode-card">
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #ff5af733 100%)'}}></div>
                <div className="arcade-profile-mode-title">Word of The Day</div>
                <div className="arcade-profile-mode-desc">Play the Word of the Day challenge to guess the hidden word from its definition and image.</div>
              </Box>
            </Box>
          </Box>

          {/* --- RIGHT: Leaderboard --- */}
          {!isSidebarOpen && (
            <Box className="arcade-leaderboard-container" sx={{
              gridColumn: '5',
              gridRow: '1 / span 5',
              width: '100%',
              minWidth: '120px',
              maxWidth: '210px',
              background: '#18181b',
              border: '2px solid #00eaff',
              borderRadius: '16px',
              boxShadow: '0 0 8px #00eaff40, 0 0 14px #ff00c840',
              padding: '10px 8px',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              zIndex: 2,
              marginLeft: 0,
              marginTop: 0,
              position: 'relative',
              opacity: 1,
              transition: 'opacity 0.3s',
            }}>
              <Box sx={{ width: '100%', mb: 10 }}>
  <div className="arcade-middle-card-title" style={{ fontSize: '1.1rem', marginBottom: '8px', textAlign: 'center', letterSpacing: 1 }}>
    WOTD Top Players
  </div>
</Box>

<Box className="leaderboard-list" sx={{
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center',
  overflowY: 'auto',
  minHeight: 60,
  maxHeight: '380px',
  gap: 1
}}>
  {leaderboardLoading ? (
    <span style={{ color: '#00eaff', fontFamily: 'Press Start 2P', fontSize: '0.9rem', marginTop: 24 }}>Loading...</span>
  ) : leaderboard.length === 0 ? (
    <span style={{ color: '#fff', fontFamily: 'Montserrat, Roboto, Arial, sans-serif', fontSize: '1rem', marginTop: 24 }}>No leaderboard data.</span>
  ) : (
    leaderboard.map((student, idx) => (
      <Box key={student.studentId || student.studentName} className={`leaderboard-item ${idx < 3 ? 'medal' : ''}`} sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        background: idx % 2 === 0 ? 'rgba(0,234,255,0.07)' : 'transparent',
        borderRadius: '12px',
        padding: '7px 10px',
        marginBottom: '4px',
        boxShadow: idx === 0 ? '0 0 16px #00eaff80' : 'none',
        border: idx === 0 ? '2px solid #00eaff' : 'none',
        position: 'relative'
      }}>
        <span className="leaderboard-rank" style={{
          fontWeight: 700,
          fontSize: '1.2rem',
          width: 28,
          display: 'inline-block',
          color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#00eaff',
          textShadow: idx < 3 ? '0 0 8px #fff' : '0 0 4px #00eaff'
        }}>
          {idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '3' : idx + 1}
        </span>

        <Avatar src={student.avatar || '/avatars/default.png'} alt={student.studentName} sx={{
          width: 38,
          height: 38,
          mx: 1,
          border: '2px solid #00eaff',
          boxShadow: '0 0 8px #00eaff80',
          background: '#23232b'
        }} />

        <span className="leaderboard-name" style={{
          flex: 1,
          textAlign: 'left',
          fontWeight: 500,
          fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
          fontSize: '1rem',
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginLeft: 8
        }}>
          {student.studentName}
        </span>

        <span style={{
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '0.65rem',
          textAlign: 'right',
          color: '#00eaff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '2px',
          marginLeft: 8
        }}>

        </span>

        <EmojiEventsIcon sx={{
          color: idx < 3 ? (idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32') : '#00eaff',
          ml: 1,
          fontSize: '1.3rem',
          display: idx < 3 ? 'inline' : 'none'
        }} />
      </Box>
    ))  
  )}
</Box>
            </Box>
          )}

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
          min-width: 240px;
          min-height: 120px;
          background: #18181b;
          border: 2.5px solid #00eaff;
          border-radius: 18px;
          box-shadow: 0 0 18px #00eaff80, 0 0 32px #ff00c880;
          padding: 18px 12px 18px 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          z-index: 2;
          max-width: 900px;
          width: 97vw;
          margin: 0 auto;
          max-height: 90vh; /* Limit container height */
          overflow-y: auto;
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
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: thin;
          scrollbar-color: #00eaff #23232b;
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
          .arcade-profile-modes-row::-webkit-scrollbar {
  height: 6px;
  background: #23232b;
}
  /* Responsive adjustments */
@media (max-width: 768px) {
  .arcade-middle-card {
    min-width: 100%; /* Full width on mobile */
  }
  
  .arcade-profile-stat-card {
    min-width: 80px; /* More compact stats */
    min-height: 60px;
  }
  
  .arcade-profile-name {
    font-size: 1.1rem; /* Smaller name */
  }
}

.arcade-profile-modes-row::-webkit-scrollbar-thumb {
  background: #00eaff;
  border-radius: 3px;
}
        .arcade-profile-mode-card {
          background: #23232b;
          border: 2px solid #00eaff;
          border-radius: 16px;
          box-shadow: 0 0 16px #00eaff80;
          width: 200px;
          min-height: 180px;
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
          height: 70px;
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
          padding: 12px 16px 8px 16px;
          margin-bottom: 16px;
          margin-top: 2px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 100%;
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
          gap: 18px;
          margin-bottom: 18px;
          align-items: stretch;
          flex-wrap: wrap;
        }
        .arcade-middle-card {
          background: #23232b;
          border: 2px solid #00eaff;
          border-radius: 12px;
          box-shadow: 0 0 8px #00eaff80;
          padding: 12px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 280px; /* Minimum width before wrapping */
          max-height: 300px; /* Limit height */
          overflow-y: auto;
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
          gap: 6px;
        }
        .arcade-class-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 4px; /* Added padding */
          border-bottom: 1px solid #00eaff20; /* Subtle separator */
          
        }
        .arcade-class-info {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 1px;
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
          font-size: 0.7rem;
          color: #00eaff;
          background: transparent;
          border: 1px solid #00eaff;
          border-radius: 6px;
          padding: 3px 8px;
          cursor: pointer;
          transition: all 0.2s;
          border-width: 1px;
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
  background: linear-gradient(135deg, #18181b 70%, #1a1a22 100%);
  border: 2.5px solid #00eaff;
  border-radius: 24px;
  box-shadow: 0 0 32px #00eaff80, 0 0 64px #ff00c880, 0 0 0 8px #00eaff15 inset;
  padding: 28px 18px 28px 18px;
  display: flex;
  flex-direction: column;
  z-index: 2;
  opacity: 1;
  transition: opacity 0.3s;
  max-width: 250px;
  min-width: 170px;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}
.leaderboard-list {
  width: 100%;
  max-width: 210px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #00eaff #23232b;
}
.leaderboard-list::-webkit-scrollbar {
  width: 7px;
  background: #23232b;
  border-radius: 8px;
}
.leaderboard-list::-webkit-scrollbar-thumb {
  background: #00eaff;
  border-radius: 8px;
}
.leaderboard-item {
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
}
.leaderboard-item:hover {
  background: #00eaff22 !important;
  box-shadow: 0 0 12px #00eaff;
}
.leaderboard-rank {
  font-family: 'Press Start 2P', cursive;
}
.leaderboard-name {
  font-family: 'Montserrat', 'Roboto', Arial, sans-serif;
}
.leaderboard-score {
  font-family: 'Press Start 2P', monospace;
}
@media (max-width: 1200px) {
  .arcade-leaderboard-container {
    display: none !important;
  }
}
        @media (max-width: 1200px) {
          .arcade-leaderboard-container {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default StudentHome;
