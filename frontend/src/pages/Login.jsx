// File: src/pages/Login.jsx
// Purpose: User authentication page with space-themed adventure aesthetic
// Features: Login form, animated space background, JWT authentication
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css"; // Imports custom styling for authentication pages

const Login = () => {
  // State variables for form fields - Track user input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // State variable for displaying error messages to the user
  const [error, setError] = useState("");
  
  // Loading state for button animation during API requests
  const [isLoading, setIsLoading] = useState(false);

  // React Router hook for programmatic navigation after login
  const navigate = useNavigate();
  
  // Effect hook to create space-themed animated background elements
  // Runs once on component mount and cleans up on unmount
  useEffect(() => {
    // Create various space-themed background elements
    createStars();      // Generates twinkling stars in the background
    createSpaceObjects(); // Adds planets and space objects
    createMeteors();    // Adds animated meteor effects
    
    // Cleanup function to remove all created elements when component unmounts
    return () => {
      // Remove stars container
      const starsContainer = document.querySelector('.stars');
      if (starsContainer) {
        starsContainer.remove();
      }
      
      // Remove all space objects (planets, etc.)
      const spaceObjects = document.querySelectorAll('.space-object');
      spaceObjects.forEach(obj => obj.remove());
      
      // Remove all meteor elements
      const meteors = document.querySelectorAll('.meteor');
      meteors.forEach(meteor => meteor.remove());
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Creates an animated starfield background with twinkling effect
  const createStars = () => {
    // Create container for all stars
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.querySelector('.auth-page').appendChild(starsContainer);
    
    // Number of stars to generate
    const starsCount = 100;
    
    // Generate individual star elements with randomized properties
    for (let i = 0; i < starsCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Generate random position coordinates (as percentage of container)
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Generate random star size (pixels)
      const size = Math.random() * 3;
      
      // Generate random animation duration for twinkling effect
      const duration = 3 + Math.random() * 7;
      
      // Apply generated properties to the star element
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--duration', `${duration}s`);
      star.style.animationDelay = `${Math.random() * duration}s`;
      
      // Add star to the container
      starsContainer.appendChild(star);
    }
  };
  
  // Creates decorative planet elements for the space theme
  const createSpaceObjects = () => {
    // Get reference to the main container
    const authPage = document.querySelector('.auth-page');
    
    // Create first planet - larger bluish-green planet in top right
    const planet1 = document.createElement('div');
    planet1.className = 'space-object planet-1';
    authPage.appendChild(planet1);
    
    // Create second planet - smaller green planet in bottom left
    const planet2 = document.createElement('div');
    planet2.className = 'space-object planet-2';
    authPage.appendChild(planet2);
  };
  
  // Creates animated meteor effects that streak across the screen
  const createMeteors = () => {
    // Get reference to the main container
    const authPage = document.querySelector('.auth-page');
    // Number of meteors to create
    const meteorCount = 3;
    
    // Generate each meteor with different timing
    for (let i = 0; i < meteorCount; i++) {
      const meteor = document.createElement('div');
      meteor.className = 'meteor';
      
      // Random starting position for each meteor
      const x = Math.random() * 100;
      const y = Math.random() * 50;
      
      // Apply position and stagger animation timing
      meteor.style.left = `${x}%`;
      meteor.style.top = `${y}%`;
      meteor.style.animationDelay = `${i * 3}s`; // Stagger meteors by 3 seconds each
      
      // Add meteor to page
      authPage.appendChild(meteor);
    }
  };

  /**
   * Handles the login form submission
   * Authenticates user credentials with the backend API
   * Stores authentication data and redirects on success
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(""); // Clear any previous error messages
    setIsLoading(true); // Activate loading state for button animation

    // Define the API configuration for the authentication request
    const API_URL = "http://localhost:8080/auth/login"; // Spring Boot backend endpoint
    const requestBody = { username, password }; // User credentials from form state
    const requestConfig = { 
      withCredentials: true, // Allow cookies to be sent with request
      headers: {
        'Content-Type': 'application/json' // Specify JSON content type
      }
    };

    try {
      // Send authentication request to the backend API
      const response = await axios.post(API_URL, requestBody, requestConfig);
      const authData = response.data; // Extract response data with token and user info
      
      // Process successful authentication response
      if (authData.token) {
        // Store JWT authentication token in browser's localStorage
        localStorage.setItem("token", authData.token);
        
        // Store user profile data if available in the response
        if (authData.user) {
          localStorage.setItem("user", JSON.stringify(authData.user));
        }

        // Navigate to the user profile page after successful login
        navigate("/profile");
      } else {
        // Handle unexpected response format (missing token)
        throw new Error("Authentication response missing required data");
      }
    } catch (error) {
      // Handle authentication errors (network issues, invalid credentials, etc.)
      console.error("Authentication failed:", error);
      
      // Extract error message from response or use default message
      const errorMessage = error.response?.data?.message || 
                          "Unable to access adventure portal. Please verify your credentials.";
      
      setError(errorMessage); // Display error message to user
      setIsLoading(false); // Reset loading state for button
    }
  };

  // Render the login page with space-themed components and form
  return (
    <div className="auth-page"> {/* Main container with starry background */}
      <div className="split-auth-container"> {/* Centered container for auth card */}
        <div className="split-auth-card"> {/* Two-panel card with glowing border effect */}
          {/* Left side - Login form */}
          <div className="auth-form-side"> {/* Container for the login form panel */}
            <h1 className="auth-title">VocabVenture Portal</h1> {/* Main title with neon green glow */}
            <p className="auth-subtitle">
              Enter credentials for your account {/* Subtitle explaining purpose */}
            </p>
            {/* Conditional error message display */}
            {error && <div className="auth-error">{error}</div>}
            
            {/* Login form with handler for submission */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Username input group */}
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="auth-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </div>
              
              {/* Password input group */}
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="auth-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
              
              {/* Submit button with loading state */}
              <button
                type="submit"
                className="auth-button" 
                disabled={isLoading}
              >
                {isLoading ? 'Launching...' : 'Launch Mission'} {/* Dynamic text based on loading state */}
              </button>
            </form>
            <br></br>
            
            {/* Link to registration page */}
            <div className="auth-alt-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link"> {/* Navigation link with Router */}
                Register now!
              </Link>
            </div>
          </div>
          
          {/* Right side - Welcome message with decorative elements */}
          <div className="auth-welcome-side"> {/* Darker panel with space background */}
            <div className="space-ship"></div> {/* Decorative spaceship SVG with animation */}
            <h2 className="welcome-title">VocabVenture Quest</h2> {/* Welcome panel title */}
            <p className="welcome-text">Embark on a journey through the universe of vocabulary and spelling.</p>
            <div className="space-station"></div> {/* Decorative space station SVG with animation */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
