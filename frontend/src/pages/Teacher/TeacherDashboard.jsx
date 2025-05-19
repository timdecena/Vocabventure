import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CardContent,
  Card,
  CircularProgress,
  Button,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TeacherCreateClass from './TeacherCreateClass';
import axios from 'axios';

const DashboardBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
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
}));

const TeacherDashboard = () => {
  const [teacherName, setTeacherName] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinRequestsMap, setJoinRequestsMap] = useState({});
  const [expandedClassId, setExpandedClassId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) return navigate('/login');

    const user = JSON.parse(storedUser);
    if (user.role.toLowerCase() !== 'teacher') return navigate('/login');

    setTeacherName(user.name || 'Teacher');
    fetchClasses(token);
  }, [navigate]);

  const fetchClasses = async (token) => {
    try {
      const response = await axios.get('http://localhost:8081/api/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJoinRequests = async (classId) => {
    const token = localStorage.getItem('token');

    if (expandedClassId === classId) {
      setExpandedClassId(null); // collapse if already open
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8081/api/teacher/classes/${classId}/join-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJoinRequestsMap((prev) => ({ ...prev, [classId]: response.data }));
      setExpandedClassId(classId);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
    }
  };

  const handleClassCreated = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  return (
    <DashboardBackground>
      <Navbar />

      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Left Panel: Create Class */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Typography variant="h5" color="secondary.main" fontWeight={700} gutterBottom>
              Welcome, {teacherName}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Create and manage your classes here.
            </Typography>
            <TeacherCreateClass onClassCreated={handleClassCreated} />
          </StyledCard>
        </Grid>

        {/* Right Panel: Class List */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <Typography variant="h6" color="secondary.main" gutterBottom>
              Your Classes
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : classes.length === 0 ? (
              <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                You haven't created any classes yet.
              </Typography>
            ) : (
              classes.map((cls) => (
                <Card
                  key={cls.id}
                  sx={{
                    width: '100%',
                    mb: 2,
                    backgroundColor: '#121212',
                    color: '#fff',
                    border: '1px solid #00ffaa44',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {cls.className}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {cls.description}
                    </Typography>

                    {cls.joinCode && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor: '#003c3c',
                          borderRadius: 1,
                          display: 'inline-block',
                          mb: 1
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: '#00ffaa', fontWeight: 600 }}
                        >
                          Class Code: {cls.joinCode}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewJoinRequests(cls.id)}
                      >
                        {expandedClassId === cls.id ? 'Hide' : 'View'} Join Requests
                      </Button>
                    </Box>

                    <Collapse in={expandedClassId === cls.id}>
  <Box sx={{ mt: 2 }}>
    {(joinRequestsMap[cls.id] || []).length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No join requests for this class.
      </Typography>
    ) : (
      (joinRequestsMap[cls.id] || []).map((req) => (
        <Box
          key={req.requestId}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 1,
            px: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: '#fff' }}>
            {req.studentUsername} ({req.studentEmail}) —{' '}
            <span style={{ color: req.approved ? '#00ffaa' : '#ffaa00' }}>
              {req.approved ? 'Approved' : 'Pending'}
            </span>
          </Typography>
        </Box>
      ))
    )}
  </Box>
</Collapse>
                  </CardContent>
                </Card>
              ))
            )}
          </StyledCard>
        </Grid>
      </Grid>
    </DashboardBackground>
  );
};

export default TeacherDashboard;
