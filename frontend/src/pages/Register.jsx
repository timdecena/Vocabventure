// File: src/pages/Register.jsx
// Purpose: User registration page with space-themed adventure aesthetic
// Features: Registration form with role selection, animated space background, JWT-based account creation
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css"; // Imports custom styling for authentication pages

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
   * Handles the registration form submission
   * Validates user input, creates new account via API
   * Stores authentication data and redirects on success
   * 
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
    const API_URL = "http://localhost:8080/auth/register"; // Spring Boot backend endpoint
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
    <div className="auth-page"> {/* Main container with starry background */}
      <div className="split-auth-container"> {/* Centered container for auth card */}
        <div className="split-auth-card"> {/* Two-panel card with glowing border effect */}
          {/* Left side - Registration form */}
          <div className="auth-form-side"> {/* Container for the registration form panel */}
            <h1 className="auth-title">Join VocabVenture</h1> {/* Main title with neon green glow */}
            <p className="auth-subtitle">Register for a new account to begin your vocabulary and spelling journey</p>
            
            {/* Conditional error message display */}
            {error && <div className="auth-error">{error}</div>}
            
            {/* Registration form with handler for submission */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Username input group */}
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
              
              {/* Email input group */}
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
              
              {/* Password input group */}
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
              
              {/* Role selection dropdown */}
              <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="auth-input"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
              
              {/* Submit button with loading state */}
              <button 
                type="submit" 
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Preparing Spacecraft...' : 'Launch Your Journey'}
              </button>
              
              {/* Link to login page */}
              <div className="auth-links">
                <p>
                  Already a crew member? <Link to="/login" className="auth-link">Access your station</Link>
                </p>
              </div>
            </form>
          </div>
          
          {/* Right side - Welcome message with decorative elements */}
          <div className="auth-welcome-side"> {/* Darker panel with space background */}
            <div className="space-ship"></div> {/* Decorative spaceship SVG with animation */}
            <h2 className="welcome-title">VocabVenture Guild</h2> {/* Welcome panel title */}
            <p className="welcome-text">Join our adventurer guild of explorers discovering new words and spelling across the universe of language.</p>
            <div className="space-station"></div> {/* Decorative space station SVG with animation */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
