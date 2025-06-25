import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Paper
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import Home from "@mui/icons-material/Home";
import ForestIcon from "@mui/icons-material/Forest";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import api from "../api/api";

const StudentClassListPage = () => {
  const [classes, setClasses] = useState([]);
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
    <Paper 
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 3
      }}
    >
      <Box maxWidth="1200px" mx="auto">
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Box flexGrow={1}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              My Classes
            </Typography>
            <Chip
              icon={<ForestIcon />}
              label="Enchanted Spelling Journey"
              sx={{ 
                bgcolor: 'primary.dark', 
                color: 'common.white',
                fontWeight: "bold" 
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, bgcolor: 'divider' }} />

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            {classes.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" fontStyle="italic">
                  You have not joined any classes yet.
                </Typography>
              </Grid>
            ) : (
              classes.map(c => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Home sx={{ color: 'primary.main', mr: 1 }} fontSize="large" />
                        <Typography variant="h6" fontWeight="bold">
                          {c.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {c.description}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        <b>Teacher:</b> {c.teacher?.firstName} {c.teacher?.lastName}
                      </Typography>
                      
                      <Box mt="auto" display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="contained"
                          component={Link}
                          to={`/student/classes/${c.id}`}
                          startIcon={<ForestIcon />}
                          sx={{ flex: 1 }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={`/student/classes/${c.id}/classmates`}
                          startIcon={<GroupIcon />}
                          sx={{ flex: 1 }}
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
        )}
      </Box>
    </Paper>
  );
};

export default StudentClassListPage;