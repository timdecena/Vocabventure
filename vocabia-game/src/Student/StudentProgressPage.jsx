import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Box, Typography, Paper } from "@mui/material";

export default function StudentProgressPage() {
  const [progress, setProgress] = useState(null);
  useEffect(() => {
    api.get("/user/progress").then(res => setProgress(res.data));
  }, []);
  if (!progress) return <Typography>Loading...</Typography>;
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>My Progress</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>XP: {progress.exp}</Typography>
        <Typography>Level: {progress.level}</Typography>
        <Typography>Completed Levels: {progress.completedLevels}</Typography>
        <Typography>Streak: {progress.currentStreak}</Typography>
        {/* Add more fields as needed */}
      </Paper>
    </Box>
  );
}
