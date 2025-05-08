import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Avatar,
  IconButton,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '../../components/Navbar';
import TeacherCreateClass from './TeacherCreateClass';

// Cosmic theme components
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
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 30px rgba(51, 255, 119, 0.3), 0 0 35px rgba(0, 128, 255, 0.2)',
  },
}));

const TeacherDashboard = () => {
  const [teacherName, setTeacherName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role.toLowerCase() !== 'teacher') {
      navigate('/login');
      return;
    }

    setTeacherName(user.name || 'Teacher');
  }, [navigate]);

  return (
    <DashboardBackground>
      <Navbar />
      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Typography variant="h5" color="secondary.main" fontWeight={700} gutterBottom>
              Welcome, {teacherName}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Manage your classes and track student progress.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/create-class')} startIcon={<AddIcon />} sx={{ mb: 2 }}>
              Create Class
            </Button>
          </StyledCard>
        </Grid>
      </Grid>
    </DashboardBackground>
  );
};

export default TeacherDashboard;