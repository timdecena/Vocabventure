// File: src/pages/StudentDashboard.jsx.new
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Avatar,
  LinearProgress,
  Badge,
  IconButton,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import Navbar from '../../components/Navbar';

// Meteor animation component
const Meteor = styled(Box)(({ delay = 0 }) => ({
  position: 'absolute',
  width: '2px',
  height: '2px',
  background: '#fff',
  opacity: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '50px',
    height: '1px',
    background: 'linear-gradient(90deg, #fff, transparent)',
    transform: 'translateX(-100%)',
  },
  animation: 'meteor 3s ease-in infinite',
  animationDelay: delay + 's',
  top: Math.random() * 50 + '%',
  left: Math.random() * 100 + '%',
}));

// Star background with multiple layers
const StarBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  '&::before, &::after, &::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(2px 2px at var(--star-x) var(--star-y), #fff, rgba(0,0,0,0))',
    backgroundSize: '200px 200px',
    animation: 'moveStars 60s linear infinite',
  },
  '&::after': {
    backgroundSize: '300px 300px',
    animation: 'moveStars 90s linear infinite',
    opacity: 0.6,
    filter: 'blur(1px)',
  },
  '& > div': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(1px 1px at var(--star-x2) var(--star-y2), rgba(0,255,170,0.4), rgba(0,0,0,0))',
    backgroundSize: '400px 400px',
    animation: 'moveStars 120s linear infinite',
    opacity: 0.3,
    filter: 'blur(0.5px)',
  },
  '@keyframes moveStars': {
    '0%': {
      transform: 'translateY(0)'
    },
    '100%': {
      transform: 'translateY(-100%)'
    }
  }
}));

// Constellation point
const ConstellationPoint = styled(Box)(({ size = 2, glow = false }) => ({
  position: 'absolute',
  width: size + 'px',
  height: size + 'px',
  background: '#fff',
  borderRadius: '50%',
  boxShadow: glow ? '0 0 10px rgba(0, 255, 170, 0.8)' : 'none',
  animation: 'twinkle 3s ease-in-out infinite',
}));

// Styled components for dashboard
const DashboardBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '80px',
  paddingBottom: '40px',
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(10, 15, 30, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: 14,
  border: '1px solid rgba(0, 255, 170, 0.15)',
  boxShadow: '0 0 20px rgba(51, 255, 119, 0.2), 0 0 25px rgba(0, 128, 255, 0.15)',
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 30px rgba(51, 255, 119, 0.3), 0 0 35px rgba(0, 128, 255, 0.2)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: 'rgba(0, 255, 170, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #00ffaa, #00cc99)',
    borderRadius: 5,
    boxShadow: '0 0 10px rgba(0, 255, 170, 0.5)'
  }
}));

const StatIconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: 'rgba(0, 255, 170, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}40, transparent)`,
    borderRadius: 'inherit',
    animation: 'rotate 4s linear infinite',
    zIndex: -1
  },
  '& svg': {
    fontSize: 28,
    color: theme.palette.secondary.main,
    filter: 'drop-shadow(0 0 8px ' + theme.palette.secondary.main + '40)'
  },
  '@keyframes rotate': {
    '0%': {
      transform: 'rotate(0deg)'
    },
    '100%': {
      transform: 'rotate(360deg)'
    }
  }
}));

const MissionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #00c3ff 0%, #0075ff 100%)',
  color: '#ffffff',
  borderRadius: 30,
  padding: '10px 20px',
  fontWeight: 600,
  letterSpacing: '0.8px',
  boxShadow: '0 0 15px rgba(0, 195, 255, 0.4)',
  '&:hover': {
    boxShadow: '0 0 25px rgba(0, 195, 255, 0.6)',
    transform: 'translateY(-3px)',
  }
}));

const AchievementBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  }
}));

const generateStarPositions = () => {
  const style = document.createElement('style');
  const positions = [];
  for (let i = 0; i < 4; i++) {
    positions.push(Math.random() * 100 + '% ' + Math.random() * 100 + '%');
  }
  style.textContent = 
    ':root {' +
    '  --star-x: ' + positions[0] + ';' +
    '  --star-y: ' + positions[1] + ';' +
    '  --star-x2: ' + positions[2] + ';' +
    '  --star-y2: ' + positions[3] + ';' +
    '}';
  document.head.appendChild(style);
  return () => style.remove();
};

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState({
    level: 5,
    experience: 450,
    nextLevelExp: 500,
    streak: 7,
    wordsLearned: 120,
    quizzesTaken: 8,
    achievements: [
      { id: 1, title: "First Word Mastered", icon: <StarIcon />, unlocked: true },
      { id: 2, title: "7-Day Streak", icon: <WhatshotIcon />, unlocked: true },
      { id: 3, title: "Quiz Master", icon: <SchoolIcon />, unlocked: true },
      { id: 4, title: "Vocabulary Explorer", icon: <ExploreIcon />, unlocked: false }
    ],
    missions: [
      { id: 1, title: "Daily Challenge", description: "Complete today's word list", reward: "50 XP", progress: 75 },
      { id: 2, title: "Grammar Quest", description: "Master 5 new grammar rules", reward: "100 XP", progress: 40 },
      { id: 3, title: "Vocabulary Expansion", description: "Learn 10 new words", reward: "75 XP", progress: 20 }
    ],
    dailyTip: "Consistency beats motivation. Practice a little every day for the best results!",
    recentActivity: [
      { id: 1, action: "Completed Quiz", result: "8/10 correct", timestamp: "2 hours ago" },
      { id: 2, action: "Learned New Word", result: "Serendipity", timestamp: "Yesterday" },
      { id: 3, action: "Completed Daily Challenge", result: "+50 XP", timestamp: "Yesterday" }
    ]
  });

  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = generateStarPositions();
    return cleanup;
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!userData || !token) {
          navigate('/login');
          return;
        }

        setStudentData(userData);
        
        // In a real app, you would fetch game data from the server
        // For now, we're using the mock data initialized in state
        
        setTimeout(() => {
          setLoading(false);
        }, 1000); // Simulate loading for demo purposes
        
      } catch (err) {
        console.error('Error loading student data:', err);
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const calculateProgress = () => {
    return Math.min((gameData.experience / gameData.nextLevelExp) * 100, 100);
  };

  if (loading) {
    return (
      <DashboardBackground>
        <StarBackground>
          <Box />
          {[...Array(20)].map((_, index) => (
            <ConstellationPoint 
              key={index} 
              sx={{ 
                left: Math.random() * 100 + '%', 
                top: Math.random() * 100 + '%',
                width: (Math.random() * 3 + 1) + 'px',
                height: (Math.random() * 3 + 1) + 'px',
                boxShadow: Math.random() > 0.7 ? '0 0 10px rgba(0, 255, 170, 0.8)' : 'none',
              }} 
            />
          ))}
          {[...Array(3)].map((_, i) => (
            <Meteor key={i} delay={i * 2} />
          ))}
        </StarBackground>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 3
        }}>
          <CircularProgress size={60} sx={{ color: 'secondary.main' }} />
          <Typography variant="h5" color="secondary.main" sx={{ textShadow: '0 0 10px rgba(0, 255, 170, 0.5)' }}>
            Preparing your cosmic journey...
          </Typography>
        </Box>
      </DashboardBackground>
    );
  }

  return (
    <DashboardBackground>
      <Navbar />
      
      <StarBackground>
        <Box />
        {[...Array(20)].map((_, index) => (
          <ConstellationPoint 
            key={index} 
            sx={{ 
              left: Math.random() * 100 + '%', 
              top: Math.random() * 100 + '%',
              width: (Math.random() * 3 + 1) + 'px',
              height: (Math.random() * 3 + 1) + 'px',
              boxShadow: Math.random() > 0.7 ? '0 0 10px rgba(0, 255, 170, 0.8)' : 'none',
            }} 
          />
        ))}
        {[...Array(3)].map((_, i) => (
          <Meteor key={i} delay={i * 2} />
        ))}
      </StarBackground>
      
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        px: { xs: 2, md: 3 },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" color="secondary.main" sx={{ 
            mb: 1,
            fontWeight: 700,
            textShadow: '0 0 15px rgba(0, 255, 170, 0.5)'
          }}>
            VOCAB VENTURE
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Welcome back, <span style={{ color: '#00ffaa' }}>{studentData?.username || 'Explorer'}</span>!
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mb: 2,
                    border: '3px solid #00ffaa',
                    boxShadow: '0 0 15px rgba(0, 255, 170, 0.5)'
                  }}
                >
                  {studentData?.username?.charAt(0).toUpperCase() || "E"}
                </Avatar>
                <Typography variant="h5" color="white" fontWeight={700}>
                  {studentData?.username || 'Explorer'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {studentData?.email || 'explorer@vocabventure.com'}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  background: 'rgba(0, 255, 170, 0.1)',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5
                }}>
                  <StarIcon sx={{ color: '#00ffaa' }} />
                  <Typography variant="body1" color="secondary.main" fontWeight={600}>
                    Level {gameData.level} Explorer
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Experience
                  </Typography>
                  <Typography variant="body2" color="secondary.main">
                    {gameData.experience}/{gameData.nextLevelExp} XP
                  </Typography>
                </Box>
                <ProgressBar variant="determinate" value={calculateProgress()} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="secondary.main" fontWeight={700}>
                    {gameData.streak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="secondary.main" fontWeight={700}>
                    {gameData.wordsLearned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Words Learned
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="secondary.main" fontWeight={700}>
                    {gameData.quizzesTaken}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quizzes Taken
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => navigate('/profile')}
                sx={{ mb: 2 }}
              >
                View Full Profile
              </Button>
            </StyledCard>
          </Grid>
          
          {/* Current Missions */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <RocketLaunchIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 28 }} />
                <Typography variant="h5" color="white" fontWeight={700}>
                  Current Missions
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {gameData.missions.map((mission) => (
                  <Grid item xs={12} key={mission.id}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(0, 255, 170, 0.05)',
                      border: '1px solid rgba(0, 255, 170, 0.1)',
                      mb: 1
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" color="white" fontWeight={600}>
                          {mission.title}
                        </Typography>
                        <Chip 
                          label={mission.reward} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(0, 255, 170, 0.2)',
                            color: 'secondary.main',
                            fontWeight: 600
                          }} 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {mission.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress: {mission.progress}%
                        </Typography>
                      </Box>
                      <ProgressBar variant="determinate" value={mission.progress} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <MissionButton 
                  variant="contained"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => navigate('/missions')}
                >
                  View All Missions
                </MissionButton>
              </Box>
            </StyledCard>
          </Grid>
          
          {/* Achievements */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmojiEventsIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 28 }} />
                <Typography variant="h5" color="white" fontWeight={700}>
                  Achievements
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {gameData.achievements.map((achievement) => (
                  <Grid item xs={6} sm={3} key={achievement.id}>
                    <AchievementBadge>
                      <Avatar 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mb: 1,
                          bgcolor: achievement.unlocked ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: achievement.unlocked ? 'secondary.main' : 'text.secondary',
                          border: achievement.unlocked ? '2px solid #00ffaa' : '2px solid transparent',
                          opacity: achievement.unlocked ? 1 : 0.5,
                          boxShadow: achievement.unlocked ? '0 0 10px rgba(0, 255, 170, 0.3)' : 'none'
                        }}
                      >
                        {achievement.icon}
                      </Avatar>
                      <Typography 
                        variant="caption" 
                        align="center"
                        color={achievement.unlocked ? 'white' : 'text.secondary'}
                      >
                        {achievement.title}
                      </Typography>
                    </AchievementBadge>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => navigate('/achievements')}
                >
                  View All Achievements
                </Button>
              </Box>
            </StyledCard>
          </Grid>
          
          {/* Daily Tip */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LightbulbIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 28 }} />
                <Typography variant="h5" color="white" fontWeight={700}>
                  Today's Tip
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100% - 60px)',
                background: 'rgba(0, 255, 170, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(0, 255, 170, 0.1)'
              }}>
                <LightbulbIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="body1" color="white" align="center" sx={{ 
                  fontStyle: 'italic',
                  mb: 2,
                  px: 2,
                  lineHeight: 1.6
                }}>
                  "{gameData.dailyTip}"
                </Typography>
              </Box>
            </StyledCard>
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12}>
            <StyledCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 28 }} />
                <Typography variant="h5" color="white" fontWeight={700}>
                  Recent Activity
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {gameData.recentActivity.map((activity) => (
                  <Grid item xs={12} sm={6} md={4} key={activity.id}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(0, 255, 170, 0.05)',
                      border: '1px solid rgba(0, 255, 170, 0.1)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Typography variant="subtitle1" color="white" fontWeight={600} sx={{ mb: 1 }}>
                        {activity.action}
                      </Typography>
                      <Typography variant="body2" color="secondary.main" sx={{ mb: 2 }}>
                        {activity.result}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                        {activity.timestamp}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<SportsEsportsIcon />}
                  onClick={() => navigate('/games')}
                >
                  Play Learning Games
                </Button>
              </Box>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </DashboardBackground>
  );
};

export default StudentDashboard;