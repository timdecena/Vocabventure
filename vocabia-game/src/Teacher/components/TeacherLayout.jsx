import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Divider,
  Button,
  Box,
  Stack,
  Avatar,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import Joyride from 'react-joyride';
import TeacherSidebar from './TeacherSidebar';
import authService from '../../services/authService';
import { t } from '../utils/i18n';
import { colors } from './DesignSystem';

const drawerWidth = 240;
const collapsedWidth = 72;

export default function TeacherLayout({ children }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const toggleMobileDrawer = () => setMobileOpen((prev) => !prev);
  const toggleDesktopCollapse = () => setCollapsed((prev) => !prev);

  const handleLogout = () => {
    authService.clearAuth();
    window.location.href = '/';
  };

  // 🔹 Joyride tutorial steps
  const steps = [
    {
      target: '.sidebar-nav',
      content: 'This is your main menu. You can find your classes, create new ones, and view student results here.',
      placement: 'right',
    },
    {
      target: '.home-link',
      content: 'Click “Home” anytime to go back to your main dashboard.',
      placement: 'bottom',
    },
    {
      target: '.classes-link',
      content: 'View or manage your classes here.',
      placement: 'bottom',
    },
    {
      target: '.analytics-link',
      content: 'Check student progress and reports in “Student Results”.',
      placement: 'bottom',
    },
    {
      target: '.logout-button',
      content: 'When you’re done, click here to safely log out.',
      placement: 'left',
    },
  ];

  // Drawer contents
  const drawer = (
    <Box
      role="navigation"
      aria-label={t('Teacher navigation')}
      sx={{ height: '100%', p: 0 }}
    >
      <TeacherSidebar collapsed={collapsed} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.mainBg }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={t('toggle sidebar')}
            edge="start"
            onClick={mdUp ? toggleDesktopCollapse : toggleMobileDrawer}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{ fontWeight: 700, color: colors.text }}
          >
            {t('VocabVenture')}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Nav Buttons */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
            }}
          >
            <Button
              component={Link}
              to="/teacher-home"
              className="home-link"
              sx={{
                color: location.pathname.includes('/teacher-home') ? colors.primary : colors.text,
                fontWeight: location.pathname.includes('/teacher-home') ? 600 : 500,
                '&:hover': { bgcolor: `${colors.primary}10` }
              }}
            >
              {t('Home')}
            </Button>

            <Button
              component={Link}
              to="/teacher/classes"
              className="classes-link"
              sx={{
                color: location.pathname.includes('/teacher/classes') ? colors.primary : colors.text,
                fontWeight: location.pathname.includes('/teacher/classes') ? 600 : 500,
                '&:hover': { bgcolor: `${colors.primary}10` }
              }}
            >
              {t('My Classes')}
            </Button>

            <Button
              component={Link}
              to="/teacher/analytics"
              className="analytics-link"
              sx={{
                color: location.pathname.includes('/teacher/analytics') ? colors.primary : colors.text,
                fontWeight: location.pathname.includes('/teacher/analytics') ? 600 : 500,
                '&:hover': { bgcolor: `${colors.primary}10` }
              }}
            >
              {t('Analytics')}
            </Button>

            <Tooltip title="Take a quick tour">
              <IconButton 
                sx={{ color: colors.textLight }}
                onClick={() => setRunTour(true)}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <Button
              onClick={handleLogout}
              className="logout-button"
              variant="contained"
              startIcon={<LogoutIcon />}
              sx={{
                bgcolor: colors.primary,
                color: '#FFFFFF',
                borderRadius: '6px',
                px: 2.5,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: colors.primaryDark,
                  boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
                }
              }}
            >
              {t('Logout')}
            </Button>
          </Stack>

          {/* Mobile Toolbar */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              ml: 'auto',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Tooltip title="Help Tour">
              <IconButton color="primary" onClick={() => setRunTour(true)}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              T
            </Avatar>
            <IconButton
              aria-label={t('Logout')}
              onClick={handleLogout}
              color="primary"
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawers */}
      {mdUp ? (
        <Drawer
          variant="permanent"
          PaperProps={{
            className: 'sidebar-nav',
            sx: {
              position: 'fixed',
              width: collapsed ? collapsedWidth : drawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                duration: theme.transitions.duration.shorter,
              }),
              borderRight: (t) => `1px solid ${t.palette.divider}`,
            },
          }}
        >
          {/* Removed Toolbar spacer to align sidebar header flush to top */}
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileDrawer}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: drawerWidth } }}
        >
          <Toolbar />
          <Divider />
          {drawer}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: mdUp ? `${collapsed ? collapsedWidth : drawerWidth}px` : 0,
          transition: theme.transitions.create('margin-left', {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ py: 0, px: 0 }}>{children}</Box>
      </Box>

      {/* Joyride Tutorial */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        styles={{
          options: {
            zIndex: 99999,
            primaryColor: theme.palette.primary.main,
            textColor: '#333',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            beaconSize: 10,
          },
        }}
        callback={(data) => {
          if (['finished', 'skipped'].includes(data.status)) setRunTour(false);
        }}
      />
    </Box>
  );
}
