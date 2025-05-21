import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import StudentHome from './Student/StudentHome';
import TeacherHome from './Teacher/TeacherHome';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role')); // role stored after login

  const updateAuthStatus = () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  };

  useEffect(() => {
    window.addEventListener('storage', updateAuthStatus);
    return () => window.removeEventListener('storage', updateAuthStatus);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
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

        <Route
          path="/student-home"
          element={isAuthenticated && role === 'STUDENT' ? <StudentHome /> : <Navigate to="/" replace />}
        />

        <Route
          path="/teacher-home"
          element={isAuthenticated && role === 'TEACHER' ? <TeacherHome /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
