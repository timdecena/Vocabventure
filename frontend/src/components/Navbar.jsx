import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { styled } from '@mui/material/styles';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GamesIcon from '@mui/icons-material/Games';

// ─── Styled Components ─────────────────────────────────────────────────────────

const NavbarContainer = styled(AppBar)(({ theme }) => ({
  background: 'rgba(10, 10, 46, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  borderBottom: '1px solid rgba(0, 255, 170, 0.3)',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: 'white',
  textDecoration: 'none',
  letterSpacing: 1,
  fontSize: '1.5rem',
  textShadow: '0 0 10px rgba(0, 255, 170, 0.5)',
  '& span': {
    color: theme.palette.secondary.main,
    fontWeight: 900,
  },
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    textShadow: '0 0 15px rgba(0, 255, 170, 0.7)',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  letterSpacing: 0.5,
  padding: theme.spacing(1, 2),
  borderRadius: 8,
  color: 'rgba(255, 255, 255, 0.85)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    transform: 'translateY(-1px)',
    color: theme.palette.secondary.main,
  },
}));

const ActiveNavButton = styled(NavButton)(({ theme }) => ({
  color: theme.palette.secondary.main,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '50%',
    height: 2,
    background: `linear-gradient(90deg, transparent, ${theme.palette.secondary.main}, transparent)`,
    borderRadius: 1,
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 36,
  height: 36,
  border: `2px solid ${theme.palette.secondary.main}`,
  boxShadow: '0 0 10px rgba(0, 255, 170, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 15px rgba(0, 255, 170, 0.5)',
  },
}));

// ─── Navbar Component ─────────────────────────────────────────────────────────

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const dashboardPath = userData?.role?.toLowerCase() === 'teacher'
    ? '/teacher-dashboard'
    : '/student-dashboard';

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/users/me/profile-picture', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        withCredentials: true,
      });
      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfilePicture(imageUrl);
      }
    } catch {
      console.log('No profile picture available or error fetching it');
    }
  };

  useEffect(() => {
    setUserMenuAnchor(null);
    setMobileMenuAnchor(null);

    if (isLoggedIn) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          setUserData(JSON.parse(userStr));
          fetchProfilePicture();
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      if (profilePicture) {
        URL.revokeObjectURL(profilePicture);
        setProfilePicture(null);
      }
    }
  }, [location.pathname, isLoggedIn]);

  useEffect(() => {
    return () => {
      if (profilePicture) URL.revokeObjectURL(profilePicture);
    };
  }, [profilePicture]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavbarContainer position="fixed" sx={{ width: '100%', zIndex: 1100 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ height: 70, display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <Box component={Link} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoText variant="h5">
              Vocab<span>Venture</span>
            </LogoText>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isLoggedIn ? (
                <>
                  {[{ label: "Home", icon: <HomeIcon />, path: "/" },
                    { label: "Word Game", icon: <GamesIcon />, path: "/game" },
                    { label: "Missions", icon: <ExploreIcon />, path: "/missions" },
                    { label: "Dashboard", icon: <RocketLaunchIcon />, path: dashboardPath },
                    { label: "My Quest", icon: <AccountCircleIcon />, path: "/profile" }]
                    .map(({ label, icon, path }) =>
                      isActive(path) ? (
                        <ActiveNavButton key={label} startIcon={icon} component={Link} to={path}>{label}</ActiveNavButton>
                      ) : (
                        <NavButton key={label} startIcon={icon} component={Link} to={path}>{label}</NavButton>
                      )
                    )}
                  <Tooltip title={userData?.username || 'Profile'}>
                    <UserAvatar onClick={handleUserMenuOpen}>
                      {profilePicture ? <Avatar src={profilePicture} sx={{ width: '100%', height: '100%' }} /> :
                        userData?.username?.charAt(0).toUpperCase() || "U"}
                    </UserAvatar>
                  </Tooltip>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: 'rgba(10,10,46,0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        mt: 1.5,
                        '& .MuiMenuItem-root': { color: 'white' },
                      },
                    }}
                  >
                    {!isActive('/profile') && (
                      <>
                        <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                          <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                          Profile
                        </MenuItem>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                      </>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                      Exit Adventure
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <NavButton variant="outlined" color="secondary" startIcon={<RocketLaunchIcon />} component={Link} to="/login">
                    Begin Quest
                  </NavButton>
                  <NavButton variant="contained" color="primary" startIcon={<PersonAddIcon />} component={Link} to="/register">
                    Join Adventure
                  </NavButton>
                </>
              )}
            </Box>
          ) : (
            <IconButton color="inherit" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} sx={{ color: 'secondary.main' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>
    </NavbarContainer>
  );
}
