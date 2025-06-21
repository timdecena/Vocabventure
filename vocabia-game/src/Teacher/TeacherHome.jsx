import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import api from '../api/api';

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

    .arcade-sidebar-btn-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      align-items: center;
    }

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
      width: 28px !important;
      height: 60px !important;
      min-width: unset !important;
      border-radius: 0 8px 8px 0 !important;
      padding: 0 !important;
      box-shadow: 0 0 12px #00eaff80;
      transition: all 0.4s ease;
    }
    .sidebar-toggle-btn:hover {
      background-color: #00eaff22 !important;
      transform: translate(-50%, -50%) scale(1.05);
    }
    .sidebar-toggle-btn.open {
      left: 200px;
    }
    .sidebar-toggle-btn:not(.open) {
      left: 14px;
    }
    .fantasy-content {
        transition: margin-left 0.4s ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
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
  `}</style>
);

const TeacherHome = ({ setIsAuthenticated, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleOpen = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setClassName('');
    setClassDescription('');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleCreateClass = async () => {
    if (!className.trim()) {
      setErrorMsg("Class name is required!");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post("/teacher/classes", {
        name: className,
        description: classDescription,
      });
      setSuccessMsg("Class created successfully!");
      setLoading(false);
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    } catch (err) {
      setErrorMsg("Failed to create class. Try again.");
      setLoading(false);
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
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/teacher/classes')}>
                <span className="arcade-btn-text">My Classes</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={handleOpen}>
                <span className="arcade-btn-text">Create Class</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/teacher/spelling/create')}>
                <span className="arcade-btn-text">Create Level</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/teacher/word-of-the-day')}>
                <span className="arcade-btn-text">Word of the Day</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
              <Button className="arcade-sidebar-btn" onClick={() => navigate('/leaderboard/wotd')}>
                <span className="arcade-btn-text">Leaderboard</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
            </Box>
            <Box className="arcade-sidebar-bottom">
              <Button className="arcade-sidebar-btn" onClick={handleLogout}>
                <span className="arcade-btn-text">Logout</span>
                <span className="arcade-btn-arrow">&gt;</span>
              </Button>
            </Box>
          </Box>

          {/* Toggle Button */}
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
          
          {/* Main Content Container */}
          <Box className="arcade-profile-container">
            {/* Rank Icon in top right corner */}
            <div className="arcade-profile-rank-icon">
              <span role="img" aria-label="rank">👑</span>
              <span>TEACHER</span>
            </div>

            {/* Top Row: Avatar + Name/Subtitle + Stats */}
            <Box className="arcade-profile-header" sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 3 }}>
              <Avatar className="arcade-profile-avatar" sx={{ width: 90, height: 90, mr: 4 }} src="/fantasy/wizard_avatar.png" />
              <Box sx={{ flexGrow: 1 }}>
                <div className="arcade-profile-name">Welcome, Teacher!</div>
                <div className="arcade-profile-subtitle">Inspire, create, and guide adventurers</div>
                <Box className="arcade-profile-stats-row">
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">🏫</div>
                    <div className="arcade-profile-stat-value">5</div>
                    <div className="arcade-profile-stat-label">Classes</div>
                  </Box>
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">📚</div>
                    <div className="arcade-profile-stat-value">27</div>
                    <div className="arcade-profile-stat-label">Levels</div>
                  </Box>
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">👥</div>
                    <div className="arcade-profile-stat-value">84</div>
                    <div className="arcade-profile-stat-label">Students</div>
                  </Box>
                  <Box className="arcade-profile-stat-card">
                    <div className="arcade-profile-stat-icon">⭐</div>
                    <div className="arcade-profile-stat-value">4.9</div>
                    <div className="arcade-profile-stat-label">Rating</div>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Section Title */}
            <div className="arcade-profile-section-title">Quick Actions:</div>
            
            {/* Game Mode Cards Row - Replaced with Action Cards */}
            <Box className="arcade-profile-modes-row">
              <Box className="arcade-profile-mode-card" onClick={() => navigate('/teacher/classes')}>
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #23232b 100%)'}}>
                  <SchoolIcon sx={{ fontSize: 60, color: '#00eaff', margin: '15px auto' }} />
                </div>
                <div className="arcade-profile-mode-title">Manage Classes</div>
                <div className="arcade-profile-mode-desc">View and manage all your classes and students</div>
              </Box>
              <Box className="arcade-profile-mode-card" onClick={handleOpen}>
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #ff00c833 100%)'}}>
                  <AddCircleOutlineIcon sx={{ fontSize: 60, color: '#ff00c8', margin: '15px auto' }} />
                </div>
                <div className="arcade-profile-mode-title">Create Class</div>
                <div className="arcade-profile-mode-desc">Start a new adventure for your students</div>
              </Box>
              <Box className="arcade-profile-mode-card" onClick={() => navigate('/teacher/spelling/create')}>
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #00eaff33 100%)'}}>
                  <EditNoteIcon sx={{ fontSize: 60, color: '#00eaff', margin: '15px auto' }} />
                </div>
                <div className="arcade-profile-mode-title">Create Level</div>
                <div className="arcade-profile-mode-desc">Design custom spelling adventures</div>
              </Box>
              <Box className="arcade-profile-mode-card" onClick={() => navigate('/leaderboard/wotd')}>
                <div className="arcade-profile-mode-img" style={{background: 'linear-gradient(135deg, #23232b 60%, #ff5af733 100%)'}}>
                  <EmojiEventsIcon sx={{ fontSize: 60, color: '#ff5af7', margin: '15px auto' }} />
                </div>
                <div className="arcade-profile-mode-title">Leaderboards</div>
                <div className="arcade-profile-mode-desc">Track student progress and achievements</div>
              </Box>
            </Box>
          </Box>

          {/* Right-Side Container - Teacher Tips */}
          <div className="arcade-leaderboard-container">
            <div className="arcade-middle-card-title">TEACHER TIPS</div>
            <div className="arcade-teacher-tip">
              <div className="arcade-tip-title">💡 Class Creation</div>
              <div className="arcade-tip-content">Name your classes creatively to engage students from the start!</div>
            </div>
            <div className="arcade-teacher-tip">
              <div className="arcade-tip-title">🎯 Level Design</div>
              <div className="arcade-tip-content">Mix easy and challenging words to keep students motivated.</div>
            </div>
            <div className="arcade-teacher-tip">
              <div className="arcade-tip-title">🏆 Motivation</div>
              <div className="arcade-tip-content">Use the leaderboard to encourage friendly competition.</div>
            </div>
            <div className="arcade-teacher-tip">
              <div className="arcade-tip-title">📈 Progress</div>
              <div className="arcade-tip-content">Check class analytics weekly to identify students who need help.</div>
            </div>
          </div>

          {/* Create Class Modal */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{ fontFamily: 'Press Start 2P', color: '#00eaff', textShadow: '0 0 8px #00eaff' }}>
              Create New Class
            </DialogTitle>
            <DialogContent>
              {successMsg && (
                <Alert severity="success" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.8rem', mb: 2 }}>
                  {successMsg}
                </Alert>
              )}
              {errorMsg && (
                <Alert severity="error" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.8rem', mb: 2 }}>
                  {errorMsg}
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                label="Class Name *"
                type="text"
                fullWidth
                value={className}
                onChange={e => setClassName(e.target.value)}
                error={!!errorMsg && !className.trim()}
                sx={{ mt: 2 }}
                InputLabelProps={{
                  style: { fontFamily: 'Press Start 2P', fontSize: '0.8rem' }
                }}
                InputProps={{
                  style: { fontFamily: 'Press Start 2P', fontSize: '0.9rem' }
                }}
              />
              <TextField
                margin="dense"
                label="Description (optional)"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={classDescription}
                onChange={e => setClassDescription(e.target.value)}
                sx={{ mt: 2 }}
                InputLabelProps={{
                  style: { fontFamily: 'Press Start 2P', fontSize: '0.8rem' }
                }}
                InputProps={{
                  style: { fontFamily: 'Press Start 2P', fontSize: '0.9rem' }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleClose} 
                sx={{
                  fontFamily: 'Press Start 2P',
                  fontSize: '0.8rem',
                  color: '#ff00c8',
                  border: '1px solid #ff00c8',
                  '&:hover': {
                    backgroundColor: '#ff00c822'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClass} 
                disabled={loading}
                sx={{
                  fontFamily: 'Press Start 2P',
                  fontSize: '0.8rem',
                  color: '#00eaff',
                  border: '1px solid #00eaff',
                  '&:hover': {
                    backgroundColor: '#00eaff22'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <style>{`
        /* Inherit all the existing styles from StudentHome */
        .MuiDialog-paper {
          background: #18181b !important;
          border: 2px solid #00eaff !important;
          box-shadow: 0 0 32px #00eaff80, 0 0 64px #ff00c880 !important;
          border-radius: 16px !important;
          color: #fff !important;
          font-family: 'Press Start 2P', cursive !important;
        }
        
        .arcade-profile-container {
          margin-bottom: auto;
          position: relative;
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
          cursor: pointer;
        }
        
        .arcade-profile-mode-card:hover {
          border-color: #ff00c8;
          box-shadow: 0 0 24px #ff00c8;
        }
        
        .arcade-profile-mode-img {
          width: 100%;
          height: 90px;
          border-bottom: 2px solid #00eaff;
          border-radius: 16px 16px 0 0;
          background-size: cover;
          background-position: center;
          display: flex;
          justify-content: center;
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
        
        .arcade-middle-card-title {
          color: #00eaff;
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          margin-bottom: 12px;
          text-shadow: 0 0 8px #00eaff;
          text-align: center;
        }
        
        .arcade-teacher-tip {
          background: #23232b;
          border: 1px solid #00eaff;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 16px;
        }
        
        .arcade-tip-title {
          color: #ff00c8;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.8rem;
          margin-bottom: 6px;
          text-shadow: 0 0 4px #ff00c8;
        }
        
        .arcade-tip-content {
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.7rem;
          line-height: 1.4;
        }
      `}</style>
    </>
  );
};

export default TeacherHome;