// File: src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
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

  // anchors for the two menus
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  // fetch profile picture blob if available
  const fetchProfilePicture = async () => {
    if (!isLoggedIn) return;
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(
        'http://localhost:8081/users/me/profile-picture',
        { headers: { Authorization: 'Bearer ' + token }, responseType: 'blob' }
      );
      if (resp.status === 200) {
        setProfilePicture(URL.createObjectURL(resp.data));
      }
    } catch (e) {
      console.warn('No profile picture or error fetching it');
    }
  };

  // on route change or login state change, refresh user info & menus
  useEffect(() => {
    setUserMenuAnchor(null);
    setMobileMenuAnchor(null);

    if (isLoggedIn) {
      const u = localStorage.getItem('user');
      if (u) setUserData(JSON.parse(u));
      fetchProfilePicture();
    } else {
      if (profilePicture) {
        URL.revokeObjectURL(profilePicture);
        setProfilePicture(null);
      }
      setUserData(null);
    }
  }, [location.pathname, isLoggedIn]);

  // clean up object URL on unmount
  useEffect(() => () => {
    if (profilePicture) URL.revokeObjectURL(profilePicture);
  }, [profilePicture]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavbarContainer position="fixed" sx={{ width: '100%', zIndex: 1100 }}>
      {/* full-bleed container, no side gutters */}
      <Container maxWidth={false} disableGutters>
        <Toolbar
          disableGutters
          sx={{ height: 70, display: 'flex', alignItems: 'center', px: { xs: 2, sm: 4 } }}
        >
          {/* ─── Left: Logo ─────────────────────────────────────────────── */}
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <LogoText variant="h5">
              Vocab<span>Venture</span>
            </LogoText>
          </Box>

          {/* flex spacer pushes everything else to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* ─── Desktop Nav ───────────────────────────────────────────── */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: { xs: 2, sm: 4 } }}>
              {isLoggedIn ? (
                <>
                  {isActive('/') ? (
                    <ActiveNavButton
                      startIcon={<HomeIcon />}
                      component={Link}
                      to="/"
                      color="inherit"
                    >
                      Home
                    </ActiveNavButton>
                  ) : (
                    <NavButton startIcon={<HomeIcon />} component={Link} to="/" color="inherit">
                      Home
                    </NavButton>
                  )}

                  {isActive('/missions') ? (
                    <ActiveNavButton
                      startIcon={<ExploreIcon />}
                      component={Link}
                      to="/missions"
                      color="inherit"
                    >
                      Missions
                    </ActiveNavButton>
                  ) : (
                    <NavButton
                      startIcon={<ExploreIcon />}
                      component={Link}
                      to="/missions"
                      color="inherit"
                    >
                      Missions
                    </NavButton>
                  )}

                  {isActive('/profile') ? (
                    <ActiveNavButton
                      startIcon={<AccountCircleIcon />}
                      component={Link}
                      to="/profile"
                      color="inherit"
                    >
                      My Quest
                    </ActiveNavButton>
                  ) : (
                    <NavButton
                      startIcon={<AccountCircleIcon />}
                      component={Link}
                      to="/profile"
                      color="inherit"
                    >
                      My Quest
                    </NavButton>
                  )}

                  <Tooltip title={userData?.username || 'Profile'}>
                    <UserAvatar onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="avatar"
                          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                        />
                      ) : (
                        userData?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </UserAvatar>
                  </Tooltip>

                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
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
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem component={Link} to="/profile" onClick={() => setUserMenuAnchor(null)}>
                      <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Profile
                    </MenuItem>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                      Exit Adventure
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <NavButton
                    variant="outlined"
                    color="secondary"
                    startIcon={<RocketLaunchIcon />}
                    component={Link}
                    to="/login"
                    sx={{
                      borderColor: 'rgba(0,255,170,0.5)',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'rgba(0,255,170,0.1)',
                      },
                    }}
                  >
                    Begin Quest
                  </NavButton>

                  <NavButton
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    component={Link}
                    to="/register"
                    sx={{
                      boxShadow: '0 0 10px rgba(0,255,170,0.3)',
                      '&:hover': {
                        boxShadow: '0 0 15px rgba(0,255,170,0.5)',
                      },
                    }}
                  >
                    Join Adventure
                  </NavButton>
                </>
              )}
            </Box>
          )}

          {/* ─── Mobile Menu Icon ──────────────────────────────────────── */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
              sx={{ color: 'secondary.main' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* ─── Mobile Menu Drawer ───────────────────────────────────── */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={() => setMobileMenuAnchor(null)}
            PaperProps={{
              sx: {
                width: '100%',
                maxWidth: '300px',
                backgroundColor: 'rgba(10,10,46,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                mt: 1.5,
                '& .MuiMenuItem-root': { color: 'white', py: 1.5 },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {isLoggedIn ? (
              <>
                {userData && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <UserAvatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}>
                      {userData.username.charAt(0).toUpperCase()}
                    </UserAvatar>
                    <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                      {userData.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {userData.email}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <MenuItem
                  component={Link}
                  to="/"
                  onClick={() => setMobileMenuAnchor(null)}
                  sx={{
                    backgroundColor: isActive('/') ? 'rgba(0,255,170,0.1)' : 'transparent',
                  }}
                >
                  <HomeIcon
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                      color: isActive('/') ? 'secondary.main' : 'inherit',
                    }}
                  />
                  Home
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/missions"
                  onClick={() => setMobileMenuAnchor(null)}
                  sx={{
                    backgroundColor: isActive('/missions') ? 'rgba(0,255,170,0.1)' : 'transparent',
                  }}
                >
                  <ExploreIcon
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                      color: isActive('/missions') ? 'secondary.main' : 'inherit',
                    }}
                  />
                  Missions
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={() => setMobileMenuAnchor(null)}
                  sx={{
                    backgroundColor: isActive('/profile') ? 'rgba(0,255,170,0.1)' : 'transparent',
                  }}
                >
                  <AccountCircleIcon
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                      color: isActive('/profile') ? 'secondary.main' : 'inherit',
                    }}
                  />
                  My Quest
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Exit Adventure
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={() => setMobileMenuAnchor(null)}
                  sx={{
                    backgroundColor: isActive('/login') ? 'rgba(0,255,170,0.1)' : 'transparent',
                  }}
                >
                  <RocketLaunchIcon
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                      color: isActive('/login') ? 'secondary.main' : 'inherit',
                    }}
                  />
                  Begin Quest
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/register"
                  onClick={() => setMobileMenuAnchor(null)}
                  sx={{
                    backgroundColor: isActive('/register') ? 'rgba(0,255,170,0.1)' : 'transparent',
                  }}
                >
                  <PersonAddIcon
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                      color: isActive('/register') ? 'secondary.main' : 'inherit',
                    }}
                  />
                  Join Adventure
                </MenuItem>
              </>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </NavbarContainer>
  );
}
