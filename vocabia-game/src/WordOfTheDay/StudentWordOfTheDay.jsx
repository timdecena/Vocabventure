import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Avatar
} from "@mui/material";
import api from "../api/api";

// Helper functions for localStorage
const loadState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
};

export default function StudentWordOfTheDay() {
  const [definition, setDefinition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hasPlayed, setHasPlayed] = useState(loadState("wotd_hasPlayed", false));
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [gold, setGold] = useState(loadState("wotd_gold", null));
  const [streak, setStreak] = useState(loadState("wotd_streak", 0));
  const [lastPlayedDate, setLastPlayedDate] = useState(loadState("wotd_lastPlayedDate", null));

  const fetchWordData = async () => {
    try {
      const res = await api.get("/game/word-of-the-day");
      setDefinition(res.data.definition);
      
      // Check if a new day has passed
      const today = new Date().toDateString();
      if (lastPlayedDate !== today) {
        setHasPlayed(false);
        saveState("wotd_hasPlayed", false);
        setLastPlayedDate(today);
        saveState("wotd_lastPlayedDate", today);
      } else {
        setHasPlayed(res.data.hasPlayed || hasPlayed);
      }
      
      setImageUrl(`http://localhost:8080${res.data.imageUrl}`);
      
      // Only update gold/streak if they're different from server
      if (res.data.gold !== undefined && res.data.gold !== gold) {
        setGold(res.data.gold);
        saveState("wotd_gold", res.data.gold);
      }
      if (res.data.streak !== undefined && res.data.streak !== streak) {
        setStreak(res.data.streak);
        saveState("wotd_streak", res.data.streak);
      }
    } catch {
      setResult("❌ Failed to load word");
    }
  };

  useEffect(() => {
    fetchWordData();
    
    // Check for new day periodically
    const checkNewDay = () => {
      const today = new Date().toDateString();
      if (lastPlayedDate !== today) {
        setHasPlayed(false);
        saveState("wotd_hasPlayed", false);
        setLastPlayedDate(today);
        saveState("wotd_lastPlayedDate", today);
      }
    };
    
    // Check immediately
    checkNewDay();
    
    // Set up interval to check every hour
    const interval = setInterval(checkNewDay, 3600000);
    return () => clearInterval(interval);
  }, [lastPlayedDate]);

  const submitGuess = async () => {
    try {
      const res = await api.post("/game/word-of-the-day/submit", { guess });
      const today = new Date().toDateString();
      
      setResult(res.data.correct ? "✅ Correct!" : "❌ Incorrect");
      setHasPlayed(true);
      saveState("wotd_hasPlayed", true);
      setLastPlayedDate(today);
      saveState("wotd_lastPlayedDate", today);
      
      if (res.data.gold !== undefined) {
        setGold(res.data.gold);
        saveState("wotd_gold", res.data.gold);
      }
      if (res.data.streak !== undefined) {
        setStreak(res.data.streak);
        saveState("wotd_streak", res.data.streak);
      }
    } catch {
      setResult("❌ Already played or error occurred");
    }
  };

  const handleRetry = async () => {
    try {
      const res = await api.post("/game/word-of-the-day/retry");
      setHasPlayed(false);
      saveState("wotd_hasPlayed", false);
      setGuess("");
      setResult("");
      if (res.data.gold !== undefined) {
        setGold(res.data.gold);
        saveState("wotd_gold", res.data.gold);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unknown error";
      if (message.includes("Not enough gold")) {
        setResult("⚠️ You need at least 10 gold to retry.");
      } else {
        setResult("⚠️ Retry failed: " + message);
      }
    }
  };

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
          maxWidth: "800px",
          background: "#23232b",
          border: "2px solid #00eaff",
          borderRadius: "16px",
          boxShadow: "0 0 32px #00eaff80, 0 0 64px #ff00c880",
          p: "24px",
          position: "relative"
        }}
      >
        {/* Header with title and streak */}
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
            WORD OF THE DAY
          </Typography>
          
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
          >
            {streak > 0 && (
              <Box
                sx={{
                  background: "#18181b",
                  border: "2px solid #ff00c8",
                  borderRadius: "8px",
                  p: "8px 12px",
                  boxShadow: "0 0 8px #ff00c880"
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#ff00c8",
                    fontSize: "0.9rem",
                    textShadow: "0 0 4px #ff00c8"
                  }}
                >
                  🔥 STREAK: {streak}
                </Typography>
              </Box>
            )}
            
            {gold !== null && (
              <Box
                sx={{
                  background: "#18181b",
                  border: "2px solid #ffb86c",
                  borderRadius: "8px",
                  p: "8px 12px",
                  boxShadow: "0 0 8px #ffb86c80"
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#ffb86c",
                    fontSize: "0.9rem",
                    textShadow: "0 0 4px #ffb86c"
                  }}
                >
                  🪙 GOLD: {gold}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Definition section */}
        <CardContent
          sx={{
            background: "#18181b",
            border: "1px solid #00eaff",
            borderRadius: "12px",
            p: "16px",
            mb: "24px",
            boxShadow: "0 0 16px #00eaff40"
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P', cursive",
              color: "#00eaff",
              fontSize: "1rem",
              mb: "8px"
            }}
          >
            DEFINITION:
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P', cursive",
              color: "#fff",
              fontSize: "0.9rem",
              lineHeight: "1.5"
            }}
          >
            {definition}
          </Typography>
        </CardContent>

        {/* Image display */}
        {imageUrl && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: "24px"
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt="Word Visual"
              sx={{
                maxWidth: "100%",
                maxHeight: "300px",
                border: "2px solid #ff00c8",
                borderRadius: "12px",
                boxShadow: "0 0 16px #ff00c880"
              }}
            />
          </Box>
        )}

        {/* Game interaction area */}
        {hasPlayed ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}
          >
            {result === "✅ Correct!" ? (
              <>
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#2e7d32",
                    fontSize: "1.2rem",
                    textShadow: "0 0 8px #2e7d32",
                    textAlign: "center",
                    mb: "16px"
                  }}
                >
                  🎉 CONGRATULATIONS! 🎉
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#00eaff",
                    fontSize: "1.5rem",
                    textTransform: "uppercase",
                    textShadow: "0 0 8px #00eaff",
                    textAlign: "center"
                  }}
                >
                  {guess}
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P', cursive",
                    color: "#ff1744",
                    fontSize: "1rem",
                    textShadow: "0 0 8px #ff1744",
                    textAlign: "center"
                  }}
                >
                  ❌ YOU'VE ALREADY PLAYED TODAY!
                </Typography>
                <Button
                  onClick={handleRetry}
                  sx={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.8rem",
                    color: "#ffb86c",
                    background: "#18181b",
                    border: "2px solid #ffb86c",
                    borderRadius: "8px",
                    p: "8px 24px",
                    boxShadow: "0 0 8px #ffb86c80",
                    "&:hover": {
                      background: "#ffb86c22",
                      boxShadow: "0 0 16px #ffb86c"
                    }
                  }}
                >
                  🔁 USE 10 GOLD TO TRY AGAIN
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <TextField
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess..."
              variant="outlined"
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#fff",
                  background: "#18181b",
                  border: "2px solid #00eaff",
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#ff00c8"
                  },
                  "&.Mui-focused": {
                    borderColor: "#ff00c8",
                    boxShadow: "0 0 16px #ff00c8"
                  }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#00eaff"
                }
              }}
            />
            <Button
              onClick={submitGuess}
              disabled={!guess.trim()}
              sx={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "0.9rem",
                color: "#00eaff",
                background: "#18181b",
                border: "2px solid #00eaff",
                borderRadius: "8px",
                p: "12px 24px",
                boxShadow: "0 0 8px #00eaff80",
                "&:hover": {
                  background: "#00eaff22",
                  borderColor: "#ff00c8",
                  boxShadow: "0 0 16px #ff00c8"
                },
                "&:disabled": {
                  opacity: 0.5
                }
              }}
            >
              SUBMIT GUESS
            </Button>
          </Box>
        )}

        {/* Result display */}
        {result && (
          <Box
            sx={{
              mt: "24px",
              p: "12px",
              background: "#18181b",
              border: "2px solid",
              borderColor: result.includes("✅") ? "#2e7d32" : "#ff1744",
              borderRadius: "8px",
              textAlign: "center"
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Press Start 2P', cursive",
                color: result.includes("✅") ? "#2e7d32" : "#ff1744",
                fontSize: "1rem",
                textShadow: `0 0 8px ${result.includes("✅") ? "#2e7d32" : "#ff1744"}`
              }}
            >
              {result}
            </Typography>
          </Box>
        )}
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