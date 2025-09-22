import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { t } from '../utils/i18n';

export default function LoadingState({ fullHeight = false, message = t('Loading...'), size = 48 }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '50vh' : 160,
        py: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

LoadingState.propTypes = {
  fullHeight: PropTypes.bool,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.number,
};
