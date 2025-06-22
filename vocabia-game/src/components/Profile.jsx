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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../api/api';

const Profile = () => {
  // Change Password State
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Change Password Handlers
  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault?.();
    if (!changePassword.currentPassword || !changePassword.newPassword || !changePassword.confirmNewPassword) {
      setSnackbar({ open: true, message: 'Please fill in all password fields.', severity: 'error' });
      return;
    }
    if (changePassword.newPassword !== changePassword.confirmNewPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match.', severity: 'error' });
      return;
    }
    if (changePassword.newPassword.length < 6) {
      setSnackbar({ open: true, message: 'New password must be at least 6 characters.', severity: 'error' });
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/api/users/me/change-password', {
        currentPassword: changePassword.currentPassword,
        newPassword: changePassword.newPassword
      });
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      setChangePassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      let msg = 'Failed to change password.';
      if (err.response?.data?.message) msg = err.response.data.message;
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Profile State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile. Please try again later.');
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
          message: 'Image too large! Maximum size is 1MB.',
          severity: 'error'
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select an image file.',
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
      const response = await api.post('/api/users/me/profile-image', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploading(false);
      setSnackbar({
        open: true,
        message: 'Profile image updated successfully!',
        severity: 'success'
      });
    } catch (err) {
      setUploading(false);
      setSnackbar({
        open: true,
        message: 'Failed to upload image. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await api.put('/api/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      setProfile(response.data);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profile information updated successfully!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: '#00eaff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <style>
        {`
          .profile-container {
            background: linear-gradient(135deg, #18181b 70%, #1a1a22 100%);
            border: 2.5px solid #00eaff;
            border-radius: 24px;
            box-shadow: 0 0 32px #00eaff80, 0 0 64px #ff00c880, 0 0 0 8px #00eaff15 inset;
            padding: 32px;
            max-width: 800px;
            margin: 0 auto;
            margin-bottom: 36px;
            transition: all 0.3s ease;
          }
          .profile-title {
            color: #00eaff;
            font-family: 'Press Start 2P', cursive;
            text-shadow: 0 0 8px #00eaff;
            margin-bottom: 24px;
            text-align: center;
          }
          .profile-avatar-container {
            position: relative;
            margin: 0 auto 24px;
            width: 150px;
            height: 150px;
          }
          .profile-avatar {
            width: 150px;
            height: 150px;
            border: 3px solid #ff00c8;
            box-shadow: 0 0 16px #ff00c880;
          }
          .profile-camera-btn {
            position: absolute !important;
            bottom: 0;
            right: 0;
            background-color: #ff00c8 !important;
            color: white !important;
            box-shadow: 0 0 8px #ff00c880 !important;
          }
          .profile-field {
            margin-bottom: 16px !important;
          }
          .profile-info-label {
            color: #00eaff;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.8rem;
            margin-bottom: 4px;
          }
          .profile-info-value {
            color: white;
            font-family: 'Montserrat', 'Roboto', sans-serif;
            font-size: 1rem;
            margin-bottom: 16px;
          }
          .profile-role-badge {
            background: #18181b;
            border: 2px solid #ff00c8;
            border-radius: 10px;
            box-shadow: 0 0 12px #ff00c880;
            padding: 6px 12px;
            display: inline-flex;
            align-items: center;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.7rem;
            color: #ff00c8;
            text-shadow: 0 0 8px #ff00c8;
            margin-bottom: 16px;
          }
          .profile-gold-badge {
            background: #18181b;
            border: 2px solid #ffd700;
            border-radius: 10px;
            box-shadow: 0 0 12px #ffd70080;
            padding: 6px 12px;
            display: inline-flex;
            align-items: center;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.7rem;
            color: #ffd700;
            text-shadow: 0 0 8px #ffd700;
            margin-bottom: 16px;
          }
          .profile-edit-btn, .profile-save-btn, .profile-cancel-btn, .profile-upload-btn {
            font-family: 'Press Start 2P', cursive !important;
            font-size: 0.7rem !important;
            padding: 8px 16px !important;
            margin: 8px !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;
          }
          .profile-edit-btn {
            background-color: #00eaff !important;
            color: #18181b !important;
            border: 2px solid #00eaff !important;
          }
          .profile-edit-btn:hover {
            background-color: transparent !important;
            color: #00eaff !important;
            box-shadow: 0 0 12px #00eaff !important;
          }
          .profile-save-btn {
            background-color: #00ff00 !important;
            color: #18181b !important;
            border: 2px solid #00ff00 !important;
          }
          .profile-save-btn:hover {
            background-color: transparent !important;
            color: #00ff00 !important;
            box-shadow: 0 0 12px #00ff00 !important;
          }
          .profile-cancel-btn {
            background-color: #ff0000 !important;
            color: white !important;
            border: 2px solid #ff0000 !important;
          }
          .profile-cancel-btn:hover {
            background-color: transparent !important;
            color: #ff0000 !important;
            box-shadow: 0 0 12px #ff0000 !important;
          }
          .profile-upload-btn {
            background-color: #ff00c8 !important;
            color: white !important;
            border: 2px solid #ff00c8 !important;
            margin-top: 16px !important;
          }
          .profile-upload-btn:hover {
            background-color: transparent !important;
            color: #ff00c8 !important;
            box-shadow: 0 0 12px #ff00c8 !important;
          }
        `}
      </style>
      {/* MAIN PROFILE CONTAINER */}
      <Box className="profile-container">
        <Typography variant="h4" className="profile-title">
          MY PROFILE
        </Typography>
        <Box className="profile-avatar-container">
          <Avatar 
            className="profile-avatar"
            src={previewUrl || (profile?.profileImageBase64 ? `data:image/*;base64,${profile.profileImageBase64}` : null)}
            alt={profile?.username || 'User'}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="profile-image-upload">
            <IconButton 
              className="profile-camera-btn"
              component="span"
              disabled={uploading}
            >
              <PhotoCameraIcon />
            </IconButton>
          </label>
        </Box>
        {selectedFile && (
          <Box display="flex" justifyContent="center" mb={3}>
            <Button
              variant="contained"
              className="profile-upload-btn"
              onClick={handleUploadImage}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {uploading ? 'Uploading...' : 'Upload New Image'}
            </Button>
          </Box>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Box display="flex" alignItems="center" mb={2}>
                <Box className="profile-role-badge">{profile?.role || 'USER'}</Box>
                {profile?.role === 'STUDENT' && (
                  <Box className="profile-gold-badge" ml={2}>
                    {profile?.gold || 0} GOLD
                  </Box>
                )}
              </Box>
              {editMode ? (
                <>
                  <TextField
                    className="profile-field"
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    className="profile-field"
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    className="profile-field"
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    disabled
                  />
                </>
              ) : (
                <>
                  <Typography className="profile-info-label">USERNAME</Typography>
                  <Typography className="profile-info-value">{profile?.username || 'N/A'}</Typography>
                  <Typography className="profile-info-label">FIRST NAME</Typography>
                  <Typography className="profile-info-value">{profile?.firstName || 'N/A'}</Typography>
                  <Typography className="profile-info-label">LAST NAME</Typography>
                  <Typography className="profile-info-value">{profile?.lastName || 'N/A'}</Typography>
                  <Typography className="profile-info-label">EMAIL</Typography>
                  <Typography className="profile-info-value">{profile?.email || 'N/A'}</Typography>
                </>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
              {editMode ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Button
                    variant="contained"
                    className="profile-save-btn"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="contained"
                    className="profile-cancel-btn"
                    startIcon={<CancelIcon />}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  className="profile-edit-btn"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        {/* CHANGE PASSWORD SECTION */}
        {!editMode && (
          <Box mt={4} sx={{ borderTop: '2px solid #00eaff', paddingTop: 3 }}>
            <Typography variant="h5" className="profile-title" sx={{ fontSize: '1.5rem', mb: 3, textShadow: '0 0 10px #00eaff' }}>
              SECURITY VAULT
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box component="form" display="flex" flexDirection="column">
                  <Typography className="profile-info-label" sx={{ marginBottom: 2 }}>
                    CHANGE YOUR SECRET CODE
                  </Typography>
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
                        backgroundColor: '#18181b',
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
                        backgroundColor: '#18181b',
                        color: 'white',
                        borderRadius: '8px',
                        '&:hover': { boxShadow: '0 0 5px #00eaff' },
                        '&.Mui-focused': { boxShadow: '0 0 10px #00eaff' }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column">
                  <Typography className="profile-info-label" sx={{ marginBottom: 2, visibility: 'hidden' }}>
                    HIDDEN LABEL
                  </Typography>
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
                        backgroundColor: '#18181b',
                        color: 'white',
                        borderRadius: '8px',
                        '&:hover': { boxShadow: '0 0 5px #00eaff' },
                        '&.Mui-focused': { boxShadow: '0 0 10px #00eaff' }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    sx={{
                      mt: 3,
                      backgroundColor: '#00eaff',
                      color: '#18181b',
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: '0.7rem',
                      padding: '10px 16px',
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
                    {changingPassword ? <CircularProgress size={24} sx={{ color: '#00eaff' }} /> : 'SECURE VAULT'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
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
