import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const JoinClassDialog = ({ open, onClose, classData }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Class Joined</DialogTitle>
    <DialogContent>
      <Typography>You successfully joined the class:</Typography>
      <Typography variant="h6" color="primary">{classData.className}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>Class Code: {classData.joinCode}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} autoFocus>Close</Button>
    </DialogActions>
  </Dialog>
);

export default JoinClassDialog;
