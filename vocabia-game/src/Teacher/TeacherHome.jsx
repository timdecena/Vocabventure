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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SchoolIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  EditNote as EditNoteIcon,
  Logout as LogoutIcon,
  Class as ClassIcon,
  BarChart as AnalyticsIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import api from '../api/api';

const TeacherHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher info
        const teacherRes = await api.get('/api/teacher/info');
        setTeacherInfo(teacherRes.data);
        
        // Fetch recent activity
        const activityRes = await api.get('/api/teacher/recent-activity');
        setRecentActivity(activityRes.data);
        
        // Fetch classes
        const classesRes = await api.get('/api/teacher/classes');
        setClasses(classesRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        // Fallback to mock data if API fails
        setTeacherInfo({
          firstName: "Demo",
          lastName: "Teacher",
          email: "teacher@example.com",
          profileImageUrl: "/avatars/teacher.png"
        });
        setClasses([]);
        setRecentActivity([]);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

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
      setErrorMsg("Class name is required");
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      await api.post("/api/teacher/classes", {
        name: className,
        description: classDescription,
      });
      
      setSuccessMsg("Class created successfully");
      setLoading(false);
      
      // Refresh classes list
      const classesRes = await api.get('/api/teacher/classes');
      setClasses(classesRes.data);
      
      setTimeout(() => {
        handleCloseCreateClass();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create class");
      setLoading(false);
    }
  };

  const navItems = [
    { icon: <SchoolIcon />, text: 'My Classes', path: '/teacher/classes' },
    { icon: <AddCircleOutlineIcon />, text: 'Create Class', action: handleOpenCreateClass },
    { icon: <EditNoteIcon />, text: 'Create Level', path: '/teacher/spelling/create' },
    { icon: <AnalyticsIcon />, text: 'Analytics', path: '/teacher/analytics' },
    { icon: <GroupsIcon />, text: 'Students', path: '/teacher/students' },
    { icon: <AssignmentIcon />, text: 'Assignments', path: '/teacher/assignments' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: sidebarOpen ? 240 : 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 1200,
          boxShadow: 3
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ClassIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Teacher Portal</Typography>
          </Box>
          <IconButton 
            onClick={() => setSidebarOpen(false)} 
            sx={{ color: 'inherit' }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <List sx={{ p: 1 }}>
          {navItems.map((item, index) => (
            <ListItem 
              button 
              key={index}
              onClick={() => item.path ? navigate(item.path) : item.action()}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  bgcolor: 'primary.light'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%', 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'primary.light'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '240px' : 0,
          transition: 'margin-left 0.3s ease',
          p: 3,
          backgroundColor: 'background.default'
        }}
      >
        {/* Sidebar Toggle Button (when closed) */}
        {!sidebarOpen && (
          <Tooltip title="Open menu">
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{
                position: 'fixed',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1100,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '0 4px 4px 0',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Tooltip>
        )}

        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Teacher Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {teacherInfo.firstName || 'Teacher'}
            </Typography>
          </Box>
          <Avatar 
            src={teacherInfo.avatar} 
            sx={{ 
              width: 60, 
              height: 60,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            {teacherInfo.firstName?.charAt(0)}{teacherInfo.lastName?.charAt(0)}
          </Avatar>
        </Box>

        {/* Quick Actions */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              icon: <SchoolIcon fontSize="large" />, 
              title: "My Classes", 
              description: "View and manage all your classes",
              action: () => navigate('/teacher/classes'),
              color: 'primary'
            },
            { 
              icon: <AddCircleOutlineIcon fontSize="large" />, 
              title: "Create Class", 
              description: "Set up a new class for your students",
              action: handleOpenCreateClass,
              color: 'success'
            },
            { 
              icon: <EditNoteIcon fontSize="large" />, 
              title: "Create Level", 
              description: "Design a new spelling level",
              action: () => navigate('/teacher/spelling/create'),
              color: 'secondary'
            }
          ].map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 2,
                    mb: 2,
                    borderRadius: '50%',
                    bgcolor: `${action.color}.light`,
                    color: `${action.color}.contrastText`
                  }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color={action.color}
                  >
                    {action.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {activity.studentName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      <strong>{activity.studentName}</strong> {activity.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No recent activity
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Your Classes */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              Your Classes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {classes.length > 0 ? (
              <Grid container spacing={2}>
                {classes.slice(0, 3).map((cls) => (
                  <Grid item xs={12} sm={6} md={4} key={cls.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {cls.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {cls.description || 'No description'}
                        </Typography>
                        <Typography variant="body2">
                          Students: {cls.studentCount || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                You don't have any classes yet
              </Typography>
            )}
            {classes.length > 3 && (
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button 
                  variant="text" 
                  onClick={() => navigate('/teacher/classes')}
                >
                  View All Classes
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

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
              <Typography variant="h6">Create New Class</Typography>
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
              label="Class Name"
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
              label="Description (optional)"
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
              Cancel
            </Button>
            <Button
              onClick={handleCreateClass}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TeacherHome;