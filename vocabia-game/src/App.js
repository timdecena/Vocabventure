import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Note: React Router warnings about future flags can be safely ignored

// Auth utilities
import TokenRefresher from './utils/TokenRefresher';
import JwtDebugger from './utils/JwtDebugger';
import authService from './services/authService';

// Auth
import Login from './Pages/Login';
import Register from './Pages/Register';
// Debug components removed

// Teacher pages
import TeacherHome from './Teacher/TeacherHome';
import TeacherClassListPage from './Teacher/TeacherClassListPage';
import TeacherClassStudentsPage from './Teacher/TeacherClassStudentsPage';
import TeacherCreateClassPage from './Teacher/TeacherCreateClassPage';
import TeacherEditClassPage from './Teacher/TeacherEditClassPage';
import TeacherViewClassPage from './Teacher/TeacherViewClassPage';
import TeacherFPOWProgressPage from './Teacher/TeacherFPOWProgressPage';
import TeacherStudentFPOWProgressPage from './Teacher/TeacherStudentFPOWProgressPage';

// Student pages
import StudentHome from './Student/StudentHome';
import StudentClassListPage from './Student/StudentClassListPage';
import StudentClassmatesPage from './Student/StudentClassmatesPage';
import StudentJoinClassPage from './Student/StudentJoinClassPage';
import StudentViewClassPage from './Student/StudentViewClassPage';

// Four Pic One Word game - Dynamic (NEW)
import CategoryList from './FourPicOneWordGame/CategoryList';
import LevelList from './FourPicOneWordGame/LevelList';
import GamePlay from './FourPicOneWordGame/GamePlay';

import './App.css';

function App() {
  // Use authService for authentication checks
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [role, setRole] = useState(authService.getRole());

  const updateAuthStatus = () => {
    setIsAuthenticated(authService.isAuthenticated());
    setRole(authService.getRole());
  };

  useEffect(() => {
    window.addEventListener('storage', updateAuthStatus);
    return () => window.removeEventListener('storage', updateAuthStatus);
  }, []);

  return (
    <div className="App">
      <TokenRefresher />
      <BrowserRouter>
        <Routes>
          {/* AUTH ROUTES */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? role === 'STUDENT'
                  ? <Navigate to="/student-home" replace />
                  : <Navigate to="/teacher-home" replace />
                : <Login setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
            }
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
          />

          {/* TEACHER ROUTES */}
          <Route path="/teacher-home" element={
            isAuthenticated && role === 'TEACHER'
              ? <TeacherHome setIsAuthenticated={setIsAuthenticated} />
              : <Navigate to="/" replace />
          } />
          <Route path="/teacher/classes" element={isAuthenticated && role === 'TEACHER' ? <TeacherClassListPage /> : <Navigate to="/" replace />} />
          <Route path="/teacher/classes/create" element={isAuthenticated && role === 'TEACHER' ? <TeacherCreateClassPage /> : <Navigate to="/" replace />} />
          <Route path="/teacher/classes/:id/edit" element={isAuthenticated && role === 'TEACHER' ? <TeacherEditClassPage /> : <Navigate to="/" replace />} />
          <Route path="/teacher/classes/:id" element={isAuthenticated && role === 'TEACHER' ? <TeacherViewClassPage /> : <Navigate to="/" replace />} />
          <Route path="/teacher/classes/:id/students" element={isAuthenticated && role === 'TEACHER' ? <TeacherClassStudentsPage /> : <Navigate to="/" replace />} />
          <Route path="/teacher/classes/:classId/fpow-progress" element={isAuthenticated && role === 'TEACHER' ? <TeacherFPOWProgressPage /> : <Navigate to="/" replace />} />
          <Route path="/teacher/classes/:classId/students/:studentId/fpow-progress" element={isAuthenticated && role === 'TEACHER' ? <TeacherStudentFPOWProgressPage /> : <Navigate to="/" replace />} />
          {/* STUDENT ROUTES */}
          <Route path="/student-home" element={
            isAuthenticated && role === 'STUDENT'
              ? <StudentHome setIsAuthenticated={setIsAuthenticated} />
              : <Navigate to="/" replace />
          } />
          <Route path="/student/classes" element={isAuthenticated && role === 'STUDENT' ? <StudentClassListPage /> : <Navigate to="/" replace />} />
          <Route path="/student/classes/join" element={isAuthenticated && role === 'STUDENT' ? <StudentJoinClassPage /> : <Navigate to="/" replace />} />
          <Route path="/student/classes/:id" element={isAuthenticated && role === 'STUDENT' ? <StudentViewClassPage /> : <Navigate to="/" replace />} />
          <Route path="/student/classes/:id/classmates" element={isAuthenticated && role === 'STUDENT' ? <StudentClassmatesPage /> : <Navigate to="/" replace />} />

          {/* FOUR PIC ONE WORD GAME ROUTES (NEW) */}
          <Route
            path="/student/classes/:id/4pic1word"
            element={isAuthenticated && role === 'STUDENT' ? <CategoryList /> : <Navigate to="/" replace />}
          />
          <Route
            path="/student/classes/:id/4pic1word/:category"
            element={isAuthenticated && role === 'STUDENT' ? <LevelList /> : <Navigate to="/" replace />}
          />
          <Route
            path="/student/classes/:id/4pic1word/:category/level/:level"
            element={isAuthenticated && role === 'STUDENT' ? <GamePlay /> : <Navigate to="/" replace />}
          />

          {/* Debug Tools */}
          <Route path="/debug/jwt" element={<JwtDebugger />} />
          
          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
