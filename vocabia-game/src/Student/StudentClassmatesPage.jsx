import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { 
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Avatar,
  Card,
  CardContent,
  Fade,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

export default function StudentClassmatesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/student/classes/${id}/classmates`);
        setClassmates(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load classmates:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view this class's students");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          setError("Failed to load classmates. Please try again later.");
        }
        setClassmates([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchClassName = async () => {
      try {
        const response = await api.get(`/api/student/classes/${id}`);
        setClassName(response.data?.name || "Class");
      } catch (err) {
        console.error("Failed to load class name:", err);
        setClassName("Class");
      }
    };
    
    fetchClassmates();
    fetchClassName();
  }, [id]);

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

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
            mb: 4,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Button
              component={Link}
              to={`/student/classes/${id}`}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "#00eaff",
                border: "2px solid #00eaff",
                borderRadius: 2,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "0.75rem",
                background: "#23232b",
                textTransform: "none",
                px: 2,
                py: 1,
                "&:hover": { 
                  background: "#00eaff22", 
                  color: "#fff",
                  borderColor: "#ff00c8"
                }
              }}
            >
              Back
            </Button>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  color: "#00eaff",
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: "0 0 18px #00eaff, 0 0 44px #ff00c8",
                  fontWeight: 700,
                  fontSize: { xs: 24, md: 32 },
                }}
              >
                Classmates
              </Typography>
              <Typography
                sx={{
                  color: "#ff00c8",
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: "0 0 10px #ff00c8",
                  fontSize: { xs: 11, md: 14 },
                  fontWeight: 600,
                  mt: 1,
                }}
              >
                {className} • {classmates.length} {classmates.length === 1 ? 'student' : 'students'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: "#00eaff" }} size={60} />
          </Box>
        ) : error ? (
          <Fade in timeout={700}>
            <Card
              sx={{
                background: "#1a1a26",
                border: "2.5px solid #e74c3c",
                borderRadius: "21px",
                boxShadow: "0 0 34px #e74c3c66",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#e74c3c",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 16,
                  textShadow: "0 0 12px #e74c3c",
                  mb: 2,
                }}
              >
                {error}
              </Typography>
              <Button
                component={Link}
                to={`/student/classes/${id}`}
                startIcon={<ArrowBackIcon />}
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
                Back to Class
              </Button>
            </Card>
          </Fade>
        ) : classmates.length === 0 ? (
          <Fade in timeout={700}>
            <Box sx={{ textAlign: "center", py: 6 }}>
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
                <PeopleIcon sx={{ color: "#00eaff", fontSize: 56 }} />
              </Avatar>
              <Typography
                sx={{
                  color: "#00eaff",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 20,
                  textShadow: "0 0 12px #00eaff",
                  mb: 1,
                }}
              >
                No Classmates Yet!
              </Typography>
              <Typography
                sx={{
                  color: "#fff",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 13,
                  textShadow: "0 0 6px #ff00c8",
                  mb: 3,
                }}
              >
                You're the first student in this class!
              </Typography>
              <Button
                component={Link}
                to={`/student/classes/${id}`}
                startIcon={<ArrowBackIcon />}
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
                Back to Class
              </Button>
            </Box>
          </Fade>
        ) : (
          <Fade in timeout={700}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: { xs: 2, md: 3 },
              }}
            >
              {classmates.map((student, idx) => (
                <Card
                  key={student.id}
                  sx={{
                    background: "#1a1a26",
                    border: "2.5px solid #00eaff",
                    borderRadius: "21px",
                    boxShadow: "0 0 34px #00eaff66",
                    position: "relative",
                    p: 2.5,
                    minHeight: 180,
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
                  {/* Student Avatar */}
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      mb: 2,
                      background: "linear-gradient(135deg, #00eaff 0%, #ff00c8 100%)",
                      color: "#191924",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 24,
                      fontWeight: 700,
                      boxShadow: "0 0 20px #00eaff90",
                      border: "3px solid #00eaff",
                    }}
                  >
                    {getInitials(student.firstName, student.lastName)}
                  </Avatar>

                  {/* Student Name */}
                  <Typography
                    sx={{
                      color: "#00eaff",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: "center",
                      textShadow: "0 0 8px #00eaff",
                      mb: 1,
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={`${student.firstName} ${student.lastName}`}
                  >
                    {student.firstName} {student.lastName}
                  </Typography>

                  {/* Student Email */}
                  <Typography
                    sx={{
                      color: "#fff",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 10,
                      textAlign: "center",
                      opacity: 0.8,
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={student.email}
                  >
                    {student.email}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Fade>
        )}
      </Paper>
    </Box>
  );
}