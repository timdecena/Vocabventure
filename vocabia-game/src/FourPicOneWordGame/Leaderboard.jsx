// Leaderboard.jsx (Simple Example)
import React, { useEffect, useState } from "react";
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import axios from "axios";

export default function Leaderboard({ category }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`http://localhost:8080/api/game/leaderboard?gameType=FOUR_PIC_ONE_WORD&category=${category || ""}`)
      .then(res => setLeaders(res.data))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, [category]);
  if (loading) return <CircularProgress />;
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" sx={{ color: "#00ffaa", mb: 2 }}>
        <EmojiEventsIcon sx={{ mr: 1 }} />
        Leaderboard
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>XP</TableCell>
            <TableCell>Streak</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaders.map((user, idx) => (
            <TableRow key={user.userId}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.exp}</TableCell>
              <TableCell>{user.streak}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
