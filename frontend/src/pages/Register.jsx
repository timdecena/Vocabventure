// File: src/pages/Register.jsx
// Purpose: User registration page with space-themed adventure aesthetic
// Features: Registration form with role selection, animated space background, JWT-based account creation
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { styled } from '@mui/material/styles';
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
  FormHelperText
} from '@mui/material';

// Styled components for space-themed elements
const SpaceBackground = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.dark} 0%, ${theme.palette.background.darkSecondary} 100%)`,
  overflow: 'hidden',
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  margin: 0,
  padding: 0,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: `
      radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 5%),
      radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 5%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 10%)
    `,
    zIndex: 0,
  }
}));

const SpaceCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '420px',
  width: '95%',
  maxWidth: '900px',
  background: 'rgba(10, 10, 46, 0.8)',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 0 15px rgba(51, 255, 119, 0.2), 0 0 20px rgba(0, 128, 255, 0.1)',
  animation: 'cardGlow 3s ease-in-out infinite alternate',
  overflow: 'hidden',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
}));

const FormSide = styled(CardContent)(({ theme }) => ({
  flex: 1.2,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: 'rgba(10, 15, 30, 0.7)',
  position: 'relative',
}));

const WelcomeSide = styled(CardContent)(({ theme }) => ({
  flex: 0.8,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(10, 10, 30, 0.9)',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const Star = styled('div')(({ size, x, y, duration, delay }) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: '#fff',
  borderRadius: '50%',
  opacity: 0.5,
  animation: `twinkle ${duration}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const Planet = styled('div')(({ type }) => ({
  position: 'absolute',
  pointerEvents: 'none',
  opacity: 0.6,
  transition: 'opacity 0.5s ease',
  ...(type === 'planet1' ? {
    width: '80px',
    height: '80px',
    top: '5%',
    right: '3%',
    background: 'radial-gradient(circle at 30% 30%, #33ffbb, #0c4a7c)',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(51, 255, 187, 0.4)',
  } : {
    width: '40px',
    height: '40px',
    bottom: '10%',
    left: '5%',
    background: 'radial-gradient(circle at 40% 40%, #66ff99, #006633)',
    borderRadius: '50%',
    boxShadow: '0 0 15px rgba(102, 255, 153, 0.3)',
  }),
}));

const Meteor = styled('div')(({ delay, duration, size }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size / 15}px`,
  backgroundColor: '#fff',
  opacity: 0,
  borderRadius: '50%',
  filter: 'blur(1px)',
  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
  animation: `meteor ${duration}s linear infinite`,
  animationDelay: `${delay}s`,
}));

const Register = () => {
  // State variables for form fields - Track user registration input
  const [username, setUsername] = useState(""); // Explorer name/username
  const [email, setEmail] = useState(""); // User's email address
  const [password, setPassword] = useState(""); // User's password
  const [role, setRole] = useState("STUDENT"); // User role (STUDENT or TEACHER)
  
  // State variable for displaying error messages to the user
  const [error, setError] = useState("");
  
  // Loading state for button animation during API requests
  const [isLoading, setIsLoading] = useState(false);

  // React Router hook for programmatic navigation after registration
  const navigate = useNavigate();
  
  // Effect hook for any initialization if needed
  useEffect(() => {
    // No need for DOM manipulation with MUI and styled components
    // The space elements are now rendered declaratively in the JSX
  }, []);
  
  // Generate stars data for the starfield background
  const generateStarsData = () => {
    const starsData = [];
    const starsCount = 100;
    
    for (let i = 0; i < starsCount; i++) {
      starsData.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3,
        duration: 3 + Math.random() * 7,
        delay: Math.random() * 7
      });
    }
    
    return starsData;
  };
  
  // Generate meteors data for the meteor animation
  const generateMeteorsData = () => {
    const meteorsData = [];
    const meteorCount = 5;
    
    for (let i = 0; i < meteorCount; i++) {
      meteorsData.push({
        id: i,
        delay: Math.random() * 15,
        duration: 5 + Math.random() * 10,
        size: 100 + Math.random() * 150
      });
    }
    
    return meteorsData;
  };
  
  // Generate the data for stars and meteors
  const starsData = generateStarsData();
  const meteorsData = generateMeteorsData();

  /**
   * Handles the registration form submission
   * Validates user input, creates new account via API
   * Stores authentication data and redirects on success
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Client-side form validation before making API request
    // 1. Check if all required fields are provided
    if (!username || !email || !password) {
      setError("All fields are required for your space expedition registration!");
      return;
    }
    
    // 3. Validate email format using regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please provide a valid cosmic communication address (email)!");
      return;
    }
    
    // Start loading state and clear any previous errors
    setIsLoading(true);
    setError("");
    
    // Define the API configuration for the registration request
    const API_URL = "http://localhost:8081/auth/register"; // Spring Boot backend endpoint
    const requestBody = { username, email, password, role }; // User registration data
    const requestConfig = { 
      withCredentials: true, // Allow cookies to be sent with request
      headers: {
        'Content-Type': 'application/json' // Specify JSON content type
      }
    };

    try {
      // Send registration request to the backend API
      const response = await axios.post(API_URL, requestBody, requestConfig);
      const authData = response.data; // Extract response data with token and user info
      
      // Process successful registration response
      if (authData.token) {
        // Store JWT authentication token in browser's localStorage
        localStorage.setItem("token", authData.token);
        
        // Store user profile data if available in the response
        if (authData.user) {
          localStorage.setItem("user", JSON.stringify(authData.user));
        }

        // Navigate to the user profile page after successful registration
        navigate("/profile");
      } else {
        // Handle unexpected response format (missing token)
        throw new Error("Registration response missing required data");
      }
    } catch (error) {
      // Handle registration errors (network issues, validation errors, etc.)
      console.error("Registration failed:", error);
      
      // Default error message if specifics cannot be determined
      let errorMessage = "Unable to create your explorer account. Please try again later.";
      
      // Extract specific validation errors from different response formats
      if (error.response?.data?.message) {
        // Single error message format
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Multiple validation errors format (common in Spring Boot)
        const validationErrors = error.response.data.errors.map(err => err.defaultMessage);
        errorMessage = validationErrors.join(" ");
      }
      
      setError(errorMessage); // Display error message to user
      setIsLoading(false); // Reset loading state for button
    }
  };

  return (
    <SpaceBackground>
      {/* Render stars */}
      {starsData.map((star) => (
        <Star
          key={star.id}
          x={star.x}
          y={star.y}
          size={star.size}
          duration={star.duration}
          delay={star.delay}
        />
      ))}
      
      {/* Render planets */}
      <Planet type="planet1" />
      <Planet type="planet2" />
      
      {/* Render meteors */}
      {meteorsData.map((meteor) => (
        <Meteor
          key={meteor.id}
          delay={meteor.delay}
          duration={meteor.duration}
          size={meteor.size}
        />
      ))}
      
      <Box sx={{ width: '100%', maxWidth: '900px', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SpaceCard>
          {/* Left side - Registration form */}
          <FormSide>
            <Typography variant="h1" sx={{ color: 'secondary.main', mb: 1 }}>Join VocabVenture</Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Register for a new account to begin your vocabulary and spelling journey
            </Typography>
            
            {/* Conditional error message display */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Registration form with handler for submission */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="username"
                label="Username"
                type="text"
                placeholder="Choose your username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email address"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                id="password"
                label="Password"
                type="password"
                placeholder="Create a secure password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="role-label" shrink>Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  label="Role"
                  notched
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                </Select>
                <FormHelperText>Select your role in the VocabVenture</FormHelperText>
              </FormControl>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Preparing Spacecraft...
                  </>
                ) : 'Launch Your Journey'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" color="secondary">
                    Login now!
                  </Link>
                </Typography>
              </Box>
            </Box>
          </FormSide>
          
          {/* Right side - Welcome message with decorative elements */}
          <WelcomeSide>
            {/* We'll replace the div elements with Box components for the space ship and station */}
            <Box sx={{ 
              width: '80px', 
              height: '80px', 
              background: 'radial-gradient(circle, rgba(0,255,170,0.3) 0%, rgba(0,170,127,0.1) 100%)',
              borderRadius: '50%',
              mb: 3,
              animation: 'hover 3s ease-in-out infinite alternate'
            }} />
            
            <Typography variant="h2" sx={{ color: 'secondary.main', mb: 1, textAlign: 'center' }}>
              VocabVenture Guild
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
              Join our adventurer guild of explorers discovering new words and spelling across the universe of language.
            </Typography>
            
            <Box sx={{ 
              width: '100px', 
              height: '40px', 
              background: 'radial-gradient(circle, rgba(0,255,170,0.2) 0%, rgba(0,170,127,0.05) 100%)',
              borderRadius: '10px',
              animation: 'hover 4s ease-in-out infinite alternate'
            }} />
          </WelcomeSide>
        </SpaceCard>
      </Box>
    </SpaceBackground>
  );
};

export default Register;
