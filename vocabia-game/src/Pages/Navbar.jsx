// components/Navbar.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  List,
  ListItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";

// Material UI Icons
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MenuIcon from "@mui/icons-material/Menu";
import ListIcon from "@mui/icons-material/List";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import GroupIcon from "@mui/icons-material/Group";

const Navbar = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Mobile menu state
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  // --- Custom Word List Game Mode: Class Picker START ---
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classPickerError, setClassPickerError] = useState("");

  // Helper to get current classId
  const classId = localStorage.getItem("currentClassId");

  const handleCustomWordListClick = async () => {
    handleMobileMenuClose(); // Close mobile menu if open
    
    if (!classId) {
      setShowClassPicker(true);
      setLoadingClasses(true);
      setClassPickerError("");
      
      // Fetch teacher's classes
      try {
        const res = await axios.get("http://localhost:8080/api/teacher/classes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setClassPickerError("Failed to load your classes. Please try again.");
      } finally {
        setLoadingClasses(false);
      }
      return;
    }
    navigate(`/teacher/classes/${classId}/wordlists`);
  };

  const handleClassSelect = (selectedId) => {
    localStorage.setItem("currentClassId", selectedId);
    setShowClassPicker(false);
    navigate(`/teacher/classes/${selectedId}/wordlists`);
  };

  const handleChangeClass = () => {
    handleMobileMenuClose(); // Close mobile menu if open
    localStorage.removeItem("currentClassId");
    setShowClassPicker(true);
    handleCustomWordListClick(); // This will trigger class loading
  };
  // --- Custom Word List Game Mode: Class Picker END ---

  // Hide Navbar on login and register pages
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: "#2e7d32", // Green theme to match the rest of the app
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <Toolbar>
          {/* Logo/Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1, color: '#e8f5e9' }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: '#e8f5e9',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              VocabVenture
            </Typography>
          </Box>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', mx: 2, flexGrow: 1 }}>
              {role === "STUDENT" && (
                <>
                  <Button 
                    color="inherit" 
                    startIcon={<HomeIcon />}
                    onClick={() => navigate("/student-home")}
                    sx={{ mx: 0.5, color: '#e8f5e9' }}
                  >
                    Home
                  </Button>
                  <Button 
                    color="inherit" 
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate("/student/classes")}
                    sx={{ mx: 0.5, color: '#e8f5e9' }}
                  >
                    Classes
                  </Button>
                  <Button 
                    color="inherit" 
                    startIcon={<SportsEsportsIcon />}
                    onClick={() => navigate("/student/adventure")}
                    sx={{ mx: 0.5, color: '#e8f5e9' }}
                  >
                    Adventure
                  </Button>
                </>
              )}
              
              {role === "TEACHER" && (
                <>
                  <Button 
                    color="inherit" 
                    startIcon={<HomeIcon />}
                    onClick={() => navigate("/teacher-home")}
                    sx={{ mx: 0.5, color: '#e8f5e9' }}
                  >
                    Home
                  </Button>
                  <Button 
                    color="inherit" 
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate("/teacher/classes")}
                    sx={{ mx: 0.5, color: '#e8f5e9' }}
                  >
                    Classes
                  </Button>
                  <Button 
                    color="inherit" 
                    startIcon={<ListIcon />}
                    onClick={handleCustomWordListClick}
                    sx={{ mx: 0.5, color: '#e8f5e9' }}
                  >
                    Word Lists
                  </Button>
                  
                  {/* Current Class Chip */}
                  {classId && (
                    <Chip
                      icon={<MenuBookIcon sx={{ color: '#e8f5e9 !important' }} />}
                      label={`Class: ${classId}`}
                      onClick={handleChangeClass}
                      deleteIcon={<SwapHorizIcon sx={{ color: '#e8f5e9 !important' }} />}
                      onDelete={handleChangeClass}
                      sx={{
                        ml: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: '#e8f5e9',
                        '& .MuiChip-icon': { color: '#e8f5e9' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                      }}
                    />
                  )}
                </>
              )}
            </Box>
          )}
          
          {/* Logout Button (Desktop) */}
          {!isMobile && (role === "STUDENT" || role === "TEACHER") && (
            <Button 
              variant="contained" 
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={onLogout}
              sx={{ 
                ml: 'auto',
                bgcolor: '#e53935',
                '&:hover': { bgcolor: '#c62828' }
              }}
            >
              Logout
            </Button>
          )}
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: { width: '100%', maxWidth: '300px', mt: 1 }
        }}
      >
        {role === "STUDENT" && (
          <>
            <MenuItem onClick={() => { navigate("/student-home"); handleMobileMenuClose(); }}>
              <ListItemIcon><HomeIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
              <ListItemText>Home</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { navigate("/student/classes"); handleMobileMenuClose(); }}>
              <ListItemIcon><SchoolIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
              <ListItemText>Classes</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { navigate("/student/adventure"); handleMobileMenuClose(); }}>
              <ListItemIcon><SportsEsportsIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
              <ListItemText>Adventure Mode</ListItemText>
            </MenuItem>
            <Divider />
          </>
        )}
        
        {role === "TEACHER" && (
          <>
            <MenuItem onClick={() => { navigate("/teacher-home"); handleMobileMenuClose(); }}>
              <ListItemIcon><HomeIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
              <ListItemText>Home</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { navigate("/teacher/classes"); handleMobileMenuClose(); }}>
              <ListItemIcon><SchoolIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
              <ListItemText>Classes</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCustomWordListClick}>
              <ListItemIcon><ListIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
              <ListItemText>Word Lists</ListItemText>
            </MenuItem>
            
            {classId && (
              <MenuItem onClick={handleChangeClass}>
                <ListItemIcon><SwapHorizIcon fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
                <ListItemText>Change Class (Current: {classId})</ListItemText>
              </MenuItem>
            )}
            <Divider />
          </>
        )}
        
        {/* Logout in Mobile Menu */}
        {(role === "STUDENT" || role === "TEACHER") && (
          <MenuItem onClick={onLogout} sx={{ color: '#e53935' }}>
            <ListItemIcon><ExitToAppIcon fontSize="small" sx={{ color: '#e53935' }} /></ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Class Picker Dialog */}
      <Dialog
        open={showClassPicker}
        onClose={() => setShowClassPicker(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}>
          Select a Class for Word Lists
        </DialogTitle>
        
        <DialogContent sx={{ py: 2 }}>
          {loadingClasses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="success" />
            </Box>
          ) : classPickerError ? (
            <Box sx={{ py: 2 }}>
              <Typography color="error" gutterBottom>{classPickerError}</Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={handleCustomWordListClick}
                startIcon={<SchoolIcon />}
              >
                Try Again
              </Button>
            </Box>
          ) : classes.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              You don't have any classes yet. Please create a class first.
            </Typography>
          ) : (
            <List sx={{ pt: 1 }}>
              {classes.map((c) => (
                <ListItem disablePadding key={c.id}>
                  <ListItemButton onClick={() => handleClassSelect(c.id)}>
                    <ListItemIcon>
                      <SchoolIcon sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={c.name} 
                      secondary={c.description || 'No description'} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowClassPicker(false)} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
