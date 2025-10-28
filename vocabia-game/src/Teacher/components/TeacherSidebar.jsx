import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import ClassIcon from '@mui/icons-material/Class';
import { useLocation, useNavigate } from 'react-router-dom';
import { t } from '../utils/i18n';

export default function TeacherSidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: <ClassIcon />, label: t('My Classes'), path: '/teacher/classes' },
    { icon: <AddCircleOutlineIcon />, label: t('Create Class'), path: '/teacher/classes/create' },
    { icon: <InsightsIcon />, label: t('Student Results'), path: '/teacher/analytics' },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SchoolIcon color="primary" />
        {!collapsed && (
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Teacher Portal')}
          </Typography>
        )}
      </Box>
      <Divider />
      <List sx={{ p: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
