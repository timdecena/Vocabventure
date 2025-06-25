import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Tooltip,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import api from "../api/api";

const mascots = [
  <EmojiNatureIcon sx={{ color: "#ffe566", fontSize: 38 }} />,
  <SchoolIcon sx={{ color: "#a3f7ff", fontSize: 38 }} />,
  <GroupIcon sx={{ color: "#ffa3ea", fontSize: 38 }} />,
];

const StudentClassListPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/student/classes")
      .then((res) => setClasses(res.data))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #17172b 0%, #23233b 100%)",
        py: { xs: 3, md: 6 },
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 1150,
          mx: "auto",
          borderRadius: "28px",
          border: "3px solid #00eaff",
          boxShadow: "0 0 50px #00eaff44, 0 0 90px #ff00c855",
          background: "rgba(33,33,44, 0.98)",
          p: { xs: 2.5, md: 5 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            mb: 1,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                color: "#00eaff",
                fontFamily: "'Press Start 2P', monospace",
                textShadow: "0 0 18px #00eaff, 0 0 44px #ff00c8",
                fontWeight: 700,
                fontSize: { xs: 30, md: 38 },
              }}
            >
              My Classes
            </Typography>
            <Typography
              sx={{
                color: "#ff00c8",
                fontFamily: "'Press Start 2P', monospace",
                textShadow: "0 0 10px #ff00c8",
                fontSize: { xs: 13, md: 16 },
                fontWeight: 600,
                mt: 1,
              }}
            >
              Select a class to start your adventure!
            </Typography>
          </Box>
          <Tooltip title="Join New Class">
            <Button
              size="large"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate("/student/classes/join")}
              sx={{
                background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
                color: "#191924",
                fontWeight: 700,
                borderRadius: "14px",
                fontFamily: "'Press Start 2P', monospace",
                boxShadow: "0 0 12px #00eaff90",
                textTransform: "none",
                px: 3,
                fontSize: 15,
                "&:hover": {
                  background: "#ff00c8",
                  color: "#fff",
                  boxShadow: "0 0 22px #ff00c8",
                },
              }}
            >
              Join New Class
            </Button>
          </Tooltip>
        </Box>

        {/* Class Card List */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 3, md: 4 },
            mt: 4,
            minHeight: 340,
          }}
        >
          {loading ? (
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress color="info" size={62} />
            </Box>
          ) : classes.length === 0 ? (
            <Box
              sx={{
                gridColumn: "1 / -1",
                textAlign: "center",
                pt: 4,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  background: "#23232b",
                  boxShadow: "0 0 30px #00eaff90",
                }}
              >
                <HomeIcon sx={{ color: "#00eaff", fontSize: 56 }} />
              </Avatar>
              <Typography
                sx={{
                  color: "#00eaff",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 22,
                  textShadow: "0 0 12px #00eaff",
                  mb: 1,
                }}
              >
                No Classes Yet!
              </Typography>
              <Typography
                sx={{
                  color: "#fff",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 15,
                  textShadow: "0 0 6px #ff00c8",
                }}
              >
                Join a class to unlock your adventure!
              </Typography>
            </Box>
          ) : (
            classes.map((c, idx) => (
              <Paper
                elevation={8}
                key={c.id}
                sx={{
                  background: "#1a1a26",
                  border: "2.5px solid #00eaff",
                  borderRadius: "21px",
                  boxShadow: "0 0 34px #00eaff66",
                  position: "relative",
                  p: 3,
                  pt: 5,
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "transform 0.22s, box-shadow 0.22s, border-color 0.2s",
                  "&:hover": {
                    transform: "translateY(-7px) scale(1.04)",
                    boxShadow: "0 0 36px #ff00c8, 0 0 80px #00eaff",
                    borderColor: "#ff00c8",
                    zIndex: 2,
                  },
                }}
              >
                {/* Mascot Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -28,
                    left: 20,
                    background: "#181828",
                    borderRadius: "50%",
                    boxShadow: "0 0 14px #00eaff90, 0 0 22px #ff00c870",
                    width: 54,
                    height: 54,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {mascots[idx % mascots.length]}
                </Box>
                {/* Class Info */}
                <Typography
                  sx={{
                    color: "#00eaff",
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: "center",
                    textShadow: "0 0 8px #00eaff",
                    mb: 1.5,
                    mt: 0,
                    width: "95%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={c.name}
                >
                  {c.name}
                </Typography>
                <Typography
                  sx={{
                    color: "#fff",
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 13,
                    minHeight: 33,
                    textAlign: "center",
                    mb: 1,
                    px: 1,
                    wordBreak: "break-word",
                  }}
                >
                  {c.description || "No description provided."}
                </Typography>
                <Typography
                  sx={{
                    color: "#ff00c8",
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 12,
                    mb: 1.5,
                    textAlign: "center",
                  }}
                >
                  Teacher: {c.teacher?.firstName} {c.teacher?.lastName}
                </Typography>
                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 1.5, mt: "auto" }}>
                  <Button
                    size="small"
                    variant="contained"
                    component={Link}
                    to={`/student/classes/${c.id}`}
                    sx={{
                      background: "linear-gradient(90deg, #00eaff 60%, #ff00c8 100%)",
                      color: "#191924",
                      fontWeight: 700,
                      borderRadius: "8px",
                      fontFamily: "'Press Start 2P', monospace",
                      boxShadow: "0 0 8px #00eaff80",
                      textTransform: "none",
                      px: 2.5,
                      fontSize: 13,
                      "&:hover": {
                        background: "#ff00c8",
                        color: "#fff",
                      },
                    }}
                  >
                    Enter Class
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    to={`/student/classes/${c.id}/classmates`}
                    sx={{
                      color: "#00eaff",
                      borderColor: "#00eaff",
                      fontFamily: "'Press Start 2P', monospace",
                      borderRadius: "8px",
                      textTransform: "none",
                      px: 2.5,
                      fontSize: 13,
                      "&:hover": {
                        background: "#00eaff22",
                        borderColor: "#ff00c8",
                        color: "#fff",
                      },
                    }}
                  >
                    Classmates
                  </Button>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentClassListPage;
