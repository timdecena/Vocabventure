import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardHeader,
  Chip,
  Tooltip
} from "@mui/material";
import {
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function StudentClassmatesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Get class name
    api.get("/student/classes")
      .then(res => {
        const found = res.data.find(c => c.id === Number(id));
        if (found) {
          setClassName(found.name);
        }
      })
      .catch(err => {
        console.error("Error fetching class name:", err);
      });

    // Get classmates
    api.get(`/student/classes/${id}/classmates`)
      .then(res => {
        setClassmates(res.data);
      })
      .catch(err => {
        console.error("Error fetching classmates:", err);
        setError("Failed to load classmates. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Generate a consistent color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", 
      "#ff9800", "#ff5722", "#f44336", "#e91e63", "#9c27b0", 
      "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688"
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} thickness={4} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading classmates...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Nature-themed background with subtle gradient */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #e6f7ff 0%, #e3f2fd 50%, #e1f5fe 100%)",
          zIndex: -1,
          opacity: 0.7
        }}
      />

      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/student/classes/${id}`)}
          sx={{
            borderColor: "#4caf50",
            color: "#4caf50",
            '&:hover': {
              borderColor: "#388e3c",
              bgcolor: "rgba(76, 175, 80, 0.04)"
            }
          }}
        >
          Back to Class
        </Button>
      </Box>

      {/* Main content card */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 32px rgba(0, 105, 92, 0.1)"
        }}
      >
        {/* Header with background */}
        <Box 
          sx={{ 
            p: 4, 
            background: "linear-gradient(45deg, #81c784 0%, #4caf50 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <GroupIcon sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              Classmates
            </Typography>
          </Box>
          {className && (
            <Chip 
              icon={<SchoolIcon />} 
              label={className}
              sx={{ 
                mt: 1,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 500,
                '& .MuiChip-icon': { color: "white" }
              }}
            />
          )}
        </Box>

        {/* Classmates list */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          {classmates.length === 0 ? (
            <Alert severity="info">
              No other students in this class yet.
            </Alert>
          ) : (
            <Card elevation={0} sx={{ bgcolor: "transparent" }}>
              <CardHeader 
                avatar={<Avatar sx={{ bgcolor: "#4caf50" }}><PersonIcon /></Avatar>}
                title={<Typography variant="h6">{classmates.length} Students</Typography>}
                subheader="Your classmates in this course"
              />
              
              <List sx={{ bgcolor: "white", borderRadius: 2 }}>
                {classmates.map((student, index) => (
                  <React.Fragment key={student.id}>
                    {index > 0 && <Divider variant="inset" component="li" />}
                    <ListItem alignItems="center" sx={{ py: 1.5 }}>
                      <ListItemAvatar>
                        <Tooltip title={`${student.firstName} ${student.lastName}`}>
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(`${student.firstName} ${student.lastName}`),
                              fontWeight: "bold"
                            }}
                          >
                            {getInitials(student.firstName, student.lastName)}
                          </Avatar>
                        </Tooltip>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={500}>
                            {student.firstName} {student.lastName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Card>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
