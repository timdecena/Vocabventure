import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  Alert,
} from "@mui/material";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CATEGORY_BG = [
  "#FFE0B2", "#B2DFDB", "#E1BEE7", "#FFF59D", "#BBDEFB", "#FFCCBC", "#F8BBD0"
];

export default function CategoryList() {
  const { id } = useParams(); // classroom id
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Remove duplicate '/api' prefix since it's already in the baseURL
    api.get("/fpow/categories")
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error("Error fetching categories:", err);
        // If there's an error, set an empty array to avoid null reference errors
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={700} color="#273244" mb={2}>
        Choose a Category
      </Typography>
      {categories.length === 0 ? (
        <Alert severity="info">No categories available.</Alert>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {categories.map((cat, i) => (
            <Grid item xs={12} sm={6} md={4} key={cat}>
              <Card
                elevation={4}
                sx={{
                  background: `linear-gradient(135deg, ${CATEGORY_BG[i % CATEGORY_BG.length]} 60%, #fff)`,
                  borderRadius: 4,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  transition: "transform 0.22s",
                  '&:hover': {
                    transform: "scale(1.045)",
                    boxShadow: "0 8px 36px rgba(0,40,60,0.11)",
                  }
                }}
              >
                <CardContent sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 5,
                }}>
                  <EmojiNatureIcon fontSize="large" color="success" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Typography>
                  <Chip
                    label="Category"
                    color="primary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  />
                  <Tooltip title={`Play levels for ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIosIcon />}
                      color="secondary"
                      size="large"
                      sx={{ fontWeight: 600, borderRadius: 8, px: 4 }}
                      onClick={() => navigate(`/student/classes/${id}/4pic1word/${cat}`)}
                    >
                      Play
                    </Button>
                  </Tooltip>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
