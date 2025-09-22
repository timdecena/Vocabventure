import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Divider,
  useMediaQuery,
  Button,
  Stack,
  Avatar,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import TeacherSidebar from './TeacherSidebar';
import { t } from '../utils/i18n';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const drawerWidth = 240;
const collapsedWidth = 72;

export default function TeacherLayout({ children }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleMobileDrawer = () => setMobileOpen((prev) => !prev);
  const toggleDesktopCollapse = () => setCollapsed((prev) => !prev);
  const handleLogout = () => {
    authService.clearAuth();
    window.location.href = '/';
  };

  const drawer = (
    <Box role="navigation" aria-label={t('Teacher navigation')} sx={{ height: '100%' }}>
      <TeacherSidebar collapsed={collapsed} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          background: (t) => `linear-gradient(180deg, ${t.palette.background.paper} 0%, rgba(255,255,255,0.92) 100%)`,
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <Toolbar>
          {/* Left: menu toggle + title */}
          {mdUp ? (
            <IconButton
              color="inherit"
              aria-label={t('toggle sidebar')}
              edge="start"
              onClick={toggleDesktopCollapse}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label={t('open drawer')}
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 700 }}>
            {t('Teacher Portal')}
          </Typography>

          {/* Center: nav links (desktop) */}
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {[
              { label: t('Home'), to: '/teacher-home' },
              { label: t('Classes'), to: '/teacher/classes' },
              { label: t('Students'), to: '/teacher/students' },
              { label: t('Assignments'), to: '/teacher/assignments' },
            ].map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  color={active ? 'primary' : 'inherit'}
                  sx={{
                    fontWeight: 500,
                    px: 1.5,
                    borderRadius: 2,
                    textDecoration: 'none',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
            <Button
              onClick={handleLogout}
              variant="contained"
              color="primary"
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: 999,
                boxShadow: (t) => `0 2px 6px ${t.palette.primary.main}22`,
                px: 2,
              }}
            >
              {t('Logout')}
            </Button>
          </Stack>
          {/* Right (mobile): avatar + quick logout */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'primary.contrastText' }}>T</Avatar>
            <IconButton aria-label={t('Logout')} onClick={handleLogout} color="primary" size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {mdUp && (
        <Drawer
          variant="permanent"
          PaperProps={{
            sx: {
              position: 'fixed',
              whiteSpace: 'nowrap',
              width: collapsed ? `${collapsedWidth}px` : `${drawerWidth}px`,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              borderRight: (t) => `1px solid ${t.palette.divider}`,
            },
          }}
        >
          <Toolbar />
          <Divider />
          {drawer}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {!mdUp && (
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

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: mdUp ? `${collapsed ? collapsedWidth : drawerWidth}px` : 0,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
