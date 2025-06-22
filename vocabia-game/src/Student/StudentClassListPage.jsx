// File: src/Student/StudentClassListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Grid,
  Chip,
  Tooltip,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import Home from "@mui/icons-material/Home";
import ForestIcon from "@mui/icons-material/Forest";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import api from "../api/api";
import "../styles/StudentClassListNature.css";

const StudentClassListPage = () => {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/student/classes");
        setClasses(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load classes");
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  return (
    <Box className="nature-classlist-root">
      <div className="nature-classlist-bg" />
      <Box className="nature-classlist-content" p={3}>
        {/* Header and XP bar */}
        <Box display="flex" alignItems="center" mb={3} className="nature-classlist-header">

          <Box flexGrow={1}>
            <Typography variant="h4" className="nature-classlist-title" fontWeight="bold">
              My Classes
            </Typography>
            <Chip
              icon={<ForestIcon />}
              label="Enchanted Spelling Journey"
              className="nature-classlist-chip"
              sx={{ bgcolor: "#d4ffea", color: "#215a2b", fontWeight: "bold" }}
            />
          </Box>
          <Tooltip title="Join New Class" arrow>
            <Button
              className="nature-classlist-btn"
              variant="contained"
              size="large"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate("/student/classes/join")}
            >
              Join New Class
            </Button>
          </Tooltip>
        </Box>

        {/* XP Progress Bar */}


        {/* Class Cards */}
        <Grid container spacing={3} className="nature-classlist-grid">
          {classes.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" fontStyle="italic">
                (You have not joined any classes yet.)
              </Typography>
            </Grid>
          ) : (
            classes.map(c => (
              <Grid item xs={12} md={6} key={c.id}>
                <Card className="nature-classlist-card" elevation={5}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Home sx={{ color: "#4caf50", mr: 1 }} fontSize="large" />
                      <Typography variant="h6" className="nature-classlist-card-title" fontWeight="bold">
                        {c.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {c.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <b>Teacher:</b> {c.teacher?.firstName} {c.teacher?.lastName}
                    </Typography>
                    <Box mt={2} display="flex" gap={2}>
                      <Button
                        className="nature-classlist-btn"
                        size="small"
                        variant="contained"
                        component={Link}
                        to={`/student/classes/${c.id}`}
                        startIcon={<ForestIcon />}
                      >
                        View
                      </Button>
                      <Button
                        className="nature-classlist-btn"
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/student/classes/${c.id}/classmates`}
                        startIcon={<GroupIcon />}
                      >
                        Classmates
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentClassListPage;
