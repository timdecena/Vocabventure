import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  LinearProgress,
  CardContent,
  useTheme
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { styled } from '@mui/material/styles';

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

// Constellation line
const ConstellationLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  height: '1px',
  background: 'linear-gradient(90deg, rgba(0, 255, 170, 0.2), rgba(0, 255, 170, 0))',
  transformOrigin: '0 0',
  opacity: 0.3,
}));

// Enhanced star background with multiple layers
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

// Enhanced Styled components
const StyledCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(10, 15, 30, 0.95)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0, 255, 170, 0.15)',
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[10],
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 40px rgba(0, 255, 170, 0.2)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'linear-gradient(145deg, rgba(0,255,170,0.08) 0%, rgba(0,255,170,0) 50%)',
    pointerEvents: 'none',
  }
}));

// Cosmic glow effect
const CosmicGlow = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '200%',
  height: '200%',
  transform: 'translate(-50%, -50%)',
  background: 'radial-gradient(circle, rgba(0,255,170,0.1) 0%, rgba(0,0,0,0) 70%)',
  animation: 'pulse 4s ease-in-out infinite',
  '@keyframes pulse': {
    '0%': { opacity: 0.3 },
    '50%': { opacity: 0.6 },
    '100%': { opacity: 0.3 }
  }
}));

// Enhanced avatar with cosmic effects
const LargeAvatar = styled(Box)(({ theme }) => ({
  width: 160,
  height: 160,
  borderRadius: '50%',
  background: 'linear-gradient(45deg, ' + theme.palette.secondary.main + ' 0%, ' + theme.palette.secondary.dark + ' 100%)',
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  fontSize: '4.5rem',
  border: '4px solid ' + theme.palette.primary.dark,
  boxShadow: '0 0 32px ' + theme.palette.secondary.dark + '40',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05) rotate(8deg)'
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 8,
  backgroundColor: 'rgba(0, 255, 170, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, ' + theme.palette.secondary.main + ', ' + theme.palette.secondary.light + ')',
    borderRadius: 8,
    boxShadow: '0 0 16px ' + theme.palette.secondary.main + '40'
  }
}));

// Glowing effect for icons
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

const Profile = () => {
  const theme = useTheme();
  // Constellation configuration
  const constellationPoints = [
    { x: 15, y: 15, size: 3, glow: true },
    { x: 25, y: 25, size: 2 },
    { x: 35, y: 15, size: 2 },
    { x: 85, y: 35, size: 3, glow: true },
    { x: 75, y: 45, size: 2 },
    { x: 65, y: 35, size: 2 },
  ];

  const constellationLines = [
    { x1: 15, y1: 15, x2: 25, y2: 25 },
    { x1: 25, y1: 25, x2: 35, y2: 15 },
    { x1: 85, y1: 35, x2: 75, y2: 45 },
    { x1: 75, y1: 45, x2: 65, y2: 35 },
  ];

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    wordsLearned: 0,
    quizzesTaken: 0,
    achievements: [],
    recentActivity: []
  });

  const calculateProgress = () => {
    return Math.min((stats.experience / stats.nextLevelExp) * 100, 100);
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        
        const response = await axios.get('http://localhost:8081/api/users/stats', {
          headers: { Authorization: 'Bearer ' + token },
          withCredentials: true
        });
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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

  useEffect(() => {
    const cleanup = generateStarPositions();
    return cleanup;
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!userData) return null;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.background.default,
      position: 'relative',
      overflow: 'hidden',
      pt: { xs: 8, sm: 9 },
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, rgba(10, 10, 46, 0.8) 0%, rgba(10, 10, 46, 0.95) 100%)',
        zIndex: -2
      },
      '&::after': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, rgba(0, 255, 170, 0.05) 0%, transparent 70%)',
        zIndex: -1
      }
    }}>
      <StarBackground>
        <div /> {/* Additional star layer */}
        {/* Render constellation points */}
        {constellationPoints.map((point, index) => (
          <ConstellationPoint
            key={`point-${index}`}
            sx={{
              left: point.x + '%',
              top: point.y + '%',
            }}
            size={point.size}
            glow={point.glow}
          />
        ))}
        {/* Render constellation lines */}
        {constellationLines.map((line, index) => {
          const dx = line.x2 - line.x1;
          const dy = line.y2 - line.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <ConstellationLine
              key={`line-${index}`}
              sx={{
                left: line.x1 + '%',
                top: line.y1 + '%',
                width: length + '%',
                transform: 'rotate(' + angle + 'deg)',
              }}
            />
          );
        })}
        {/* Add meteors */}
        {[...Array(3)].map((_, index) => (
          <Meteor key={`meteor-${index}`} delay={index * 2} />
        ))}
      </StarBackground>
      <CosmicGlow />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, pb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={5} lg={4}>
            <StyledCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <LargeAvatar>
                  {userData.username.charAt(0).toUpperCase()}
                </LargeAvatar>
                <Typography variant="h4" sx={{ 
                  color: 'secondary.main', 
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textAlign: 'center',
                  mb: 1
                }}>
                  {userData.username}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: 'text.secondary', 
                  textAlign: 'center',
                  mb: 4
                }}>
                  Level {stats.level} Explorer
                </Typography>
                
                <Divider sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  mb: 4 
                }} />
                
                <Box sx={{ px: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="secondary.main">
                      {Math.round(calculateProgress())}%
                    </Typography>
                  </Box>
                  <ProgressBar
                    variant="determinate"
                    value={calculateProgress()}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 2
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {stats.experience} XP
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.nextLevelExp} XP
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>

            {/* Stats Grid */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StyledCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StatIconWrapper>
                        <SchoolIcon />
                      </StatIconWrapper>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Words
                        </Typography>
                        <Typography variant="h5" color="text.primary">
                          {stats.wordsLearned}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={6}>
                <StyledCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StatIconWrapper>
                        <WhatshotIcon />
                      </StatIconWrapper>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Quests
                        </Typography>
                        <Typography variant="h5" color="text.primary">
                          {stats.quizzesTaken}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={6}>
                <StyledCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StatIconWrapper>
                        <EmojiEventsIcon />
                      </StatIconWrapper>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Achievements
                        </Typography>
                        <Typography variant="h5" color="text.primary">
                          {stats.achievements.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={6}>
                <StyledCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StatIconWrapper>
                        <TimelineIcon />
                      </StatIconWrapper>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Streak
                        </Typography>
                        <Typography variant="h5" color="text.primary">
                          7d
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Recent Activity */}
          <Grid item xs={12} md={7} lg={8}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <RocketLaunchIcon sx={{ color: 'secondary.main' }} />
                    Learning Activity
                  </Typography>
                  <Divider sx={{ 
                    mt: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)' 
                  }} />
                </Box>

                {stats.recentActivity.length > 0 ? (
                  <Grid container spacing={2}>
                    {stats.recentActivity.map((activity, index) => (
                      <Grid item xs={12} sm={6} lg={4} key={index}>
                        <StyledCard sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="secondary.main">
                              {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                            <Box sx={{ 
                              mt: 2,
                              height: 4,
                              background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                              borderRadius: 2
                            }} />
                          </CardContent>
                        </StyledCard>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 8,
                    borderRadius: 4,
                    border: `2px dashed ${theme.palette.divider}`,
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <RocketLaunchIcon sx={{ 
                      fontSize: 64, 
                      color: 'secondary.main', 
                      mb: 3,
                      opacity: 0.8
                    }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Begin Your Journey!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete your first lesson to unlock achievements
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;