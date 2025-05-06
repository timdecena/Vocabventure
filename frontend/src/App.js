// File: src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import TeacherCreateClass from "./pages/Teacher/TeacherCreateClass";

// Import Game components
import GameCategories from "./pages/Game/GameCategories";
import GameLevels from "./pages/Game/GameLevels";
import GamePlay from "./pages/Game/GamePlay";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/create-class" element={<TeacherCreateClass />} />
        
        {/* 4 Pics 1 Word Game Routes */}
        <Route path="/game" element={<GameCategories />} />
        <Route path="/game/levels/:category" element={<GameLevels />} />
        <Route path="/game/play/:category/:levelNumber" element={<GamePlay />} />
      </Routes>
    </Router>
  );
}

export default App;
