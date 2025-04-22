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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  
  const isLoggedIn = localStorage.getItem("token") !== null;
  const [userData, setUserData] = useState(null);

  // Determine dashboard path based on user role
  console.log(userData); // Check the content of userData
  const dashboardPath = userData?.role?.toLowerCase() === 'teacher' 
  ? '/teacher-dashboard' 
  : '/student-dashboard';


  useEffect(() => {
    // Close menus when route changes
    setMenuOpen(false);
    setUserMenuAnchor(null);
    setMobileMenuAnchor(null);
    
    // Get user data from localStorage if logged in
    if (isLoggedIn) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          setUserData(JSON.parse(userStr));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [location.pathname, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserData(null);
    setUserMenuAnchor(null);
    navigate("/login");
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavbarContainer position="fixed" sx={{ width: '100%', zIndex: 1100 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ 
          height: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, sm: 4 }
        }}>
          {/* Left side - Logo */}
          <Box component={Link} to="/" sx={{ 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center',
            minWidth: 180
          }}>
            <LogoText variant="h5">
              Vocab<span>Venture</span>
            </LogoText>
          </Box>

          {/* Right side - Navigation */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              ml: 'auto'
            }}>
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
                    <NavButton 
                      startIcon={<HomeIcon />} 
                      component={Link} 
                      to="/"
                      color="inherit"
                    >
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

                  {isActive(dashboardPath) ? (
                    <ActiveNavButton 
                      startIcon={<RocketLaunchIcon />} 
                      component={Link} 
                      to={dashboardPath}
                      color="inherit"
                    >
                      Dashboard
                    </ActiveNavButton>
                  ) : (
                    <NavButton 
                      startIcon={<RocketLaunchIcon />} 
                      component={Link} 
                      to={dashboardPath}
                      color="inherit"
                    >
                      Dashboard
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
                    <UserAvatar onClick={handleUserMenuOpen}>
                      {userData?.username?.charAt(0).toUpperCase() || "U"}
                    </UserAvatar>
                  </Tooltip>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: 'rgba(10, 10, 46, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        mt: 1.5,
                        '& .MuiMenuItem-root': {
                          color: 'white',
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                      <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Profile
                    </MenuItem>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
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
                      borderRadius: 8,
                      borderColor: 'rgba(0, 255, 170, 0.5)',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'rgba(0, 255, 170, 0.1)',
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
                      borderRadius: 8,
                      boxShadow: '0 0 10px rgba(0, 255, 170, 0.3)',
                      '&:hover': {
                        boxShadow: '0 0 15px rgba(0, 255, 170, 0.5)',
                      },
                    }}
                  >
                    Join Adventure
                  </NavButton>
                </>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton 
              edge="end" 
              color="inherit" 
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ color: 'secondary.main' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                width: '100%',
                maxWidth: '300px',
                backgroundColor: 'rgba(10, 10, 46, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  color: 'white',
                  py: 1.5,
                },
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
                      {userData?.username?.charAt(0).toUpperCase() || "U"}
                    </UserAvatar>
                    <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                      {userData.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {userData.email}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <MenuItem 
                  component={Link} 
                  to="/" 
                  onClick={handleMobileMenuClose}
                  sx={{ backgroundColor: isActive('/') ? 'rgba(0, 255, 170, 0.1)' : 'transparent' }}
                >
                  <HomeIcon sx={{ mr: 1.5, fontSize: 20, color: isActive('/') ? 'secondary.main' : 'inherit' }} />
                  Home
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/missions" 
                  onClick={handleMobileMenuClose}
                  sx={{ backgroundColor: isActive('/missions') ? 'rgba(0, 255, 170, 0.1)' : 'transparent' }}
                >
                  <ExploreIcon sx={{ mr: 1.5, fontSize: 20, color: isActive('/missions') ? 'secondary.main' : 'inherit' }} />
                  Missions
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to={dashboardPath} 
                  onClick={handleMobileMenuClose}
                  sx={{ backgroundColor: isActive(dashboardPath) ? 'rgba(0, 255, 170, 0.1)' : 'transparent' }}
                >
                  <RocketLaunchIcon sx={{ mr: 1.5, fontSize: 20, color: isActive(dashboardPath) ? 'secondary.main' : 'inherit' }} />
                  Dashboard
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/profile" 
                  onClick={handleMobileMenuClose}
                  sx={{ backgroundColor: isActive('/profile') ? 'rgba(0, 255, 170, 0.1)' : 'transparent' }}
                >
                  <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: isActive('/profile') ? 'secondary.main' : 'inherit' }} />
                  My Quest
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Exit Adventure
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem 
                  component={Link} 
                  to="/login" 
                  onClick={handleMobileMenuClose}
                  sx={{ backgroundColor: isActive('/login') ? 'rgba(0, 255, 170, 0.1)' : 'transparent' }}
                >
                  <RocketLaunchIcon sx={{ mr: 1.5, fontSize: 20, color: isActive('/login') ? 'secondary.main' : 'inherit' }} />
                  Begin Quest
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/register" 
                  onClick={handleMobileMenuClose}
                  sx={{ backgroundColor: isActive('/register') ? 'rgba(0, 255, 170, 0.1)' : 'transparent' }}
                >
                  <PersonAddIcon sx={{ mr: 1.5, fontSize: 20, color: isActive('/register') ? 'secondary.main' : 'inherit' }} />
                  Join Adventure
                </MenuItem>
              </>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </NavbarContainer>
  );
};

export default Navbar;