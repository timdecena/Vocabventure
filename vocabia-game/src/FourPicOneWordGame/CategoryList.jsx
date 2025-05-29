import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardContent, CircularProgress, Box
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import axios from "axios";

const SERVER_URL = "http://localhost:8080";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${SERVER_URL}/api/4pic1word-assets/categories`);
        setCategories(res.data);
      } catch (err) {
        setError("Failed to load categories.");
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return (
    <Container sx={{ mt: 8, textAlign: "center" }}>
      <CircularProgress color="secondary" />
      <Typography sx={{ mt: 2 }}>Loading categories...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>Categories</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={4}>
        {categories.length === 0 ? (
          <Grid item xs={12}><Typography>No categories found.</Typography></Grid>
        ) : categories.map(cat => (
          <Grid item xs={12} sm={6} md={4} key={cat}>
            <Card
              sx={{
                background: "rgba(20, 40, 70, 0.93)",
                borderRadius: 3,
                cursor: "pointer",
                border: "2px solid #80d8ff",
                "&:hover": { borderColor: "#29b6f6" }
              }}
              onClick={() => navigate(`/4pic1word/levels/${cat}`)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CategoryIcon sx={{ mr: 1, color: "#29b6f6" }} />
                  <Typography variant="h5" sx={{ color: "#fff", textTransform: "capitalize" }}>{cat}</Typography>
                </Box>
                <Typography sx={{ color: "#b3e5fc" }}>View Levels</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
