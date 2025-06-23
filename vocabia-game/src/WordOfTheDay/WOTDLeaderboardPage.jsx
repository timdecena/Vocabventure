import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import api from "../api/api";

export default function WOTDLeaderboardPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get("/api/leaderboard/wotd")
      .then(res => setEntries(res.data))
      .catch(err => {
        console.error("Failed to load leaderboard:", err);
        alert("Failed to load leaderboard");
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        pt: "80px",
        pb: "40px",
        px: "20px",
        background: "linear-gradient(135deg, #18181b 0%, #23232b 100%)"
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "1000px",
          background: "#23232b",
          border: "2px solid #00eaff",
          borderRadius: "16px",
          boxShadow: "0 0 32px #00eaff80, 0 0 64px #ff00c880",
          p: "24px",
          position: "relative"
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "24px"
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Press Start 2P', cursive",
              color: "#00eaff",
              textShadow: "0 0 8px #00eaff",
              fontSize: "1.8rem"
            }}
          >
            🏆 WORD OF THE DAY LEADERBOARD
          </Typography>
          
          <Avatar
            src="/fantasy/trophy_avatar.png"
            sx={{
              width: 60,
              height: 60,
              border: "2px solid #ffb86c",
              boxShadow: "0 0 16px #ffb86c"
            }}
          />
        </Box>

        {/* Leaderboard Table */}
        <TableContainer 
          component={Paper}
          sx={{
            background: "#18181b",
            border: "2px solid #ff00c8",
            borderRadius: "12px",
            boxShadow: "0 0 16px #ff00c880",
            mb: "24px"
          }}
        >
          <Table aria-label="leaderboard table">
            <TableHead>
              <TableRow sx={{ borderBottom: "2px solid #00eaff" }}>
                <TableCell sx={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#00eaff",
                  fontSize: "0.8rem",
                  borderRight: "1px solid #00eaff80"
                }}>RANK</TableCell>
                <TableCell sx={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#00eaff",
                  fontSize: "0.8rem",
                  borderRight: "1px solid #00eaff80"
                }}>STUDENT</TableCell>
                <TableCell sx={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#00eaff",
                  fontSize: "0.8rem",
                  borderRight: "1px solid #00eaff80"
                }}>CORRECT</TableCell>
                <TableCell sx={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#00eaff",
                  fontSize: "0.8rem",
                  borderRight: "1px solid #00eaff80"
                }}>PLAYED</TableCell>
                <TableCell sx={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#00eaff",
                  fontSize: "0.8rem"
                }}>ACCURACY</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow 
                  key={entry.studentId}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { background: "#23232b" }
                  }}
                >
                  <TableCell sx={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    color: getRankColor(index),
                    fontSize: "0.7rem",
                    borderRight: "1px solid #00eaff80"
                  }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""} {index + 1}
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#fff",
                    fontSize: "0.7rem",
                    borderRight: "1px solid #00eaff80"
                  }}>
                    {entry.studentName}
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#2e7d32",
                    fontSize: "0.7rem",
                    borderRight: "1px solid #00eaff80"
                  }}>
                    {entry.correctAnswers}
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#ffb86c",
                    fontSize: "0.7rem",
                    borderRight: "1px solid #00eaff80"
                  }}>
                    {entry.totalPlayed}
                  </TableCell>
                  <TableCell sx={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    color: getAccuracyColor(entry.accuracyPercent),
                    fontSize: "0.7rem"
                  }}>
                    {entry.accuracyPercent}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Legend */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Box sx={{ width: "12px", height: "12px", background: "#ffb86c", borderRadius: "2px" }} />
            <Typography sx={{ fontFamily: "'Press Start 2P', cursive", color: "#ffb86c", fontSize: "0.6rem" }}>
              Played Count
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Box sx={{ width: "12px", height: "12px", background: "#2e7d32", borderRadius: "2px" }} />
            <Typography sx={{ fontFamily: "'Press Start 2P', cursive", color: "#2e7d32", fontSize: "0.6rem" }}>
              Correct Answers
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Box sx={{ width: "12px", height: "12px", background: "#00eaff", borderRadius: "2px" }} />
            <Typography sx={{ fontFamily: "'Press Start 2P', cursive", color: "#00eaff", fontSize: "0.6rem" }}>
              Accuracy
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Game mascot/character */}
      <Box
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100
        }}
      >
        <Avatar
          src="/fantasy/wizard_avatar.png"
          sx={{
            width: 120,
            height: 120,
            border: "2px solid #ff00c8",
            boxShadow: "0 0 16px #ff00c8"
          }}
        />
      </Box>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          body {
            background: #18181b;
            font-family: 'Press Start 2P', cursive;
            color: #fff;
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </Box>
  );
}

// Helper functions for styling
function getRankColor(index) {
  if (index === 0) return "#ffd700"; // Gold
  if (index === 1) return "#c0c0c0"; // Silver
  if (index === 2) return "#cd7f32"; // Bronze
  return "#00eaff"; // Default blue
}

function getAccuracyColor(percent) {
  if (percent >= 80) return "#2e7d32"; // Green for high accuracy
  if (percent >= 50) return "#ffb86c"; // Orange for medium accuracy
  return "#ff1744"; // Red for low accuracy
}