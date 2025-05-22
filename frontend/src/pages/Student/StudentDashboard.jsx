import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentJoinClass from './StudentJoinClass';
import Navbar from '../../components/Navbar'; // ✅ Add your existing navbar

const DashboardBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  paddingTop: '80px', // space for fixed Navbar
  paddingBottom: '40px',
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  backgroundColor: '#12232e',
  padding: theme.spacing(3),
  color: '#fff',
  marginBottom: theme.spacing(2),
}));

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role.toLowerCase() !== 'student') return navigate('/login');

    fetchJoinedClasses(token);
  }, [navigate]);

  const fetchJoinedClasses = async (token) => {
    try {
      const res = await axios.get('http://localhost:8081/api/student/class/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching joined classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinedClass = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  const handleLeaveClass = async (classId) => {
    if (!window.confirm('Leave this class?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/student/class/${classId}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
      setSnackbar({ open: true, message: 'Left class successfully.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to leave class.', severity: 'error' });
    }
  };

  return (
    <DashboardBackground>
      <Navbar /> {/* ✅ Added Navbar */}

      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Left Panel: Join Class */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Typography variant="h6" gutterBottom>
              Join a Class
            </Typography>
            <StudentJoinClass onJoined={handleJoinedClass} />
          </StyledCard>
        </Grid>

        {/* Right Panel: My Classes */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Typography variant="h6" gutterBottom>
              My Classes
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : classes.length === 0 ? (
              <Typography>No joined classes yet.</Typography>
            ) : (
              classes.map((cls) => (
                <Box key={cls.id} sx={{ mb: 2, borderBottom: '1px solid #00ffaa55', pb: 2 }}>
                  <Typography variant="subtitle1">{cls.className}</Typography>
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    {cls.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00ffaa', display: 'block', mt: 1 }}>
                    Code: {cls.joinCode}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleLeaveClass(cls.id)}
                    sx={{ mt: 1 }}
                  >
                    Leave Class
                  </Button>
                </Box>
              ))
            )}
          </StyledCard>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardBackground>
  );
};

export default StudentDashboard;
