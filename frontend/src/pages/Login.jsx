// File: src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert
} from "@mui/material";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const generateStarsData = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3,
        duration: 3 + Math.random() * 7,
        delay: Math.random() * 7
      });
    }
    return stars;
  };

  const generateMeteorsData = () => {
    const meteors = [];
    for (let i = 0; i < 5; i++) {
      meteors.push({
        id: i,
        delay: Math.random() * 15,
        duration: 5 + Math.random() * 10,
        size: 100 + Math.random() * 150
      });
    }
    return meteors;
  };

  const starsData = generateStarsData();
  const meteorsData = generateMeteorsData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8081/auth/login", {
        email,
        password
      }, { withCredentials: true });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        setEmail("");
        setPassword("");
        setIsLoading(false);
        navigate("/home");
      } else {
        setIsLoading(false);
        throw new Error("Authentication response missing required data");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        "Unable to access adventure portal. Please verify your credentials.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-background">
      {starsData.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}

      <div className="planet planet1"></div>
      <div className="planet planet2"></div>

      {meteorsData.map((meteor) => (
        <div
          key={meteor.id}
          className="meteor"
          style={{
            width: `${meteor.size}px`,
            height: `${meteor.size / 15}px`,
            animationDuration: `${meteor.duration}s`,
            animationDelay: `${meteor.delay}s`
          }}
        />
      ))}

      <Box className="login-box">
        <Card className="space-card">
          <CardContent className="form-side">
            <Typography variant="h1" className="login-title">
              VocabVenture Portal
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Enter credentials for your account
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </form>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Don’t have an account?{" "}
              <Link component={RouterLink} to="/register" underline="hover">
                Register here
              </Link>
            </Typography>
          </CardContent>

          <CardContent className="welcome-side">
            <Typography variant="h5" color="white">
              Welcome back, Space Explorer!
            </Typography>
            <Typography variant="body2" color="gray">
              Prepare to launch your vocabulary journey.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Login;
