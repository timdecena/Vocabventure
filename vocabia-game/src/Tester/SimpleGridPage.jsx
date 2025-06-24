import React from 'react';
import { Box } from '@mui/material';

const SimpleGridPage = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gridTemplateRows: 'repeat(5, 1fr)',
      gap: 2,
      height: '100%',      // Use 100%, not 100vh
      width: '100%',       // Use 100%, not 100vw
      background: '#0e1621', // Match site bg
      p: 3,
      boxSizing: 'border-box',
      overflow: 'auto',   // This enables scrolling
    }}
  >
    <Box
      sx={{
        gridColumn: 'span 5',
        gridRow: 'span 5',
        bgcolor: '#90caf9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        borderRadius: 2,
        fontWeight: 'bold',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      1
    </Box>
  </Box>
);

export default SimpleGridPage;
