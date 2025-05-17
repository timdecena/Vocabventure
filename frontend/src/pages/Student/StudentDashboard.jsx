// File: src/pages/StudentDashboard.jsx
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
import Navbar from '../../components/Navbar';
import JoinClassDialog from './JoinClassDialog';

const DashboardBackground = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
});

const StarBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  overflow: 'hidden',
});

const ConstellationPoint = styled(Box)({
  position: 'absolute',
  borderRadius: '50%',
  background: '#fff',
  opacity: 0.8,
});

const StyledCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
  backdropFilter: 'blur(10px)',
  color: 'white',
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#00ffaa',
  },
}));

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

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openJoinClassDialog, setOpenJoinClassDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    const positions = Array.from({ length: 4 }, () => `${Math.random() * 100}% ${Math.random() * 100}%`);
    style.textContent = `:root { --star-x: ${positions[0]}; --star-y: ${positions[1]}; --star-x2: ${positions[2]}; --star-y2: ${positions[3]}; }`;
    document.head.appendChild(style);
    return () => style.remove();
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
        setTimeout(() => setLoading(false), 1000);
      } catch (err) {
        console.error('Error loading student data:', err);
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardBackground>
        <StarBackground>
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
          {[...Array(3)].map((_, i) => <Meteor key={i} delay={i * 2} />)}
        </StarBackground>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 3 }}>
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
        {[...Array(3)].map((_, i) => <Meteor key={i} delay={i * 2} />)}
      </StarBackground>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700, textShadow: '0 0 15px rgba(0, 255, 170, 0.5)' }}>
            VOCAB VENTURE
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Welcome back, <span style={{ color: '#00ffaa' }}>{studentData?.username || 'Explorer'}</span>!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 100, height: 100, mb: 2, border: '3px solid #00ffaa', boxShadow: '0 0 15px rgba(0, 255, 170, 0.5)' }}>
                  {studentData?.username?.charAt(0).toUpperCase() || "E"}
                </Avatar>
                <Typography variant="h5" color="white" fontWeight={700}>
                  {studentData?.username || 'Explorer'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {studentData?.email || 'explorer@vocabventure.com'}
                </Typography>
              </Box>

              <Button variant="contained" color="secondary" fullWidth onClick={() => navigate('/profile')} sx={{ mb: 2 }}>
                View Full Profile
              </Button>
              <Button variant="outlined" color="secondary" fullWidth onClick={() => setOpenJoinClassDialog(true)}>
                Join a Class
              </Button>
            </StyledCard>
          </Grid>

          {/* Additional content here */}
        </Grid>
      </Box>

      <JoinClassDialog
        open={openJoinClassDialog}
        onClose={() => setOpenJoinClassDialog(false)}
        onJoined={() => console.log("Class joined")}
      />
    </DashboardBackground>
  );
};

export default StudentDashboard;