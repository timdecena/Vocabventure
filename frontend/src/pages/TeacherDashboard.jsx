// File: src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled background like in Login.jsx
const DashboardBackground = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.dark} 0%, ${theme.palette.background.darkSecondary} 100%)`,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  position: 'relative',
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  width: '90%',
  maxWidth: '600px',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 0 15px rgba(51, 255, 119, 0.2), 0 0 20px rgba(0, 128, 255, 0.1)',
  backgroundColor: 'rgba(10, 15, 30, 0.85)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
}));

const TeacherDashboard = () => {
  const [teacherName, setTeacherName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // Check if user is logged in and their role
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    // Check if the user has a teacher role
    if (user.role.toLowerCase() !== 'teacher') {
      navigate('/login');
      return;
    }

    // If user is a teacher, set their name (optional)
    setTeacherName(user.name || 'Teacher');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <DashboardBackground>
      <DashboardCard>
        <CardContent>
          <Typography variant="h3" color="secondary" gutterBottom>
            Welcome, {teacherName}!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You have successfully entered the Teacher Dashboard.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/manage-feedback')}>
              Manage Feedback
            </Button>
            <Button variant="contained" color="success" onClick={() => navigate('/create-class')}>
                Create Class
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </CardContent>
      </DashboardCard>
    </DashboardBackground>
  );
};

export default TeacherDashboard;
