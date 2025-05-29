import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Button, Typography, Box, List, ListItem, ListItemText } from "@mui/material";

export default function LevelManagementPage() {
  const [levels, setLevels] = useState([]);
  useEffect(() => {
    api.get("/levels").then(res => setLevels(res.data));
  }, []);
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Level Management</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }}>Create New Level</Button>
      <List>
        {levels.map(level => (
          <ListItem key={level.id}>
            <ListItemText
              primary={`${level.name} (No. ${level.number})`}
              secondary={level.description}
            />
            {/* Add edit/delete buttons as needed */}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
