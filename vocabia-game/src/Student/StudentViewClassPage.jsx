import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Box,
<<<<<<< HEAD
  Button,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Fade,
  Paper
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GamepadIcon from "@mui/icons-material/SportsEsports";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
=======
  Typography,
  Paper,
  Link as MuiLink,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from "@mui/material";
import { Home, People, Games } from "@mui/icons-material";
>>>>>>> c2e8485b9e9a0fcb45b4faf9a48ef28328a1348e

export default function StudentViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/student/classes`);
        const classData = response.data.find(c => String(c.id) === String(id));
        if (classData) {
          setClassroom(classData);
          setError(null);
        } else {
          setError("Class not found or you don't have access to this class");
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError("You don't have permission to view classes");
        } else {
          setError("Failed to load class data: " + (err.response?.data || err.message));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [id]);

  if (loading) return (
<<<<<<< HEAD
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography
        sx={{
          color: "#00eaff",
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 24,
          textShadow: "0 0 10px #00eaff, 0 0 22px #ff00c8"
        }}
      >
        Loading...
      </Typography>
    </Box>
  );
  if (error) return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a22 90%, #18181b 100%)"
    }}>
      <Paper elevation={10} sx={{
        background: "#23232b", border: "2.5px solid #ff00c8",
        color: "#fff", borderRadius: 3, maxWidth: 420, p: 5,
        boxShadow: "0 0 20px #ff00c880"
      }}>
        <Typography sx={{ color: "#ff00c8", fontFamily: "'Press Start 2P'", mb: 2, textAlign: "center" }}>{error}</Typography>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#00eaff", color: "#00eaff", fontFamily: "'Press Start 2P'", mt: 2,
            display: "block", mx: "auto"
          }}
          component={Link} to="/student/classes"
        >
          Back to My Classes
        </Button>
      </Paper>
    </Box>
  );
  if (!classroom) return null;

  const teacherName = classroom.teacher
    ? `${classroom.teacher.firstName || ""} ${classroom.teacher.lastName || ""}`.trim()
    : classroom.teacherName || "Unknown";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a22 90%, #18181b 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: { xs: 5, md: 8 },
      }}
    >
      <Fade in timeout={700}>
        <Card
          elevation={12}
          sx={{
            background: "#18181b",
            border: "2.5px solid #00eaff",
            borderRadius: "26px",
            boxShadow: "0 0 40px #00eaff80, 0 0 80px #ff00c880, 0 0 0 10px #00eaff18 inset",
            width: "100%",
            maxWidth: 480,
            mx: "auto",
            position: "relative",
            overflow: "visible",
            p: { xs: 1, md: 3 }
          }}
        >
          {/* Back button */}
          <Button
            onClick={() => navigate("/student/classes")}
            startIcon={<ArrowBackIcon />}
            sx={{
              position: "absolute",
              top: 22,
              left: 26,
              color: "#00eaff",
              border: "2px solid #00eaff",
              borderRadius: 4,
              fontFamily: "'Press Start 2P'",
              fontSize: "0.95rem",
              background: "#23232b",
              textTransform: "none",
              px: 1.7,
              py: 0.6,
              zIndex: 2,
              "&:hover": { background: "#00eaff22", color: "#fff" }
            }}
          >
            Back
          </Button>

          <CardContent sx={{
            display: "flex", flexDirection: "column", alignItems: "center",
            pt: 7, pb: 1, px: { xs: 0.5, md: 2 }
          }}>
            {/* Avatar / Mascot */}
            <Avatar
              sx={{
                width: 76,
                height: 76,
                mb: 2.3,
                mt: -7,
                bgcolor: "#23233b",
                boxShadow: "0 0 18px #00eaffa0, 0 0 18px #ff00c870",
                border: "2.5px solid #ff00c8"
              }}
            >
              <SchoolIcon sx={{ fontSize: 44, color: "#00eaff" }} />
            </Avatar>

            {/* Class Name */}
            <Typography sx={{
              color: "#00eaff",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "2rem",
              letterSpacing: 1.5,
              mb: 0.5,
              textShadow: "0 0 14px #00eaff, 0 0 38px #ff00c8"
            }}>
              {classroom.name}
            </Typography>

            {/* Description */}
            <Typography sx={{
              color: "#fff",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "1.1rem",
              mb: 1,
              textShadow: "0 0 10px #00eaff25",
              textAlign: "center"
            }}>
              {classroom.description || "No description."}
            </Typography>

            {/* Teacher + optional badge */}
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                icon={<Avatar sx={{
                  bgcolor: "#ff00c8",
                  width: 22,
                  height: 22,
                  fontSize: 17
                }}>{teacherName[0] || "T"}</Avatar>}
                label={<>
                  <span style={{ color: "#ff00c8", fontWeight: 600, fontSize: 15 }}>Teacher:</span>{" "}
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{teacherName}</span>
                </>}
                sx={{
                  fontFamily: "'Press Start 2P', cursive",
                  bgcolor: "#23232b",
                  border: "1.5px solid #ff00c8",
                  color: "#fff",
                  px: 1.2,
                  boxShadow: "0 0 12px #ff00c840"
                }}
              />
              {/* Example achievement badge - optional */}
              {/* <Tooltip title="Perfect Attendance">
                <Avatar sx={{
                  bgcolor: "#ffe566",
                  width: 34, height: 34, ml: 1, border: "2.5px solid #00eaff"
                }}>
                  <EmojiEventsIcon sx={{ color: "#ff00c8", fontSize: 22 }} />
                </Avatar>
              </Tooltip> */}
            </Box>

            {/* Main actions */}
            <Box sx={{ width: "100%", mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "1.03rem",
                  borderColor: "#00eaff",
                  color: "#00eaff",
                  borderRadius: 3,
                  background: "#23232b",
                  boxShadow: "0 0 8px #00eaff50",
                  fontWeight: 700,
                  '&:hover': { background: "#00eaff22", borderColor: "#ff00c8", color: "#fff" }
                }}
                component={Link}
                to={`/student/classes/${id}/classmates`}
                startIcon={<GroupIcon />}
              >
                View Classmates
              </Button>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "1.03rem",
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #ff00c8 30%, #00eaff 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow: "0 0 14px #ff00c850",
                  '&:hover': { background: "#00eaff", color: "#191924" }
                }}
                component={Link}
                to={`/student/classes/${id}/4pic1word`}
                startIcon={<GamepadIcon />}
              >
                Play 4 Pics 1 Word Game
              </Button>
            </Box>

            {/* Navigation */}
            <Button
              onClick={() => navigate("/student/classes")}
              sx={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "1.03rem",
                color: "#00eaff",
                mt: 3,
                mb: 1,
                textDecoration: "underline",
                textTransform: "none",
                "&:hover": { color: "#ff00c8", textDecoration: "underline" }
              }}
            >
              ← Back to My Classes
            </Button>
          </CardContent>
        </Card>
      </Fade>
      {/* MUI-Only: The font import is for the neon look */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
=======
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Alert severity="error">
        {error}
      </Alert>
      <Box mt={2}>
        <Button 
          component={Link} 
          to="/student/classes" 
          variant="outlined" 
          startIcon={<Home />}
        >
          Back to My Classes
        </Button>
      </Box>
    </Box>
  );

  if (!classroom) return (
    <Box p={3}>
      <Alert severity="warning">
        Class not found
      </Alert>
      <Box mt={2}>
        <Button 
          component={Link} 
          to="/student/classes" 
          variant="outlined" 
          startIcon={<Home />}
        >
          Back to My Classes
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {classroom.name}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {classroom.description}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary">
          Teacher: {classroom.teacher?.firstName} {classroom.teacher?.lastName}
        </Typography>
      </Paper>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Class Actions
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              component={Link}
              to={`/student/classes/${id}/classmates`}
              variant="contained"
              color="primary"
              startIcon={<People />}
              fullWidth
            >
              View Classmates
            </Button>
            
            <Button
              component={Link}
              to={`/student/classes/${id}/4pic1word`}
              variant="contained"
              color="secondary"
              startIcon={<Games />}
              fullWidth
            >
              Play 4 Pics 1 Word Game
            </Button>
            
            <Button
              component={Link}
              to="/student/classes"
              variant="outlined"
              startIcon={<Home />}
              fullWidth
            >
              Back to My Classes
            </Button>
          </Box>
        </CardContent>
      </Card>
>>>>>>> c2e8485b9e9a0fcb45b4faf9a48ef28328a1348e
    </Box>
  );
}