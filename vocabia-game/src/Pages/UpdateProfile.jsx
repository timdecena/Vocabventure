// pages/UpdateProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  CheckCircle
} from "@mui/icons-material";

const UpdateProfile = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setForm((prev) => ({
          ...prev,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        }));
      } catch (err) {
        setErrorMsg("Failed to load profile. Please refresh to try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      await axios.put("http://localhost:8080/api/auth/update", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccessMsg("Profile updated successfully!");
      setForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
    } catch (err) {
      setErrorMsg(err.response?.data || "Failed to update profile. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const hasPasswordInput = form.oldPassword || form.newPassword;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f7fa"
      p={2}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "500px",
          p: 4,
          borderRadius: 2,
          bgcolor: "background.paper"
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="600"
            color="primary"
          >
            Update Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account information
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Personal Information
              </Typography>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                margin="normal"
                value={form.firstName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                margin="normal"
                value={form.lastName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Change Password
              </Typography>
              <TextField
                label="Current Password"
                name="oldPassword"
                type={showPassword.old ? "text" : "password"}
                fullWidth
                margin="normal"
                value={form.oldPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("old")}
                        edge="end"
                        size="small"
                      >
                        {showPassword.old ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
                placeholder={hasPasswordInput ? "" : "Leave blank to keep current password"}
              />
              <TextField
                label="New Password"
                name="newPassword"
                type={showPassword.new ? "text" : "password"}
                fullWidth
                margin="normal"
                value={form.newPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("new")}
                        edge="end"
                        size="small"
                      >
                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Box>

            {errorMsg && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setErrorMsg("")}
              >
                {errorMsg}
              </Alert>
            )}
            
            {successMsg && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                icon={<CheckCircle fontSize="inherit" />}
                onClose={() => setSuccessMsg("")}
              >
                {successMsg}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                mt: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1
              }}
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UpdateProfile;