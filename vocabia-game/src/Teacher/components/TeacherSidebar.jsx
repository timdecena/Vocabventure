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
import InsightsIcon from '@mui/icons-material/Insights';
import ClassIcon from '@mui/icons-material/Class';
import { t } from '../utils/i18n';

export default function TeacherSidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: <SchoolIcon />, label: t('My Classes'), path: '/teacher/classes' },
    { icon: <AddCircleOutlineIcon />, label: t('Create Class'), path: '/teacher/classes/create' },
    { icon: <EditNoteIcon />, label: t('Create Level'), path: '/teacher/spelling/create' },
    { icon: <InsightsIcon />, label: t('Analytics'), path: '/teacher/analytics' },
    { icon: <EditNoteIcon />, label: t('Create 4Pics1Word Level'), path: '/teacher/fpow/create' },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ClassIcon color="primary" />
        {!collapsed && (
          <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
            {t('Teacher Portal')}
          </Typography>
        )}
      </Box>
      <Divider />
      <List sx={{ p: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const button = (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: collapsed ? 1.25 : 1.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
                transition: (t) => t.transitions.create(['background-color', 'transform'], { duration: 180 }),
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateX(2px)'
                },
                ...(active && {
                  backgroundColor: 'action.selected',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 4,
                    top: 6,
                    bottom: 6,
                    width: 3,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                  },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: active ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { fontWeight: active ? 600 : 500 } }}
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
