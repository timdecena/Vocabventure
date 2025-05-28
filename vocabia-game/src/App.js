import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Auth
import Login from './Pages/Login';
import Register from './Pages/Register';

// Teacher pages
import TeacherHome from './Teacher/TeacherHome';
import TeacherClassListPage from './Teacher/TeacherClassListPage';
import TeacherClassStudentsPage from './Teacher/TeacherClassStudentsPage';
import TeacherCreateClassPage from './Teacher/TeacherCreateClassPage';
import TeacherEditClassPage from './Teacher/TeacherEditClassPage';
import TeacherViewClassPage from './Teacher/TeacherViewClassPage';
import GameManagement from './Teacher/GameManagement';

// Student pages
import StudentHome from './Student/StudentHome';
import StudentClassListPage from './Student/StudentClassListPage';
import StudentClassmatesPage from './Student/StudentClassmatesPage';
import StudentJoinClassPage from './Student/StudentJoinClassPage';
import StudentViewClassPage from './Student/StudentViewClassPage';

// Game pages (split: Category > Level > Play)
import CategoryList from './FourPicOneWordGame/CategoryList';
import LevelList from './FourPicOneWordGame/LevelList';
import GamePlay from './FourPicOneWordGame/GamePlay';

import './App.css';

// Classroom mode: You can use a prop to indicate classId, or redirect to game flow for now
function FourPicOneWordGameWithClass() {
  const { classId } = useParams();
  // For now, just show the CategoryList with a classId prop if needed
  // You can build a custom classroom flow later!
  return <CategoryList classId={classId} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const updateAuthStatus = () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  };

  useEffect(() => {
    window.addEventListener('storage', updateAuthStatus);
    return () => window.removeEventListener('storage', updateAuthStatus);
  }, []);

  return (
    <div className="App">
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
          <Route path="/teacher/game-management" element={isAuthenticated && role === 'TEACHER' ? <GameManagement /> : <Navigate to="/" replace />} />

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

          {/* STUDENT: PLAY 4 PICS 1 WORD in Classroom */}
          <Route path="/student/classes/:classId/4pic1word" element={
            isAuthenticated && role === 'STUDENT'
              ? <FourPicOneWordGameWithClass />
              : <Navigate to="/" replace />
          } />

          {/* GAME FLOW: PUBLIC CATEGORY/LEVEL/PAGE (for all students) */}
          <Route path="/4pic1word" element={
            isAuthenticated && role === 'STUDENT'
              ? <CategoryList />
              : <Navigate to="/" replace />
          } />
          <Route path="/4pic1word/levels/:category" element={
            isAuthenticated && role === 'STUDENT'
              ? <LevelList />
              : <Navigate to="/" replace />
          } />
          <Route path="/4pic1word/play/:category/:level" element={
            isAuthenticated && role === 'STUDENT'
              ? <GamePlay />
              : <Navigate to="/" replace />
          } />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
