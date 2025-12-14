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
  DialogActions,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from '../api/api';
import { useUser } from '../UserContext';

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
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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
      
      console.log('Profile data received:', response.data);
      
      if (response.data.profilePicture) {
        console.log('Profile picture URL:', response.data.profilePicture);
      } else {
        console.log('No profile picture URL in profile data');
      }
      
      setProfile(response.data);
      setUser(response.data);
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
      
      const response = await api.post('/api/users/me/profile-image', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Profile image upload response:', response.data);
      
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
      if (!formData.firstName || !formData.lastName) {
        setSnackbar({
          open: true,
          message: 'First name and last name are required.',
          severity: 'warning'
        });
        return;
      }
      
      setLoading(true);
      const response = await api.put('/api/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      setProfile(response.data);
      setUser(response.data);
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
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          background: "linear-gradient(120deg, #17172b 0%, #23233b 100%)",
          py: { xs: 3, md: 6 },
          px: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            maxWidth: 900,
            mx: "auto",
            borderRadius: "28px",
            border: "3px solid #00eaff",
            boxShadow: "0 0 50px #00eaff44, 0 0 90px #ff00c855",
            background: "rgba(33,33,44, 0.98)",
            p: { xs: 2.5, md: 5 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 4,
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h2"
                sx={{
                  color: "#00eaff",
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: "0 0 18px #00eaff, 0 0 44px #ff00c8",
                  fontWeight: 700,
                  fontSize: { xs: 24, md: 32 },
                }}
              >
                My Profile
              </Typography>
              <Typography
                sx={{
                  color: "#ff00c8",
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: "0 0 10px #ff00c8",
                  fontSize: { xs: 11, md: 14 },
                  fontWeight: 600,
                  mt: 1,
                }}
              >
                Manage your account settings and preferences
              </Typography>
            </Box>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CircularProgress
                sx={{
                  color: "#00eaff",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
                size={62}
              />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <Typography
                sx={{
                  color: "#ff00c8",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 14,
                  textShadow: "0 0 10px #ff00c8",
                }}
              >
                {error}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Avatar Section */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={8}
                  sx={{
                    background: "#1a1a26",
                    border: "2.5px solid #00eaff",
                    borderRadius: "21px",
                    boxShadow: "0 0 34px #00eaff66",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Box position="relative">
                    <Avatar
                      src={
                        previewUrl
                          ? previewUrl
                          : profile?.profileImageBase64
                          ? `data:image/png;base64,${profile.profileImageBase64}`
                          : '/default-avatar.png'
                      }
                      alt={PROFILE_AVATAR_ALT}
                      sx={{
                        width: 140,
                        height: 140,
                        border: "3px solid #ff00c8",
                        boxShadow: "0 0 20px #ff00c8, 0 0 40px #00eaff",
                        mb: 2,
                      }}
                      onError={(e) => {
                        console.log('Avatar load error, using default');
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        backgroundColor: "#00eaff",
                        color: "#191924",
                        border: "2px solid #ff00c8",
                        boxShadow: "0 0 10px #00eaff",
                        "&:hover": {
                          backgroundColor: "#ff00c8",
                          color: "#fff",
                          boxShadow: "0 0 15px #ff00c8",
                        },
                      }}
                    >
                      <PhotoCameraIcon />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </IconButton>
                  </Box>

                  {selectedFile && (
                    <Button
                      variant="contained"
                      onClick={handleUploadImage}
                      disabled={uploading}
                      sx={{
                        background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
                        color: "#191924",
                        fontWeight: 700,
                        borderRadius: "8px",
                        fontFamily: "'Press Start 2P', monospace",
                        boxShadow: "0 0 8px #00eaff80",
                        textTransform: "none",
                        px: 2.5,
                        fontSize: 11,
                        mt: 1,
                        "&:hover": {
                          background: "#ff00c8",
                          color: "#fff",
                        },
                      }}
                    >
                      {uploading ? <CircularProgress size={16} sx={{ color: "#191924" }} /> : "UPLOAD"}
                    </Button>
                  )}

                  <Divider sx={{ width: "100%", my: 2, borderColor: "#00eaff44" }} />

                  <Chip
                    label={profile?.role || 'USER'}
                    sx={{
                      background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
                      color: "#191924",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      px: 1,
                      mb: 1,
                    }}
                  />

                  {profile?.role === 'STUDENT' && (
                    <Chip
                      icon={<Typography sx={{ fontSize: 14 }}>💰</Typography>}
                      label={`${profile?.gold || 0} GOLD`}
                      sx={{
                        background: "#ffd700",
                        color: "#000",
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        px: 1,
                      }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Info Section */}
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={8}
                  sx={{
                    background: "#1a1a26",
                    border: "2.5px solid #00eaff",
                    borderRadius: "21px",
                    boxShadow: "0 0 34px #00eaff66",
                    p: 3,
                    minHeight: 400,
                  }}
                >
                  {editMode ? (
                    <Box>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username || profile?.username || ''}
                        disabled
                        margin="normal"
                        InputProps={{
                          sx: {
                            backgroundColor: "#23232b",
                            color: "#fff",
                            borderRadius: "8px",
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: 12,
                          },
                        }}
                        InputLabelProps={{
                          sx: {
                            color: "#00eaff",
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: 10,
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                          sx: {
                            backgroundColor: "#23232b",
                            color: "#fff",
                            borderRadius: "8px",
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: 12,
                          },
                        }}
                        InputLabelProps={{
                          sx: {
                            color: "#00eaff",
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: 10,
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        margin="normal"
                        InputProps={{
                          sx: {
                            backgroundColor: "#23232b",
                            color: "#fff",
                            borderRadius: "8px",
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: 12,
                          },
                        }}
                        InputLabelProps={{
                          sx: {
                            color: "#00eaff",
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: 10,
                          },
                        }}
                      />

                      <Box display="flex" gap={2} mt={3}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                          sx={{
                            background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
                            color: "#191924",
                            fontWeight: 700,
                            borderRadius: "8px",
                            fontFamily: "'Press Start 2P', monospace",
                            boxShadow: "0 0 8px #00eaff80",
                            textTransform: "none",
                            px: 2.5,
                            fontSize: 11,
                            "&:hover": {
                              background: "#ff00c8",
                              color: "#fff",
                            },
                          }}
                        >
                          SAVE
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setEditMode(false)}
                          sx={{
                            color: "#00eaff",
                            borderColor: "#00eaff",
                            fontFamily: "'Press Start 2P', monospace",
                            borderRadius: "8px",
                            textTransform: "none",
                            px: 2.5,
                            fontSize: 11,
                            "&:hover": {
                              background: "#00eaff22",
                              borderColor: "#ff00c8",
                              color: "#fff",
                            },
                          }}
                        >
                          CANCEL
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                          p: 2,
                          background: "rgba(0, 234, 255, 0.05)",
                          borderRadius: "12px",
                          border: "1px solid #00eaff44",
                        }}
                      >
                        <AccountCircleIcon sx={{ color: "#00eaff", fontSize: 28 }} />
                        <Box>
                          <Typography
                            sx={{
                              color: "#00eaff",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 10,
                              textShadow: "0 0 8px #00eaff",
                              mb: 0.5,
                            }}
                          >
                            USERNAME
                          </Typography>
                          <Typography
                            sx={{
                              color: "#fff",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 12,
                            }}
                          >
                            {profile?.username || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                          p: 2,
                          background: "rgba(0, 234, 255, 0.05)",
                          borderRadius: "12px",
                          border: "1px solid #00eaff44",
                        }}
                      >
                        <PersonIcon sx={{ color: "#00eaff", fontSize: 28 }} />
                        <Box>
                          <Typography
                            sx={{
                              color: "#00eaff",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 10,
                              textShadow: "0 0 8px #00eaff",
                              mb: 0.5,
                            }}
                          >
                            FULL NAME
                          </Typography>
                          <Typography
                            sx={{
                              color: "#fff",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 12,
                            }}
                          >
                            {profile?.firstName || 'N/A'} {profile?.lastName || ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                          p: 2,
                          background: "rgba(0, 234, 255, 0.05)",
                          borderRadius: "12px",
                          border: "1px solid #00eaff44",
                        }}
                      >
                        <EmailIcon sx={{ color: "#00eaff", fontSize: 28 }} />
                        <Box>
                          <Typography
                            sx={{
                              color: "#00eaff",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 10,
                              textShadow: "0 0 8px #00eaff",
                              mb: 0.5,
                            }}
                          >
                            EMAIL
                          </Typography>
                          <Typography
                            sx={{
                              color: "#fff",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 12,
                            }}
                          >
                            {profile?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={2} mt={4} flexWrap="wrap">
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setEditMode(true)}
                          sx={{
                            background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
                            color: "#191924",
                            fontWeight: 700,
                            borderRadius: "8px",
                            fontFamily: "'Press Start 2P', monospace",
                            boxShadow: "0 0 8px #00eaff80",
                            textTransform: "none",
                            px: 2.5,
                            fontSize: 11,
                            "&:hover": {
                              background: "#ff00c8",
                              color: "#fff",
                            },
                          }}
                        >
                          EDIT PROFILE
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<LockIcon />}
                          onClick={handleOpenPasswordDialog}
                          sx={{
                            color: "#00eaff",
                            borderColor: "#00eaff",
                            fontFamily: "'Press Start 2P', monospace",
                            borderRadius: "8px",
                            textTransform: "none",
                            px: 2.5,
                            fontSize: 11,
                            "&:hover": {
                              background: "#00eaff22",
                              borderColor: "#ff00c8",
                              color: "#fff",
                            },
                          }}
                        >
                          CHANGE PASSWORD
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        PaperProps={{
          sx: {
            background: "#1a1a26",
            border: "3px solid #00eaff",
            borderRadius: "21px",
            boxShadow: "0 0 50px #00eaff44, 0 0 90px #ff00c855",
            minWidth: { xs: "90%", sm: "500px" },
            maxWidth: "600px",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#00eaff",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 16,
            textAlign: "center",
            textShadow: "0 0 10px #00eaff",
            borderBottom: "2px solid #00eaff44",
            padding: "20px 24px",
          }}
        >
          CHANGE PASSWORD
        </DialogTitle>
        <DialogContent sx={{ padding: "24px" }}>
          <TextField
            placeholder="Current Password"
            type="password"
            name="currentPassword"
            value={changePassword.currentPassword}
            onChange={handleChangePasswordInput}
            margin="normal"
            fullWidth
            InputProps={{
              sx: {
                backgroundColor: "#23232b",
                color: "#fff",
                borderRadius: "8px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
              },
            }}
          />
          <TextField
            placeholder="New Password"
            type="password"
            name="newPassword"
            value={changePassword.newPassword}
            onChange={handleChangePasswordInput}
            margin="normal"
            fullWidth
            InputProps={{
              sx: {
                backgroundColor: "#23232b",
                color: "#fff",
                borderRadius: "8px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
              },
            }}
          />
          <TextField
            placeholder="Confirm New Password"
            type="password"
            name="confirmNewPassword"
            value={changePassword.confirmNewPassword}
            onChange={handleChangePasswordInput}
            margin="normal"
            fullWidth
            InputProps={{
              sx: {
                backgroundColor: "#23232b",
                color: "#fff",
                borderRadius: "8px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            padding: "16px 24px",
            borderTop: "2px solid #00eaff44",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={handleClosePasswordDialog}
            sx={{
              color: "#00eaff",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              "&:hover": {
                backgroundColor: "rgba(0, 234, 255, 0.1)",
              },
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={changingPassword}
            sx={{
              background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
              color: "#191924",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              padding: "8px 16px",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": {
                background: "#ff00c8",
                color: "#fff",
              },
            }}
          >
            {changingPassword ? (
              <CircularProgress size={20} sx={{ color: "#191924" }} />
            ) : (
              "UPDATE"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Profile;
