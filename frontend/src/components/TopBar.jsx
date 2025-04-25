// File: src/components/TopBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Avatar, Typography } from '@mui/material';

// A clickable badge that navigates to the profile page
const UserBadge = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  gap: theme.spacing(1),
}));

// Styled avatar matching the profile page style
const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 40,
  height: 40,
  border: `2px solid ${theme.palette.secondary.main}`,
  boxShadow: '0 0 10px rgba(0, 255, 170, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 15px rgba(0, 255, 170, 0.5)',
  },
}));

export default function TopBar() {
  // Pull username from localStorage (fallback to Guest)
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = userData.username?.charAt(0).toUpperCase() || '';
  const username = userData.username || 'Guest';

  return (
    <div
      className="topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        height: '70px'
      }}
    >
      {/* Clicking this badge will navigate to /profile */}
      <UserBadge to="/profile">
        <UserAvatar>{initial}</UserAvatar>
        <Typography
          variant="body1"
          noWrap
          sx={{
            color: '#fff',
            lineHeight: 1.2,
            fontSize: '1.3rem',
            fontWeight: 600,
            pb: '2px'
          }}
        >
          {username}
        </Typography>
      </UserBadge>
    </div>
  );
}

