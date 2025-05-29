import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Button, Typography, Box, List, ListItem, ListItemText } from "@mui/material";

export default function PuzzleManagementPage() {
  const [puzzles, setPuzzles] = useState([]);
  useEffect(() => {
    api.get("/puzzles/4pics1word").then(res => setPuzzles(res.data));
  }, []);
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Puzzle Management</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }}>Add New Puzzle</Button>
      <List>
        {puzzles.map(puzzle => (
          <ListItem key={puzzle.id}>
            <ListItemText
              primary={`Answer: ${puzzle.answer}`}
              secondary={puzzle.hint}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
