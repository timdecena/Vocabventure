// File: src/pages/Profile.jsx
// Purpose: User profile page with space-themed adventure aesthetic
// Features: User stats, level progression, achievements, and space-themed UI elements
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Navigation component
import "../styles/Profile.css"; // Imports custom styling for profile page

const Profile = () => {
  // State for user profile data
  const [user, setUser] = useState(null);
  // Loading state to show loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // Error state for displaying error messages
  const [error, setError] = useState("");
  // React Router hook for navigation
  const navigate = useNavigate();
  
  // Effect hook to create space-themed animated background elements
  // Runs once on component mount and cleans up on unmount
  useEffect(() => {
    // Create various space-themed background elements
    createStars();    // Generates twinkling stars background
    createGalaxy();   // Adds a galaxy visual element
    createSatellite(); // Adds an orbiting satellite
    
    // Cleanup function to remove all created elements when component unmounts
    return () => {
      // Remove stars container
      const starsContainer = document.querySelector('.stars');
      if (starsContainer) {
        starsContainer.remove();
      }
      
      // Remove all space objects
      const spaceObjects = document.querySelectorAll('.space-object');
      spaceObjects.forEach(obj => obj.remove());
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Creates an animated starfield background with twinkling effect
  const createStars = () => {
    // Create container for all stars
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.querySelector('.profile-page').appendChild(starsContainer);
    
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
  
  // Creates a decorative galaxy element with glow effect and rotation
  const createGalaxy = () => {
    // Get reference to the main container
    const profilePage = document.querySelector('.profile-page');
    // Create the galaxy element
    const galaxy = document.createElement('div');
    galaxy.className = 'space-object galaxy';
    // Add the galaxy to the page
    profilePage.appendChild(galaxy);
  };
  
  // Creates an orbiting satellite element that circles the page
  const createSatellite = () => {
    // Get reference to the main container
    const profilePage = document.querySelector('.profile-page');
    // Create the satellite element
    const satellite = document.createElement('div');
    satellite.className = 'space-object satellite';
    satellite.innerHTML = '🛰️'; // Satellite emoji as visual
    // Add the satellite to the page
    profilePage.appendChild(satellite);
  };

  /**
   * Authentication check and user profile data loading
   * Verifies user is logged in and loads their profile data
   * Redirects to login page if authentication is missing
   */
  useEffect(() => {
    // Retrieve authentication data from local storage
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    // Check if authentication data exists
    if (!token || !userData) {
      // If missing, redirect to login page
      navigate("/login");
      return;
    }
    
    // If authenticated, process and load the user profile data
    loadUserProfile(userData, token);
  }, [navigate]); // Re-run if navigate function changes

  /**
   * Processes user profile data from localStorage and optionally syncs with backend
   * Handles parsing stored JSON data and updating component state
   * 
   * @param {string} userData - JSON string of cached user data from localStorage
   * @param {string} token - JWT authentication token for API requests
   */
  const loadUserProfile = (userData, token) => {
    try {
      // Parse the JSON string from localStorage into a JavaScript object
      const parsedUser = JSON.parse(userData);
      // Update the user state with the parsed data
      setUser(parsedUser);
      
      // Backend synchronization - Fetch latest user data from server
      // This is currently disabled but can be enabled for real-time data
      // fetchUserProfileFromServer(token);
      
      // End loading state since data is now available
      setIsLoading(false);
    } catch (error) {
      // Handle any errors that occur during parsing or processing
      console.error("Profile data processing error:", error);
      setError("Failed to load your adventure profile data");
      setIsLoading(false);
    }
  };

  /**
   * Fetches the latest user profile data from the backend server
   * 
   * @param {string} token - Authentication token for API authorization
   */
  // Commented out to avoid unused variable warning, will be implemented in future updates
  /* const fetchUserProfileFromServer = async (token) => {
    const API_URL = "http://localhost:8081/api/user/profile";
    const requestConfig = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      // Request latest profile data from server
      const response = await axios.get(API_URL, requestConfig);
      
      if (response.status === 200 && response.data) {
        // Update user state with latest data
        setUser(response.data);
        
        // Update cached user data
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      
      // Only show error if we don't already have cached data
      if (!user) {
        setError("Unable to retrieve your latest cosmic data");
      }
    }
  }; */

  /**
   * Extracts and formats user initials for the profile avatar
   * Takes the first letter of each word in the username
   * 
   * @param {string} name - User's name or username
   * @returns {string} - Formatted initials in uppercase
   */
  const getInitials = (name) => {
    // Return placeholder if name is not available
    if (!name) return '??';
    // Split name into parts, take first letter of each, join, and convert to uppercase
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Establishing connection to your cosmic profile database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="error-container">
          <h2>Space Mission Aborted!</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/login")} className="return-button">
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  // Main profile page render
  return (
    <div className="profile-page">
      {/* Top navigation bar */}
      <Navbar />
      
      {/* Main content container */}
      <div className="profile-container">
        {/* Profile header with user info and level */}
        <div className="profile-header">
          {/* User avatar with initials */}
          <div className="profile-avatar" title={user?.username || 'Space Explorer'}>
            {getInitials(user?.username)}
          </div>
          
          {/* User information section */}
          <div className="profile-info">
            {/* Username with cosmic title */}
            <h1>{user?.username}'s Cosmic Profile</h1>
            
            {/* User role with appropriate icon */}
            <p className="profile-role">
              {user?.role === "STUDENT" ? "Vocabulary Cadet" : "Fleet Commander"} 
              {user?.role === "STUDENT" ? "🚀" : "👨‍🚀"}
            </p>
            
            {/* User email */}
            <p className="profile-email">{user?.email}</p>
            
            {/* Level progression section */}
            <div className="level-container">
              <p>Level 1: Cosmic Recruit</p>
              
              {/* Progress bar for level advancement */}
              <div className="progress-container">
                <div className="progress-bar" style={{ width: "10%" }}></div>
              </div>
              
              {/* Level stats and next level information */}
              <div className="level-info">
                <span>0 / 100 Stellar Points</span>
                <span>Next: Level 2 - Space Navigator</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* User statistics cards */}
        <div className="profile-stats">
          {/* Words discovered stat */}
          <div className="stat-card">
            <div className="stat-icon">🪐</div>
            <div className="stat-value">0</div>
            <div className="stat-label">Words Discovered</div>
          </div>
          
          {/* Missions completed stat */}
          <div className="stat-card">
            <div className="stat-icon">🛸</div>
            <div className="stat-value">0</div>
            <div className="stat-label">Missions Completed</div>
          </div>
          
          {/* Day streak stat */}
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">0</div>
            <div className="stat-label">Day Orbit</div>
          </div>
          
          {/* Rewards stat */}
          <div className="stat-card">
            <div className="stat-icon">💫</div>
            <div className="stat-value">0</div>
            <div className="stat-label">Cosmic Rewards</div>
          </div>
        </div>
        
        {/* Lower profile content sections */}
        <div className="profile-sections">
          {/* Recent activity section */}
          <div className="profile-section">
            <h2>Recent Expeditions</h2>
            
            {/* Empty state when no activities exist */}
            <div className="activity-empty">
              <p>Your mission log is empty. Begin your first vocabulary expedition!</p>
              <button className="quest-button">Launch New Mission</button>
            </div>
          </div>
          
          {/* Achievements/badges section */}
          <div className="profile-section">
            <h2>Space Medals</h2>
            
            {/* List of available achievements */}
            <div className="achievements-list">
              {/* Locked achievement 1 */}
              <div className="achievement locked">
                <div className="achievement-icon">🔒</div>
                <div className="achievement-info">
                  <h3>Vocabulary Astronaut</h3>
                  <p>Master your first 10 cosmic vocabulary terms</p>
                </div>
              </div>
              
              {/* Locked achievement 2 */}
              <div className="achievement locked">
                <div className="achievement-icon">🔒</div>
                <div className="achievement-info">
                  <h3>Orbital Scholar</h3>
                  <p>Maintain a 5-day learning orbit</p>
                </div>
              </div>
              
              {/* Locked achievement 3 */}
              <div className="achievement locked">
                <div className="achievement-icon">🔒</div>
                <div className="achievement-info">
                  <h3>Galactic Wordsmith</h3>
                  <p>Complete all beginner level word missions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;