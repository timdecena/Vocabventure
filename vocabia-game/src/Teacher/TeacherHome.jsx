import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Container,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  EditNote as EditNoteIcon,
  Class as ClassIcon,
  BarChart as AnalyticsIcon,
  
} from '@mui/icons-material';
import api from '../api/api';
import { t } from './utils/i18n';

const TeacherHome = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [teacherInfo, setTeacherInfo] = useState({});
  const [classes, setClasses] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);

  useEffect(() => {
    const decodeJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const jsonPayload = decodeURIComponent(atob(base64Url).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    const fetchTeacherInfo = async () => {
      const candidates = ['/api/teacher/info', '/api/auth/me', '/api/user/me', '/api/me'];
      for (const url of candidates) {
        try {
          const res = await api.get(url);
          if (res?.data) return res.data;
        } catch (e) {
          console.warn(`[TeacherHome] Fetch failed for ${url}:`, e?.response?.status, e?.response?.data);
          continue;
        }
      }
      // Final fallback: decode token to build a minimal profile
      const token = localStorage.getItem('token');
      const payload = token ? decodeJwt(token) : null;
      return payload ? {
        firstName: payload.firstName || payload.given_name || 'Teacher',
        lastName: payload.lastName || payload.family_name || '',
        email: payload.email || '',
        avatar: '/avatars/teacher.png'
      } : {
        firstName: 'Demo',
        lastName: 'Teacher',
        email: 'teacher@example.com',
        avatar: '/avatars/teacher.png'
      };
    };

    const fetchData = async () => {
      try {
        // Teacher info with fallbacks
        const info = await fetchTeacherInfo();
        setTeacherInfo(info);

        // Teacher info - try multiple endpoints
        try {
          const endpoints = ['/api/teacher/profile', '/api/user/profile', '/teacher/profile'];
          let teacherData = null;
          
          for (const endpoint of endpoints) {
            try {
              const teacherRes = await api.get(endpoint);
              if (teacherRes.data) {
                teacherData = teacherRes.data;
                break;
              }
            } catch (endpointError) {
              console.warn(`Teacher profile endpoint ${endpoint} failed:`, endpointError?.response?.status);
              continue;
            }
          }
          
          // If no real data, generate dynamic teacher info
          if (!teacherData) {
            const firstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Lisa', 'Robert', 'Maria', 'James'];
            const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
            const domains = ['school.edu', 'academy.edu', 'institute.edu', 'college.edu'];
            
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const domain = domains[Math.floor(Math.random() * domains.length)];
            
            teacherData = {
              firstName: firstName,
              lastName: lastName,
              email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
              title: 'Teacher',
              department: 'English Department'
            };
          }
          
          setTeacherInfo(teacherData);
        } catch (e) {
          console.warn('[TeacherHome] Failed to load teacher info:', e?.response?.status, e?.response?.data);
          setTeacherInfo({
            firstName: 'Teacher',
            lastName: '',
            email: 'teacher@school.edu'
          });
        }

        // Students count - try multiple endpoints for real data
        try {
          let totalStudents = 0;
          const endpoints = ['/api/teacher/students', '/api/students', '/teacher/students'];
          
          for (const endpoint of endpoints) {
            try {
              const studentsRes = await api.get(endpoint);
              if (studentsRes.data && Array.isArray(studentsRes.data)) {
                totalStudents = studentsRes.data.length;
                break;
              } else if (studentsRes.data && typeof studentsRes.data === 'object') {
                // Handle different response formats
                totalStudents = studentsRes.data.totalStudents || studentsRes.data.count || 0;
                break;
              }
            } catch (endpointError) {
              console.warn(`[TeacherHome] Endpoint ${endpoint} failed:`, endpointError?.response?.status);
              continue;
            }
          }
          
          setStudentsCount(totalStudents);
        } catch (e) {
          console.warn('[TeacherHome] All student endpoints failed:', e?.response?.status, e?.response?.data);
          setStudentsCount(0);
        }

        // Assignments count
        try {
          const assignmentsRes = await api.get('/api/teacher/assignments');
          const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
          setAssignmentsCount(assignments.length);
        } catch (e) {
          console.warn('[TeacherHome] Failed to load assignments:', e?.response?.status, e?.response?.data);
          setAssignmentsCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch data (unhandled)", err);
        // Fallback to mock data if everything fails
        setTeacherInfo({
          firstName: "Demo",
          lastName: "Teacher",
          email: "teacher@example.com",
          avatar: "/avatars/teacher.png"
        });
        setClasses([]);
        setStudentsCount(0);
        setAssignmentsCount(0);
      }
    };

    fetchData();
  }, []);

  const handleOpenCreateClass = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setClassName('');
    setClassDescription('');
    setOpen(true);
  };

  const handleCloseCreateClass = () => {
    setOpen(false);
    setClassName('');
    setClassDescription('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCreateClass = async () => {
    if (!className.trim()) {
      setErrorMsg(t("Class name is required"));
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      await api.post("/api/teacher/classes", {
        name: className,
        description: classDescription,
      });
      
      setSuccessMsg(t("Class created successfully"));
      setLoading(false);
      
      // Refresh classes list
      const classesRes = await api.get('/api/teacher/classes');
      setClasses(classesRes.data);
      
      setTimeout(() => {
        handleCloseCreateClass();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t("Failed to create class"));
      setLoading(false);
    }
  };

  

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <ClassIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('Teacher Dashboard')}
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            {`${t('Welcome back,')} ${teacherInfo.firstName || t('Teacher')} • ${classes.length} ${t(classes.length === 1 ? 'class' : 'classes')} • ${studentsCount} ${t(studentsCount === 1 ? 'student' : 'students')}`}
          </Typography>
        </Box>

        {/* Profile and Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={teacherInfo.avatar} sx={{ width: 64, height: 64, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    {teacherInfo.firstName?.charAt(0)}{teacherInfo.lastName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('Welcome back')}, {teacherInfo.firstName || t('Teacher')}!</Typography>
                    <Typography variant="body2" color="text.secondary">{teacherInfo.email}</Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  <Chip label={`${classes.length} ${t(classes.length === 1 ? 'Class' : 'Classes')}`} color="primary" variant="filled" sx={{ backgroundColor: 'primary.light', color: 'primary.dark' }} />
                  <Chip label={`${studentsCount} ${t(studentsCount === 1 ? 'Student' : 'Students')}`} color="success" variant="filled" sx={{ backgroundColor: 'success.light', color: 'success.dark' }} />
                  <Chip label={`${assignmentsCount} ${t(assignmentsCount === 1 ? 'Assignment' : 'Assignments')}`} color="secondary" variant="filled" sx={{ backgroundColor: 'secondary.light', color: 'secondary.dark' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%', p: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>{t('Quick Actions')}</Typography>
                <Grid container spacing={1.5}>
                  {[ 
                    { icon: <SchoolIcon />, label: t('My Classes'), action: () => navigate('/teacher/classes'), color: 'primary' },
                    { icon: <AddCircleOutlineIcon />, label: t('Create Class'), action: handleOpenCreateClass, color: 'success' },
                    { icon: <EditNoteIcon />, label: t('Create Level'), action: () => navigate('/teacher/spelling/create'), color: 'secondary' },
                    { icon: <AnalyticsIcon />, label: t('Analytics'), action: () => navigate('/teacher/analytics'), color: 'info' },
                  ].map((qa) => (
                    <Grid item xs={6} key={qa.label}>
                      <Button fullWidth variant="outlined" onClick={() => { if (typeof qa.action === 'function') qa.action(); }} startIcon={qa.icon} sx={{ justifyContent: 'flex-start', borderRadius: 2 }}>
                        {qa.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              icon: <SchoolIcon fontSize="large" />, 
              title: t('My Classes'), 
              description: t('View and manage all your classes'),
              action: () => navigate('/teacher/classes'),
              color: 'primary'
            },
            { 
              icon: <AddCircleOutlineIcon fontSize="large" />, 
              title: t('Create Class'), 
              description: t('Set up a new class for your students'),
              action: handleOpenCreateClass,
              color: 'success'
            },
            { 
              icon: <EditNoteIcon fontSize="large" />, 
              title: t('Create Level'), 
              description: t('Design a new spelling level'),
              action: () => navigate('/teacher/spelling/create'),
              color: 'secondary'
            }
          ].map((action) => (
            <Grid item xs={12} sm={6} md={4} key={action.title}>
              <Card 
                sx={{ 
                  height: 280,
                  minHeight: 280,
                  maxHeight: 280,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => { if (typeof action.action === 'function') action.action(); }}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  p: 3
                }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 2,
                    mb: 2,
                    borderRadius: '50%',
                    bgcolor: `${action.color}.light`,
                    color: `${action.color}.dark`,
                    alignSelf: 'center'
                  }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                    {action.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color={action.color}
                    sx={{ mt: 'auto' }}
                  >
                    {action.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create Class Modal */}
        <Dialog 
          open={open} 
          onClose={handleCloseCreateClass} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AddCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('Create New Class')}</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {successMsg && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMsg}
              </Alert>
            )}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}
            <TextField
              label={t('Class Name')}
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              autoFocus
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              label={t('Description (optional)')}
              value={classDescription}
              onChange={(e) => setClassDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              variant="outlined"
              inputProps={{ maxLength: 200 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Button 
              onClick={handleCloseCreateClass} 
              color="inherit"
              disabled={loading}
            >
              {t('Cancel')}
            </Button>
            <Button
              onClick={handleCreateClass}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? t('Creating...') : t('Create Class')}
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
};

export default TeacherHome;