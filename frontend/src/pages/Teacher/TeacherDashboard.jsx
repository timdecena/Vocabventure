import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Button,
  TextField,
  Snackbar,
  Alert,
  Collapse 
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
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const [viewedStudents, setViewedStudents] = useState({});
  const [expandedStudentsClassId, setExpandedStudentsClassId] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) return navigate('/login');

    const user = JSON.parse(storedUser);
    if (user.role.toLowerCase() !== 'teacher') return navigate('/login');

    setTeacherName(user.name || 'Teacher');
    fetchClasses(token);
  }, [navigate]);


  const handleViewStudents = async (classId) => {
  const token = localStorage.getItem('token');

  if (expandedStudentsClassId === classId) {
    setExpandedStudentsClassId(null); // toggle off
    return;
  }

  try {
    const res = await axios.get(`http://localhost:8081/api/teacher/classes/${classId}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setViewedStudents((prev) => ({ ...prev, [classId]: res.data }));
    setExpandedStudentsClassId(classId);
  } catch (err) {
    console.error('Failed to fetch students:', err);
    setSnackbar({ open: true, message: 'Failed to load students.', severity: 'error' });
  }
};

  const fetchClasses = async (token) => {
    try {
      const response = await axios.get('http://localhost:8081/api/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassCreated = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  const startEditing = (cls) => {
    setEditingId(cls.id);
    setEditName(cls.className);
    setEditDescription(cls.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const saveUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:8081/api/teacher/classes/${id}`,
        { className: editName, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses((prev) => prev.map((cls) => (cls.id === id ? res.data : cls)));
      setSnackbar({ open: true, message: 'Class updated.', severity: 'success' });
      cancelEditing();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update.', severity: 'error' });
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/teacher/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses((prev) => prev.filter((cls) => cls.id !== id));
      setSnackbar({ open: true, message: 'Class deleted.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete.', severity: 'error' });
    }
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
                    {editingId === cls.id ? (
                      <>
                        <TextField
                          fullWidth
                          label="Class Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Button size="small" onClick={() => saveUpdate(cls.id)} sx={{ mr: 1 }}>
                          Save
                        </Button>
                        <Button size="small" color="secondary" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" gutterBottom>{cls.className}</Typography>
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
                              mb: 1,
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
                          <Button size="small" onClick={() => startEditing(cls)} sx={{ mr: 1 }}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => deleteClass(cls.id)} sx={{ mr: 1 }}>
                            Delete
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => handleViewStudents(cls.id)}>
                            {expandedStudentsClassId === cls.id ? 'Hide' : 'View'} Students
                          </Button>
                        </Box>

                        <Collapse in={expandedStudentsClassId === cls.id}>
                          <Box sx={{ mt: 2 }}>
                            {(viewedStudents[cls.id] || []).length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No students enrolled in this class.
                              </Typography>
                            ) : (
                              (viewedStudents[cls.id] || []).map((student) => (
                                <Typography
                                  key={student.id}
                                  variant="body2"
                                  sx={{ pl: 1, color: '#00ffaa' }}
                                >
                                  • {student.username}
                                </Typography>
                              ))
                            )}
                          </Box>
                        </Collapse>
                      </>
                    )}
                  </CardContent>
                </Card>
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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardBackground>
  );
};

export default TeacherDashboard;
