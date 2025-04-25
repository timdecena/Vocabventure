// File: src/components/Navbar.jsx
// Enhanced version with improved styling and Material UI integration
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

// Import icons
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Styled components
const NavbarContainer = styled(AppBar)(({ theme }) => ({
  background: 'rgba(10, 10, 46, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  borderBottom: '1px solid rgba(0, 255, 170, 0.3)',
  '& .MuiToolbar-root': {
    transition: 'all 0.3s ease',
  }
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
  }
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
  fontWeight: 600,
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

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const isLoggedIn = localStorage.getItem('token') !== null;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setUserMenuAnchor(null);
    setMobileMenuAnchor(null);
    if (isLoggedIn) {
      try {
        const saved = localStorage.getItem('user');
        if (saved) setUserData(JSON.parse(saved));
      } catch {}
    }
  }, [location.pathname, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavbarContainer position="fixed" sx={{ width: '100%', zIndex: 1100 }}>
      <Container maxWidth={false} disableGutters>
        <Toolbar sx={{ height: 70, display: 'flex', alignItems: 'center' }}>

          {/* Logo on the left, with a bit of margin */}
          <Box component={Link} to="/" sx={{ ml: 2, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoText variant="h5">
              Vocab<span>Venture</span>
            </LogoText>
          </Box>

          {/* Desktop nav items */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto', mr: 2 }}>
              {isLoggedIn ? (
                <>
                  {isActive('/') ? (
                    <ActiveNavButton startIcon={<HomeIcon />} component={Link} to="/">Home</ActiveNavButton>
                  ) : (
                    <NavButton startIcon={<HomeIcon />} component={Link} to="/">Home</NavButton>
                  )}
                  {isActive('/missions') ? (
                    <ActiveNavButton startIcon={<ExploreIcon />} component={Link} to="/missions">Missions</ActiveNavButton>
                  ) : (
                    <NavButton startIcon={<ExploreIcon />} component={Link} to="/missions">Missions</NavButton>
                  )}
                  {isActive('/profile') ? (
                    <ActiveNavButton startIcon={<AccountCircleIcon />} component={Link} to="/profile">My Quest</ActiveNavButton>
                  ) : (
                    <NavButton startIcon={<AccountCircleIcon />} component={Link} to="/profile">My Quest</NavButton>
                  )}

                  <Tooltip title={userData?.username || 'Profile'}>
                    <UserAvatar onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                      {userData?.username?.charAt(0).toUpperCase() || 'U'}
                    </UserAvatar>
                  </Tooltip>

                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
                    PaperProps={{ sx: { backgroundColor: 'rgba(10,10,46,0.95)', backdropFilter: 'blur(10px)' } }}
                  >
                    <MenuItem component={Link} to="/profile">Profile</MenuItem>
                    <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                    <MenuItem onClick={handleLogout}>Exit Adventure</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <NavButton variant="outlined" color="secondary" startIcon={<RocketLaunchIcon />} component={Link} to="/login">Begin Quest</NavButton>
                  <NavButton variant="contained" color="primary" startIcon={<PersonAddIcon />} component={Link} to="/register">Join Adventure</NavButton>
                </>
              )}
            </Box>
          )}

          {/* Mobile menu icon */}
          {isMobile && (
            <IconButton color="inherit" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} sx={{ ml: 'auto' }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile menu dropdown */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={() => setMobileMenuAnchor(null)}
            PaperProps={{ sx: { width: '100%', maxWidth: 300, backgroundColor: 'rgba(10,10,46,0.95)', backdropFilter: 'blur(10px)' } }}
          >
            {isLoggedIn ? (
              <>…mobile logged‑in items…</>
            ) : (
              <>…mobile logged‑out items…</>
            )}
          </Menu>

        </Toolbar>
      </Container>
    </NavbarContainer>
  );
}
