// components/Navbar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide Navbar on login and register pages
  if (
    location.pathname === "/" ||
    location.pathname === "/register"
  ) {
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
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px #0002",
      }}
    >
      {role === "STUDENT" && (
        <>
          <button onClick={() => navigate("/student-home")} style={navBtnStyle}>
            Home
          </button>
          <button onClick={() => navigate("/student/classes")} style={navBtnStyle}>
            Classes
          </button>
          <button onClick={() => navigate("/student/classes/join")} style={navBtnStyle}>
            Join Class
          </button>
        </>
      )}
      {role === "TEACHER" && (
        <>
          <button onClick={() => navigate("/teacher-home")} style={navBtnStyle}>
            Home
          </button>
          <button onClick={() => navigate("/teacher/classes")} style={navBtnStyle}>
            Classes
          </button>
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
