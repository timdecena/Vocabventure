import React, { useState, useEffect } from 'react';
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          backgroundColor: '#f9f9f9',
          backdropFilter: 'saturate(180%) blur(6px)',
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
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {t('Teacher Portal')}
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
              color={location.pathname.includes('/teacher-home') ? 'primary' : 'inherit'}
            >
              {t('Home')}
            </Button>

            <Button
              component={Link}
              to="/teacher/classes"
              className="classes-link"
              color={location.pathname.includes('/teacher/classes') ? 'primary' : 'inherit'}
            >
              {t('My Classes')}
            </Button>

            <Button
              component={Link}
              to="/teacher/analytics"
              className="analytics-link"
              color={location.pathname.includes('/teacher/analytics') ? 'primary' : 'inherit'}
            >
              {t('Student Results')}
            </Button>

            <Tooltip title="Take a quick tour of the teacher portal">
              <IconButton color="primary" onClick={() => setRunTour(true)}>
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <Button
              onClick={handleLogout}
              className="logout-button"
              variant="contained"
              color="primary"
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: 999,
                px: 2,
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
          <Toolbar />
          <Divider />
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
        <Box sx={{ py: 3, px: { xs: 1.5, md: 3 } }}>{children}</Box>
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
