import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api/api';
import { useUser } from '../UserContext';
// NOTE: Import the 'Press Start 2P' font in your CSS or index.html via Google Fonts.

// Constants for UI text - move to constants.js for better i18n support
const PROFILE_AVATAR_ALT = 'Profile avatar';
const MESSAGES = {
  UPLOAD_SUCCESS: 'Profile image updated successfully!',
  UPLOAD_FAILURE: 'Failed to upload image. Please try again.',
  UPLOAD_NO_URL: 'Profile image upload failed: No image URL returned.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  PROFILE_UPDATE_FAILURE: 'Failed to update profile. Please try again.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully!',
  PASSWORD_CHANGE_FAILURE: 'Failed to change password.',
  PASSWORD_MISMATCH: 'New passwords do not match.',
  PASSWORD_LENGTH: 'New password must be at least 6 characters.',
  PASSWORD_FIELDS_REQUIRED: 'Please fill in all password fields.',
  PROFILE_LOAD_FAILURE: 'Failed to load profile. Please try again later.',
  IMAGE_TOO_LARGE: 'Image too large! Maximum size is 1MB.',
  IMAGE_TYPE_INVALID: 'Please select an image file.'
};

const Profile = () => {
  const { user, setUser } = useUser();
  // Change Password State
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Change Password Handlers
  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault?.();
    if (!changePassword.currentPassword || !changePassword.newPassword || !changePassword.confirmNewPassword) {
      setSnackbar({ open: true, message: MESSAGES.PASSWORD_FIELDS_REQUIRED, severity: 'error' });
      return;
    }
    if (changePassword.newPassword !== changePassword.confirmNewPassword) {
      setSnackbar({ open: true, message: MESSAGES.PASSWORD_MISMATCH, severity: 'error' });
      return;
    }
    if (changePassword.newPassword.length < 6) {
      setSnackbar({ open: true, message: MESSAGES.PASSWORD_LENGTH, severity: 'error' });
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/api/users/me/change-password', {
        currentPassword: changePassword.currentPassword,
        newPassword: changePassword.newPassword
      });
      setSnackbar({ open: true, message: MESSAGES.PASSWORD_CHANGE_SUCCESS, severity: 'success' });
      setChangePassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordDialogOpen(false);
    } catch (err) {
      let msg = MESSAGES.PASSWORD_CHANGE_FAILURE;
      if (err.response?.data?.message) msg = err.response.data.message;
      setSnackbar({ open: true, message: msg, severity: 'error' });
      console.error('Password change error:', err);
    } finally {
      setChangingPassword(false);
    }
  };
  
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setChangePassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  // Profile State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/me');
      if (!response.data) {
        throw new Error('No profile data received');
      }
      
      // Log profile data to help debug image issues
      console.log('Profile data received:', response.data);
      
      // Check if profilePicture exists and is valid
      if (response.data.profilePicture) {
        console.log('Profile picture URL:', response.data.profilePicture);
      } else {
        console.log('No profile picture URL in profile data');
      }
      
      setProfile(response.data);
      setUser(response.data); // Update global user context
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err.response?.data || err.message || err);
      setError(MESSAGES.PROFILE_LOAD_FAILURE);
      setLoading(false);
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        setSnackbar({
          open: true,
          message: MESSAGES.IMAGE_TOO_LARGE,
          severity: 'error'
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: MESSAGES.IMAGE_TYPE_INVALID,
          severity: 'error'
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append('file', selectedFile);
      
      // Upload image and get updated user object
      const response = await api.post('/api/users/me/profile-image', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Profile image upload response:', response.data);
      
      // Response is UserProfileResponse, with .profileImageBase64
      const updatedProfile = response.data;
      if (!updatedProfile || !updatedProfile.profileImageBase64) {
        setUploading(false);
        setSnackbar({
          open: true,
          message: MESSAGES.UPLOAD_NO_URL,
          severity: 'error'
        });
        return;
      }
      setProfile(updatedProfile);
      setUser(updatedProfile);
      setPreviewUrl(`data:image/png;base64,${updatedProfile.profileImageBase64}`);
      setSelectedFile(null);
      setUploading(false);
      setSnackbar({
        open: true,
        message: MESSAGES.UPLOAD_SUCCESS,
        severity: 'success'
      });
      await fetchProfile();
    } catch (err) {
      console.error('Profile image upload error:', err.response?.data || err.message || err);
      setUploading(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || MESSAGES.UPLOAD_FAILURE,
        severity: 'error'
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName) {
        setSnackbar({
          open: true,
          message: 'First name and last name are required.',
          severity: 'warning'
        });
        return;
      }
      
      setLoading(true);
      // Only send firstName and lastName per backend contract
      const response = await api.put('/api/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      setProfile(response.data);
      setUser(response.data); // Update global user context
      setEditMode(false);
      setLoading(false);
      setSnackbar({
        open: true,
        message: MESSAGES.PROFILE_UPDATE_SUCCESS,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setLoading(false);
      setSnackbar({
        open: true,
        message: MESSAGES.PROFILE_UPDATE_FAILURE,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <>
      <style>
        {`
          .profile-container {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            padding: 2rem;
            font-family: 'Press Start 2P', cursive;
          }
          .profile-title {
            color: #00eaff;
            font-family: 'Press Start 2P', cursive;
            font-size: 1.5rem;
            text-shadow: 0 0 10px #00eaff;
            margin-bottom: 2rem;
            text-align: center;
          }
          .profile-card {
            background: rgba(24, 24, 27, 0.9);
            border: 2px solid #00eaff;
            border-radius: 16px;
            box-shadow: 0 0 20px #00eaff80;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          .avatar-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            border: 2px solid #00eaff;
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.3);
            position: relative;
          }
          .role-badge {
            background: #ff00c8;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.6rem;
            font-weight: bold;
            margin-top: 1rem;
            text-shadow: 0 0 5px #ff00c8;
            border: 1px solid #ff00c8;
          }
          .gold-badge {
            background: #ffd700;
            color: #000;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.6rem;
            font-weight: bold;
            margin-top: 0.5rem;
            text-shadow: none;
            border: 1px solid #ffd700;
          }
          .info-section {
            padding: 1rem;
          }
          .info-label {
            color: #00eaff;
            font-size: 0.7rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 5px #00eaff;
          }
          .info-value {
            color: white;
            font-size: 0.8rem;
            margin-bottom: 1rem;
            background: rgba(0, 0, 0, 0.3);
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #333;
          }
          .edit-button {
            background: #00eaff !important;
            color: #18181b !important;
            font-family: 'Press Start 2P', cursive !important;
            font-size: 0.6rem !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            border: 2px solid #00eaff !important;
            box-shadow: 0 0 10px #00eaff !important;
          }
          .edit-button:hover {
            background: #18181b !important;
            color: #00eaff !important;
            box-shadow: 0 0 15px #00eaff !important;
          }
          .change-password-button {
            background: #00eaff !important;
            color: #18181b !important;
            font-family: 'Press Start 2P', cursive !important;
            font-size: 0.6rem !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            border: 2px solid #00eaff !important;
            box-shadow: 0 0 10px #00eaff !important;
            margin-top: 1rem !important;
          }
          .change-password-button:hover {
            background: #18181b !important;
            color: #00eaff !important;
            box-shadow: 0 0 15px #00eaff !important;
          }
        `}
      </style>
      <Box className="profile-container">
        <Typography className="profile-title">MY PROFILE</Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress sx={{ color: '#00eaff' }} />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Typography color="error" sx={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.8rem' }}>
              {error}
            </Typography>
          </Box>
        ) : (
          <Box className="profile-card">
            <Grid container spacing={4}>
              {/* Avatar Section */}
              <Grid item xs={12} md={4}>
                <Box className="avatar-section">
                  <Box position="relative">
                    <Avatar
                      src={
                        // Robust avatar source logic with improved fallbacks:
                        previewUrl
                          ? previewUrl
                          : profile?.profileImageBase64
                          ? `data:image/png;base64,${profile.profileImageBase64}`
                          : '/default-avatar.png'
                      }
                      alt={PROFILE_AVATAR_ALT}
                      sx={{
                        width: 120,
                        height: 120,
                        border: '3px solid #ff00c8',
                        boxShadow: '0 0 15px #ff00c8'
                      }}
                      onError={e => { 
                        console.log('Avatar load error, using default'); 
                        e.target.onerror = null; 
                        e.target.src = '/default-avatar.png'; 
                      }}
                    />
                    {console.log('Avatar src attempt:', previewUrl || user?.profilePicture || profile?.profilePicture || 'default')}
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#ff00c8',
                        color: 'white',
                        '&:hover': { backgroundColor: '#ff00c8dd' }
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </IconButton>
                  </Box>
                  
                  <Box className="role-badge">
                    {profile?.role || 'USER'}
                  </Box>
                  
                  {profile?.role === 'STUDENT' && (
                    <Box className="gold-badge">
                      {profile?.gold || 0} GOLD
                    </Box>
                  )}
                  
                  {selectedFile && (
                    <Button
                      variant="contained"
                      onClick={handleUploadImage}
                      disabled={uploading}
                      sx={{ mt: 2, fontSize: '0.6rem' }}
                      className="edit-button"
                    >
                      {uploading ? <CircularProgress size={16} /> : 'UPLOAD'}
                    </Button>
                  )}
                </Box>
              </Grid>

              {/* Info Section */}
              <Grid item xs={12} md={8}>
                <Box className="info-section">
                  {editMode ? (
                    <>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        disabled
                        InputProps={{
                          sx: {
                            backgroundColor: '#23232b',
                            color: 'white',
                            borderRadius: '8px'
                          }
                        }}
                        InputLabelProps={{
                          sx: { color: '#00eaff', fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }
                        }}
                      />
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                          sx: {
                            backgroundColor: '#23232b',
                            color: 'white',
                            borderRadius: '8px'
                          }
                        }}
                        InputLabelProps={{
                          sx: { color: '#00eaff', fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                          sx: {
                            backgroundColor: '#23232b',
                            color: 'white',
                            borderRadius: '8px'
                          }
                        }}
                        InputLabelProps={{
                          sx: { color: '#00eaff', fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }
                        }}
                      />

                      <Box display="flex" gap={2} mt={2}>
                        <Button
                          variant="contained"
                          className="edit-button"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                        >
                          SAVE
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setEditMode(false)}
                          sx={{
                            color: '#00eaff',
                            borderColor: '#00eaff',
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: '0.6rem'
                          }}
                        >
                          CANCEL
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box mb={2}>
                        <Typography className="info-label">USERNAME</Typography>
                        <Typography className="info-value">{profile?.username || 'N/A'}</Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography className="info-label">FIRST NAME</Typography>
                        <Typography className="info-value">{profile?.firstName || 'N/A'}</Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography className="info-label">LAST NAME</Typography>
                        <Typography className="info-value">{profile?.lastName || 'N/A'}</Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography className="info-label">EMAIL</Typography>
                        <Typography className="info-value">{profile?.email || 'N/A'}</Typography>
                      </Box>
                      
                      <Box display="flex" gap={2} mt={3}>
                        <Button
                          variant="contained"
                          className="edit-button"
                          startIcon={<EditIcon />}
                          onClick={() => setEditMode(true)}
                        >
                          EDIT PROFILE
                        </Button>
                        <Button
                          variant="contained"
                          className="change-password-button"
                          startIcon={<LockIcon />}
                          onClick={handleOpenPasswordDialog}
                        >
                          CHANGE PASSWORD
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={handleClosePasswordDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#18181b',
            border: '2px solid #00eaff',
            borderRadius: '12px',
            boxShadow: '0 0 20px #00eaff',
            minWidth: { xs: '90%', sm: '500px' },
            maxWidth: '600px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#00eaff', 
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '1rem',
          textAlign: 'center',
          textShadow: '0 0 10px #00eaff',
          borderBottom: '1px solid #00eaff',
          padding: '16px 24px'
        }}>
          CHANGE PASSWORD
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            placeholder="Current Secret Code"
            type="password"
            name="currentPassword"
            value={changePassword.currentPassword}
            onChange={handleChangePasswordInput}
            margin="normal"
            fullWidth
            InputProps={{
              sx: {
                backgroundColor: '#23232b',
                color: 'white',
                borderRadius: '8px',
                '&:hover': { boxShadow: '0 0 5px #00eaff' },
                '&.Mui-focused': { boxShadow: '0 0 10px #00eaff' }
              }
            }}
          />
          <TextField
            placeholder="New Secret Code"
            type="password"
            name="newPassword"
            value={changePassword.newPassword}
            onChange={handleChangePasswordInput}
            margin="normal"
            fullWidth
            InputProps={{
              sx: {
                backgroundColor: '#23232b',
                color: 'white',
                borderRadius: '8px',
                '&:hover': { boxShadow: '0 0 5px #00eaff' },
                '&.Mui-focused': { boxShadow: '0 0 10px #00eaff' }
              }
            }}
          />
          <TextField
            placeholder="Confirm New Secret Code"
            type="password"
            name="confirmNewPassword"
            value={changePassword.confirmNewPassword}
            onChange={handleChangePasswordInput}
            margin="normal"
            fullWidth
            InputProps={{
              sx: {
                backgroundColor: '#23232b',
                color: 'white',
                borderRadius: '8px',
                '&:hover': { boxShadow: '0 0 5px #00eaff' },
                '&.Mui-focused': { boxShadow: '0 0 10px #00eaff' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #00eaff', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClosePasswordDialog}
            sx={{
              color: '#00eaff',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.7rem',
              '&:hover': {
                backgroundColor: 'rgba(0, 234, 255, 0.1)'
              }
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={changingPassword}
            sx={{
              backgroundColor: '#00eaff',
              color: '#18181b',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.7rem',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid #00eaff',
              boxShadow: '0 0 10px #00eaff',
              '&:hover': {
                backgroundColor: '#18181b',
                color: '#00eaff',
                boxShadow: '0 0 15px #00eaff'
              }
            }}
          >
            {changingPassword ? <CircularProgress size={20} sx={{ color: '#00eaff' }} /> : 'SECURE VAULT'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default Profile;
