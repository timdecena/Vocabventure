import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, Paper, Grid, Card, 
  CardContent, CardActions, Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GamesIcon from '@mui/icons-material/Games';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const TeacherHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Teacher';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold', mb: 3 }}>
          <ManageAccountsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Welcome, {username}!
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: '#7f8c8d' }}>
          This is your teacher dashboard. Manage your classes and game content from here.
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          {/* Classes Management Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: '#3498db', display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  Class Management
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Create and manage your classes, track student progress, and assign activities.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/teacher/classes')}
                  sx={{ 
                    backgroundColor: '#3498db', 
                    '&:hover': { backgroundColor: '#2980b9' } 
                  }}
                >
                  My Classes
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/teacher/classes/create')}
                  sx={{ ml: 2, borderColor: '#3498db', color: '#3498db' }}
                >
                  Create Class
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Game Content Management Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: '#27ae60', display: 'flex', alignItems: 'center' }}>
                  <GamesIcon sx={{ mr: 1 }} />
                  Game Content Management
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Create and manage categories, levels, and puzzles for the 4 Pics 1 Word game.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/teacher/game-management')}
                  sx={{ 
                    backgroundColor: '#27ae60', 
                    '&:hover': { backgroundColor: '#219653' } 
                  }}
                >
                  Manage Game Content
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TeacherHome;
