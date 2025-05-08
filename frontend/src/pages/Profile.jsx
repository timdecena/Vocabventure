import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Avatar,
  Typography,
  Divider,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTheme, styled } from '@mui/material/styles';

// Meteor animation component
const Meteor = styled(Box)(({ delay = 0 }) => ({
  position: 'absolute',
  width: '2px',
  height: '2px',
  background: '#fff',
  opacity: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '50px',
    height: '1px',
    background: 'linear-gradient(90deg, #fff, transparent)',
    transform: 'translateX(-100%)',
  },
  animation: 'meteor 3s ease-in infinite',
  animationDelay: delay + 's',
  top: Math.random() * 50 + '%',
  left: Math.random() * 100 + '%',
}));

// Star background with multiple layers
const StarBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  '&::before, &::after, &::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(2px 2px at var(--star-x) var(--star-y), #fff, rgba(0,0,0,0))',
    backgroundSize: '200px 200px',
    animation: 'moveStars 60s linear infinite',
  },
  '&::after': {
    backgroundSize: '300px 300px',
    animation: 'moveStars 90s linear infinite',
    opacity: 0.6,
    filter: 'blur(1px)',
  },
  '& > div': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(1px 1px at var(--star-x2) var(--star-y2), rgba(0,255,170,0.4), rgba(0,0,0,0))',
    backgroundSize: '400px 400px',
    animation: 'moveStars 120s linear infinite',
    opacity: 0.3,
    filter: 'blur(0.5px)',
  },
  '@keyframes moveStars': {
    '0%': {
      transform: 'translateY(0)'
    },
    '100%': {
      transform: 'translateY(-100%)'
    }
  }
}));

// Constellation point
const ConstellationPoint = styled(Box)(({ size = 2, glow = false }) => ({
  position: 'absolute',
  width: size + 'px',
  height: size + 'px',
  background: '#fff',
  borderRadius: '50%',
  boxShadow: glow ? '0 0 10px rgba(0, 255, 170, 0.8)' : 'none',
  animation: 'twinkle 3s ease-in-out infinite',
}));

const Profile = () => {
  const theme = useTheme();
  const [userData, setUserData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [stats, setStats] = useState({
    achievements: [],
    streak: 7,
    completedLessons: 12,
    wordsLearned: 120,
    quizzesTaken: 8,
    experience: 450,
    nextLevelExp: 500,
    level: 3,
    recentActivity: []
  });

  useEffect(() => {
    // Fetch user data from localStorage
    const fetchUserData = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUserData(JSON.parse(userStr));
          fetchProfilePicture();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch user profile picture
  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available');
        return;
      }
      
      const response = await axios.get('http://localhost:8081/users/me/profile-picture', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'image/*'
        },
        responseType: 'blob',
        withCredentials: true
      });
      
      if (response.status === 200 && response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfilePicture(imageUrl);
      }
    } catch (error) {
      console.log('No profile picture available or error fetching it:', error.message);
      // Don't show error to user as this is expected for new accounts
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file is an image and size is reasonable
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Only image files are allowed',
        severity: 'error'
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setSnackbar({
        open: true,
        message: 'Image size should be less than 2MB',
        severity: 'error'
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'You must be logged in to upload a profile picture',
          severity: 'error'
        });
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Log the token format to help debug
      console.log('Token format check:', token.substring(0, 10) + '...');
      
      const response = await axios.post('http://localhost:8081/users/me/profile-picture', 
        formData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type here, it will be set automatically with the correct boundary
          },
          withCredentials: true
        }
      );
      
      if (response.data) {
        // Fetch the newly uploaded image
        const profilePicResponse = await axios.get('http://localhost:8081/users/me/profile-picture', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'image/*'
          },
          responseType: 'blob',
          withCredentials: true
        });
        
        if (profilePicResponse.data) {
          const imageUrl = URL.createObjectURL(profilePicResponse.data);
          setProfilePicture(imageUrl);
          
          // Dispatch event to notify other components (like Navbar) of the profile picture update
          window.dispatchEvent(new Event('profilePictureUpdated'));
          
          setSnackbar({
            open: true,
            message: response.data.message || 'Profile picture updated successfully',
            severity: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      let errorMessage = 'Failed to upload profile picture';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 
                      `Server error: ${error.response.status} ${error.response.statusText}`;
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
        console.error('Request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
        console.error('Error message:', error.message);
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0a0a2e',
      position: 'relative',
      overflow: 'hidden',
      pt: 10, // Add padding for the navbar
      pb: 5
    }}>
      <Navbar />
      
      <StarBackground>
        {[...Array(50)].map((_, index) => (
          <Meteor key={index} delay={index * 0.1} />
        ))}
        {[...Array(20)].map((_, index) => (
          <ConstellationPoint key={index} size={Math.random() * 5 + 1} glow={Math.random() < 0.5} />
        ))}
      </StarBackground>
      
      <Container maxWidth="lg" sx={{ mt: 2, pb: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
            gap: 2,
            minHeight: '80vh'
          }}
        >
          {/* Box 1 - Profile */}
          <Box
            sx={{
              gridColumn: '2 / span 3',
              gridRow: '2 / span 3',
              bgcolor: 'primary.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              p: 4,
              boxShadow: 3,
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={profilePicture}
                alt={userData?.username || 'User'}
                sx={{ width: 100, height: 100, mb: 2, border: '3px solid white' }}
              />
              <IconButton 
                component="label"
                htmlFor="profile-picture-input"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.dark'
                  },
                  boxShadow: 3
                }}
              >
                <AddAPhotoIcon />
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleProfilePictureUpload}
                />
              </IconButton>
            </Box>
            <Typography variant="h5" color="white" fontWeight={700}>
              {userData?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="white" sx={{ mb: 2 }}>
              {userData?.email || 'user@example.com'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ mt: 2, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              Edit Profile
            </Button>
          </Box>

          {/* Box 2 - Achievements */}
          <Box
            sx={{
              gridColumn: '5 / span 3',
              gridRow: '2 / span 3',
              bgcolor: 'secondary.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              p: 4,
              boxShadow: 3
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
            <Typography variant="h6" color="white" fontWeight={700} sx={{ mb: 1 }}>
              Achievements
            </Typography>
            {stats.achievements.length > 0 ? (
              stats.achievements.map((ach, index) => (
                <Typography key={index} variant="body2" color="white">
                  {ach.title}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="white">
                No achievements yet
              </Typography>
            )}
          </Box>

          {/* Box 3 - Creative Area */}
          <Box
            sx={{
              gridColumn: '4 / span 4',
              gridRow: '5 / span 3',
              bgcolor: 'success.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              p: 4,
              boxShadow: 3
            }}
          >
            <LightbulbIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
            <Typography variant="h6" color="white" fontWeight={700} sx={{ mb: 1 }}>
              Today's Tip
            </Typography>
            <Typography variant="body2" color="white" textAlign="center">
              "Consistency beats motivation. Keep showing up!"
            </Typography>
          </Box>

          {/* Box 4 - Notifications / Games */}
          <Box
            sx={{
              gridColumn: '2 / span 2',
              gridRow: '5 / span 3',
              bgcolor: 'error.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              p: 4,
              boxShadow: 3
            }}
          >
            <NotificationsIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
            <Typography variant="h6" color="white" fontWeight={700} sx={{ mb: 1 }}>
              Notifications
            </Typography>
            <Typography variant="body2" color="white" textAlign="center">
              New game available! Join now 🎮
            </Typography>
          </Box>
        </Box>
      </Container>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;