// File: src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled background
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

// Card style
const DashboardCard = styled(Card)(({ theme }) => ({
  width: '95%',
  maxWidth: '800px',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 0 15px rgba(51, 255, 119, 0.2), 0 0 20px rgba(0, 128, 255, 0.1)',
  backgroundColor: 'rgba(10, 15, 30, 0.85)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  overflowY: 'auto',
  maxHeight: '90vh'
}));

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [additionalStudentInfo, setAdditionalStudentInfo] = useState({
    courses: [],
    assignments: [],
    gpa: null,
    attendance: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!userData || !token || userData.role.toLowerCase() !== 'student') {
          navigate('/login');
          return;
        }

        setStudentData(userData);

        // Mock data
        const mockInfo = {
          courses: [
            { name: "Vocabulary Fundamentals", code: "VOCAB101" },
            { name: "Advanced Grammar", code: "GRAMMAR201" }
          ],
          assignments: [
            {
              course: "Vocabulary Fundamentals",
              title: "Week 1 Word List",
              dueDate: "2023-05-15",
              completed: false
            },
            {
              course: "Advanced Grammar",
              title: "Tenses Exercise",
              dueDate: "2023-05-10",
              completed: true
            }
          ],
          gpa: "3.5",
          attendance: "92%"
        };

        setAdditionalStudentInfo(mockInfo);
      } catch (err) {
        console.error('Error loading student data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <DashboardBackground>
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </DashboardBackground>
    );
  }

  return (
    <DashboardBackground>
      <DashboardCard>
        <CardContent>
          <Typography variant="h4" color="secondary" gutterBottom>
            Welcome back, {studentData?.username || 'Student'}!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Here's a snapshot of your progress and upcoming tasks.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Profile Summary</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2">Username: {studentData.username}</Typography>
            <Typography variant="body2">Email: {studentData.email}</Typography>
            <Typography variant="body2">Role: Student</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Enrolled Courses</Typography>
            <Divider sx={{ mb: 1 }} />
            {additionalStudentInfo.courses.length > 0 ? (
              <List dense>
                {additionalStudentInfo.courses.map((course, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`${course.name} (${course.code})`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No courses enrolled.</Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Upcoming Assignments</Typography>
            <Divider sx={{ mb: 1 }} />
            {additionalStudentInfo.assignments.filter(a => !a.completed).length > 0 ? (
              <List dense>
                {additionalStudentInfo.assignments
                  .filter(a => !a.completed)
                  .map((a, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={`${a.course}: ${a.title}`}
                        secondary={`Due: ${a.dueDate}`}
                      />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No upcoming assignments.</Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Completed Assignments</Typography>
            <Divider sx={{ mb: 1 }} />
            {additionalStudentInfo.assignments.filter(a => a.completed).length > 0 ? (
              <List dense>
                {additionalStudentInfo.assignments
                  .filter(a => a.completed)
                  .map((a, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={`${a.course}: ${a.title}`} />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No completed assignments.</Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Performance Summary</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2">GPA: {additionalStudentInfo.gpa || 'N/A'}</Typography>
            <Typography variant="body2">Attendance: {additionalStudentInfo.attendance || 'N/A'}</Typography>
            <Typography variant="body2">
              Completed Assignments: {additionalStudentInfo.assignments.filter(a => a.completed).length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/courses')}>
              View All Courses
            </Button>
            <Button variant="contained" color="success" onClick={() => navigate('/assignments')}>
              View Assignments
            </Button>
            <Button variant="contained" color="info" onClick={() => navigate('/profile')}>
              Update Profile
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

export default StudentDashboard;
