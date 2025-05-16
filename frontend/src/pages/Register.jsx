// File: src/pages/Register.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

// 🌌 Styled Components
const SpaceBackground = styled(Box)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.background.dark} 0%, ${theme.palette.background.darkSecondary} 100%)`,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
    backgroundImage: `
      radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 5%),
      radial-gradient(circle at 90% 80%, rgba(255,255,255,0.03) 0%, transparent 5%),
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 10%)`,
  },
}));

const SpaceCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  width: "95%",
  maxWidth: "900px",
  background: "rgba(10,10,46,0.8)",
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: "0 0 15px rgba(51,255,119,0.2), 0 0 20px rgba(0,128,255,0.1)",
  backdropFilter: "blur(5px)",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.05)",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const FormSide = styled(CardContent)(({ theme }) => ({
  flex: 1.2,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background: "rgba(10,15,30,0.7)",
}));

const WelcomeSide = styled(CardContent)(({ theme }) => ({
  flex: 0.8,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(10,10,30,0.9)",
  [theme.breakpoints.down("sm")]: { display: "none" },
}));

const Star = styled("div")(({ size, x, y, duration, delay }) => ({
  position: "absolute",
  left: `${x}%`,
  top: `${y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: "#fff",
  borderRadius: "50%",
  opacity: 0.5,
  animation: `twinkle ${duration}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const Planet = styled("div")(({ type }) => ({
  position: "absolute",
  pointerEvents: "none",
  opacity: 0.6,
  ...(type === "planet1"
    ? {
        width: "80px",
        height: "80px",
        top: "5%",
        right: "3%",
        background: "radial-gradient(circle at 30% 30%, #33ffbb, #0c4a7c)",
      }
    : {
        width: "40px",
        height: "40px",
        bottom: "10%",
        left: "5%",
        background: "radial-gradient(circle at 40% 40%, #66ff99, #006633)",
      }),
  borderRadius: "50%",
  boxShadow: "0 0 20px rgba(51,255,187,0.4)",
}));

const Meteor = styled("div")(({ delay, duration, size }) => ({
  position: "absolute",
  width: `${size}px`,
  height: `${size / 15}px`,
  backgroundColor: "#fff",
  opacity: 0,
  borderRadius: "50%",
  filter: "blur(1px)",
  animation: `meteor ${duration}s linear infinite`,
  animationDelay: `${delay}s`,
}));

// 🚀 Main Component
const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const starsData = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3,
      duration: 3 + Math.random() * 7,
      delay: Math.random() * 7,
    }));
  }, []);

  const meteorsData = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 15,
      duration: 5 + Math.random() * 10,
      size: 100 + Math.random() * 150,
    }));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, role } = form;

    if (!username || !email || !password) {
      setError("All fields are required for your space expedition registration!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please provide a valid cosmic communication address (email)!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "http://localhost:8081/auth/register",
        { username, email, password, role },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/profile");
      } else {
        throw new Error("Missing token in response.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(", ") ||
        "Unable to create your explorer account. Please try again later.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SpaceBackground>
      {starsData.map((star) => (
        <Star key={star.id} {...star} />
      ))}
      {meteorsData.map((meteor) => (
        <Meteor key={meteor.id} {...meteor} />
      ))}
      <Planet type="planet1" />
      <Planet type="planet2" />

      <SpaceCard>
        <WelcomeSide>
          <Typography variant="h5" color="white" gutterBottom>
            🌠 Welcome Aboard!
          </Typography>
          <Typography color="white">Join the intergalactic learning fleet.</Typography>
        </WelcomeSide>

        <FormSide component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" color="white" gutterBottom>
            Register
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={form.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Launch"}
          </Button>

          <Typography variant="body2" color="white" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </FormSide>
      </SpaceCard>
    </SpaceBackground>
  );
};

export default Register;
