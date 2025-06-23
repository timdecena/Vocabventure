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
  Tooltip,
  Badge,
  Paper,
  useTheme
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AnalyticsIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import api from '../api/api';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const TeacherHome = ({ setIsAuthenticated }) => {
  const theme = useTheme();
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
  const [notifications, setNotifications] = useState(3);

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
          firstName: "Emily",
          lastName: "Johnson",
          email: "emily.johnson@school.edu",
          avatar: "/avatars/teacher-demo.png"
        });
        
        
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

  ];

  const quickActions = [
    { 
      icon: <SchoolIcon fontSize="large" />, 
      title: "New Class", 
      description: "Set up a new class",
      action: handleOpenCreateClass,
      color: 'primary'
    }
    
    
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafc' }}>
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: sidebarOpen ? 280 : 0,
          bgcolor: 'background.paper',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 1200,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              EduPortal
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setSidebarOpen(false)} 
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar 
                src={teacherInfo.avatar} 
                sx={{ 
                  width: 48, 
                  height: 48,
                  mr: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}
              >
                {teacherInfo.firstName?.charAt(0)}{teacherInfo.lastName?.charAt(0)}
              </Avatar>
            </StyledBadge>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {teacherInfo.firstName} {teacherInfo.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {teacherInfo.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <List sx={{ p: 2, flexGrow: 1 }}>
          {navItems.map((item, index) => (
            <ListItem 
              button 
              key={index}
              onClick={() => item.path ? navigate(item.path) : item.action()}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.main
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItem>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '280px' : 0,
          transition: 'margin-left 0.3s ease',
          p: 4,
          backgroundColor: '#f9fafc'
        }}
      >
        {/* Sidebar Toggle Button (when closed) */}
        {!sidebarOpen && (
          <Tooltip title="Open menu">
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{
                position: 'fixed',
                left: 16,
                top: 16,
                zIndex: 1100,
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'background.default'
                }
              }}
            >
              <MenuIcon />
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
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Teacher Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar 
              src={teacherInfo.avatar} 
              sx={{ 
                width: 48, 
                height: 48,
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              {teacherInfo.firstName?.charAt(0)}{teacherInfo.lastName?.charAt(0)}
            </Avatar>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'background.paper',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                    borderColor: alpha(theme.palette.primary.main, 0.5)
                  }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 2,
                    mb: 2,
                    borderRadius: '50%',
                    bgcolor: `${action.color}.light`,
                    color: `${action.color}.main`
                  }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color={action.color}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Activity */}
          

          {/* Your Classes */}
          <Grid item xs={12} md={6}>
      
    </Grid>
        </Grid>

        {/* Create Class Modal */}
        <Dialog 
          open={open} 
          onClose={handleCloseCreateClass} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AddIcon color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Create New Class
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {successMsg && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMsg}
              </Alert>
            )}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
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
              sx={{ mb: 2 }}
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
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Max 200 characters
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            <Button 
              onClick={handleCloseCreateClass} 
              color="inherit"
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClass}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ borderRadius: 2 }}
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