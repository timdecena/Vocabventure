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
        background: "#212e36",
        color: "#fff",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px #0002",
      }}
    >
      {role === "STUDENT" && (
        <>
          <button onClick={() => navigate("/student-home")} style={navBtnStyle}>Home</button>
          <button onClick={() => navigate("/student/classes")} style={navBtnStyle}>Classes</button>
          <button onClick={() => navigate("/student/adventure")} style={navBtnStyle}>Adventure Mode</button>

        </>
      )}
      {role === "TEACHER" && (
        <>
          <button onClick={() => navigate("/teacher-home")} style={navBtnStyle}>Home</button>
          <button onClick={() => navigate("/teacher/classes")} style={navBtnStyle}>Classes</button>
          <button onClick={handleCustomWordListClick} style={navBtnStyle}>
            Custom Word Lists
          </button>
          {/* Optional: Show current class and allow change */}
          {classId && (
            <span style={{ marginLeft: 10, color: "#00ffaa" }}>
              | Current Class: <b>{classId}</b> <button style={navBtnStyle} onClick={handleChangeClass}>Change</button>
            </span>
          )}
        </>
      )}
      {(role === "STUDENT" || role === "TEACHER") && (
        <button
          onClick={onLogout}
          style={{ ...navBtnStyle, marginLeft: "auto", background: "#ff5555", color: "#fff" }}
        >
          Logout
        </button>
      )}
    </nav>
  );
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
  transition: "background 0.2s",
};

export default Navbar;
