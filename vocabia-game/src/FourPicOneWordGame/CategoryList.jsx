import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardContent, CircularProgress, Box
} from "@mui/material";
import GamesIcon from "@mui/icons-material/Games";
import CategoryIcon from "@mui/icons-material/Category";
import axios from "axios";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get("http://localhost:8080/api/4pic1word-assets/categories", {
          headers,
          withCredentials: true
        });
        setCategories(response.data);
      } catch (err) {
        setError("Failed to load categories. Please login or check backend.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
      <CircularProgress sx={{ color: "#00ffaa" }} />
      <Typography sx={{ mt: 2, color: "#222" }}>Loading categories...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h3" sx={{ color: "#222", mb: 4 }}>
        <GamesIcon sx={{ fontSize: 40, mr: 1 }} />
        4 Pics 1 Word Categories
      </Typography>
      {error && <Typography sx={{ color: "red" }}>{error}</Typography>}
      <Grid container spacing={4}>
        {categories.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ color: "#222", textAlign: "center" }}>
              No categories yet!
            </Typography>
          </Grid>
        )}
        {categories.map(cat => (
          <Grid item xs={12} sm={6} md={4} key={cat}>
            <Card
              sx={{
                background: "rgba(20, 20, 70, 0.9)",
                borderRadius: 3,
                cursor: "pointer",
                border: "2px solid #00ffaa33",
                "&:hover": { borderColor: "#00ffaa" }
              }}
              onClick={() => navigate(`/4pic1word/levels/${cat}`)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CategoryIcon sx={{ color: "#00ffaa", mr: 1 }} />
                  <Typography variant="h5" sx={{ color: "#fff", textTransform: "capitalize" }}>{cat}</Typography>
                </Box>
                <Typography sx={{ color: "#aaa" }}>Tap to see levels</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
