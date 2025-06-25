// components/Navbar.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Navbar = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Custom Word List Game Mode: Class Picker START ---
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Helper to get current classId
  const classId = localStorage.getItem("currentClassId");

  const handleCustomWordListClick = async () => {
    if (!classId) {
      setShowClassPicker(true);
      setLoadingClasses(true);
      // Fetch teacher's classes (adjust endpoint if needed)
      try {
        const res = await axios.get("http://localhost:8080/api/teacher/classes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setClasses(res.data);
      } catch (err) {
        alert("Failed to load your classes.");
      }
      setLoadingClasses(false);
      return;
    }
    navigate(`/teacher/classes/${classId}/wordlists`);
  };

  const handleClassSelect = (selectedId) => {
    localStorage.setItem("currentClassId", selectedId);
    setShowClassPicker(false);
    navigate(`/teacher/classes/${selectedId}/wordlists`);
  };

  const handleChangeClass = () => {
    localStorage.removeItem("currentClassId");
    setShowClassPicker(true);
  };
  // --- Custom Word List Game Mode: Class Picker END ---

  // Hide Navbar on login and register pages
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav
      style={{
        width: "100%",
        background: "#18181b",
        color: "#fff",
        padding: "12px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 20,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 0 20px #00eaff80",
        borderBottom: "1px solid #00eaff"
      }}
    >
      <span style={logoStyle} onClick={() => navigate(role === 'STUDENT' ? '/student-home' : '/teacher-home')}>VocabVenture</span>
      
      {role === "STUDENT" && (
        <>
          <NavButton onClick={() => navigate("/student-home")}>Home</NavButton>
          <NavButton onClick={() => navigate("/student/classes")}>Classes</NavButton>
          <NavButton onClick={() => navigate("/student/adventure")}>Adventure</NavButton>
          <NavButton onClick={() => navigate("/student/profile")}>Profile</NavButton>
        </>
      )}
      {role === "TEACHER" && (
        <>
          <NavButton onClick={() => navigate("/teacher-home")}>Home</NavButton>
          <NavButton onClick={() => navigate("/teacher/classes")}>Classes</NavButton>
          <NavButton onClick={handleCustomWordListClick}>Custom Word Lists</NavButton>
          <NavButton onClick={() => navigate("/teacher/profile")}>Profile</NavButton>
          {classId && (
            <span style={{ display: 'flex', alignItems: 'center', marginLeft: 10, color: "#00ffaa" }}>
              | <NavButton onClick={handleChangeClass}>Change Class</NavButton>
            </span>
          )}
        </>
      )}

      {(role === "STUDENT" || role === "TEACHER") && (
        <NavButton
          onClick={onLogout}
          style={{ ...logoutBtnStyle, marginLeft: 'auto',marginRight: '40px' }}
        >
          Logout
        </NavButton>
      )}
    </nav>
  );
};

const logoStyle = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "1.5rem",
  color: "#fff",
  textShadow: "0 0 4px #fff, 0 0 12px #ff00c8, 0 0 24px #ff00c8",
  cursor: "pointer",
  marginRight: '20px'
};

const navBtnStyle = {
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: "bold",
  padding: "8px 16px",
  borderRadius: "8px",
  transition: "all 0.2s",
  fontFamily: "'Press Start 2P', cursive",
  textShadow: "0 0 8px #00eaff",
  letterSpacing: '1px'
};

const logoutBtnStyle = {
  background: 'transparent',
  border: '2px solid #ff5555',
  color: '#ff5555',
  textShadow: '0 0 8px #ff5555',
};

const hoverStyle = {
  background: "#00eaff22",
  color: "#fff",
  textShadow: "0 0 12px #ff00c8, 0 0 4px #fff",
  transform: 'scale(1.05)'
};

const logoutHoverStyle = {
  background: "#ff555533",
  color: '#fff',
  textShadow: '0 0 12px #ff5555, 0 0 4px #fff'
}

// Add hover effects using onMouseOver and onMouseOut
const NavButton = ({ onClick, children, style }) => {
  const [hover, setHover] = useState(false);
  
  const isLogout = style && style.color === '#ff5555';
  const currentHoverStyle = isLogout ? logoutHoverStyle : hoverStyle;

  return (
    <button
      onClick={onClick}
      style={{ ...navBtnStyle, ...style, ...(hover ? currentHoverStyle : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

export default Navbar;
