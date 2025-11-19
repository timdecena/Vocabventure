import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ClassIcon from '@mui/icons-material/Class';
import HomeIcon from '@mui/icons-material/Home';
import ViewListIcon from '@mui/icons-material/ViewList';
import { t } from '../utils/i18n';
import { colors } from './DesignSystem';

export default function TeacherSidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: <HomeIcon />, label: t('Dashboard'), path: '/teacher-home' },
    { icon: <SchoolIcon />, label: t('My Classes'), path: '/teacher/classes' },
    { icon: <AddCircleOutlineIcon />, label: t('Create Class'), path: '/teacher/classes/create' },
    { icon: <EditNoteIcon />, label: t('Create Level'), path: '/teacher/spelling/create' },
    { icon: <EditNoteIcon />, label: t('Create 4Pics1Word'), path: '/teacher/fpow/create' },
    { icon: <ViewListIcon />, label: t('Manage 4Pics1Word'), path: '/teacher/fpow/manage' },
  ];

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: colors.sidebarBg 
    }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ClassIcon sx={{ color: colors.sidebarText, fontSize: 28 }} />
        {!collapsed && (
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ 
              color: colors.sidebarText,
              letterSpacing: 0.5 
            }}
          >
            {t('Teacher Portal')}
          </Typography>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List sx={{ p: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const button = (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                px: collapsed ? 1.25 : 2,
                py: 1.25,
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                ...(active && {
                  backgroundColor: colors.primary,
                  '&:hover': {
                    backgroundColor: colors.primaryDark,
                  },
                }),
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: collapsed ? 0 : 40, 
                color: active ? '#FFFFFF' : colors.sidebarText,
                opacity: active ? 1 : 0.8
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ 
                    sx: { 
                      fontWeight: active ? 600 : 500,
                      color: active ? '#FFFFFF' : colors.sidebarText,
                      fontSize: '0.95rem'
                    } 
                  }}
                />
              )}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>
    </Box>
  );
}
