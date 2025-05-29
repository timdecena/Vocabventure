import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get("/user/leaderboard").then(res => setUsers(res.data));
  }, []);
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Leaderboard</Typography>
      <List>
        {users.map((u, i) => (
          <ListItem key={i}>
            <ListItemText primary={`${u.username} - Level: ${u.level} - XP: ${u.exp}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
