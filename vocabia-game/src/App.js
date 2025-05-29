import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './Pages/Navbar';

// Auth
import Login from './Pages/Login';
import Register from './Pages/Register';

// Teacher
import TeacherHome from './Teacher/TeacherHome';
import TeacherClassListPage from './Teacher/TeacherClassListPage';
import TeacherClassStudentsPage from './Teacher/TeacherClassStudentsPage';
import TeacherCreateClassPage from './Teacher/TeacherCreateClassPage';
import TeacherEditClassPage from './Teacher/TeacherEditClassPage';
import TeacherViewClassPage from './Teacher/TeacherViewClassPage';

// Student
import StudentHome from './Student/StudentHome';
import StudentClassListPage from './Student/StudentClassListPage';
import StudentClassmatesPage from './Student/StudentClassmatesPage';
import StudentJoinClassPage from './Student/StudentJoinClassPage';
import StudentViewClassPage from './Student/StudentViewClassPage';

// Word of the Day
import WOTDLeaderboardPage from './WordOfTheDay/WOTDLeaderboardPage';
import StudentWordOfTheDay from './WordOfTheDay/StudentWordOfTheDay';

// Spelling Game
import TeacherCreateSpellingChallenge from "./SpellingGame/TeacherCreateSpellingChallenge";
import StudentSpellingChallenge from "./SpellingGame/StudentSpellingChallenge";
import StudentSpellingLevelList from './SpellingGame/StudentSpellingLevelList';

// ✅ Adventure Mode
import Adventure from "./Adventure/Adventure";
import JungleLush from "./Adventure/JungleLush";
import MapView from "./Adventure/MapView";
import JungleLushLevel1 from "./Game/JungleLushLevel1";
import JungleLushLevel2 from "./Game/JungleLushLevel2";
import JungleLushLevel3 from "./Game/JungleLushLevel3";


import './App.css';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
    window.location.href = '/';
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar role={role} onLogout={handleLogout} />
        <div style={{ paddingTop: (role === 'STUDENT' || role === 'TEACHER') ? 72 : 0 }}>
          <Routes>
            {/* Auth */}
            <Route path="/" element={
              isAuthenticated
                ? role === 'STUDENT'
                  ? <Navigate to="/student-home" replace />
                  : <Navigate to="/teacher-home" replace />
                : <Login setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
            } />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

            {/* Home */}
            <Route path="/student-home" element={isAuthenticated && role === 'STUDENT' ? <StudentHome setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />} />
            <Route path="/teacher-home" element={isAuthenticated && role === 'TEACHER' ? <TeacherHome setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />} />

            {/* Teacher */}
            <Route path="/teacher/classes" element={isAuthenticated && role === 'TEACHER' ? <TeacherClassListPage /> : <Navigate to="/" replace />} />
            <Route path="/teacher/classes/create" element={isAuthenticated && role === 'TEACHER' ? <TeacherCreateClassPage /> : <Navigate to="/" replace />} />
            <Route path="/teacher/classes/:id/edit" element={isAuthenticated && role === 'TEACHER' ? <TeacherEditClassPage /> : <Navigate to="/" replace />} />
            <Route path="/teacher/classes/:id" element={isAuthenticated && role === 'TEACHER' ? <TeacherViewClassPage /> : <Navigate to="/" replace />} />
            <Route path="/teacher/classes/:id/students" element={isAuthenticated && role === 'TEACHER' ? <TeacherClassStudentsPage /> : <Navigate to="/" replace />} />

            {/* Student */}
            <Route path="/student/classes" element={isAuthenticated && role === 'STUDENT' ? <StudentClassListPage /> : <Navigate to="/" replace />} />
            <Route path="/student/classes/join" element={isAuthenticated && role === 'STUDENT' ? <StudentJoinClassPage /> : <Navigate to="/" replace />} />
            <Route path="/student/classes/:id" element={isAuthenticated && role === 'STUDENT' ? <StudentViewClassPage /> : <Navigate to="/" replace />} />
            <Route path="/student/classes/:id/classmates" element={isAuthenticated && role === 'STUDENT' ? <StudentClassmatesPage /> : <Navigate to="/" replace />} />

            {/* Spelling Challenge */}
            <Route path="/teacher/spelling/create" element={isAuthenticated && role === 'TEACHER' ? <TeacherCreateSpellingChallenge /> : <Navigate to="/" replace />} />
            <Route path="/student/classes/:classId/spelling-challenge" element={isAuthenticated && role === 'STUDENT' ? <StudentSpellingChallenge /> : <Navigate to="/" replace />} />
            <Route path="/student/classes/:classId/spelling-levels" element={isAuthenticated && role === 'STUDENT' ? <StudentSpellingLevelList /> : <Navigate to="/" replace />} />

            {/* Word of the Day */}
            <Route path="/student/word-of-the-day" element={isAuthenticated && role === 'STUDENT' ? <StudentWordOfTheDay /> : <Navigate to="/" replace />} />
            <Route path="/leaderboard/wotd" element={<WOTDLeaderboardPage />} />

            {/* ✅ Adventure Mode */}
            <Route path="/student/adventure" element={isAuthenticated && role === 'STUDENT' ? <Adventure /> : <Navigate to="/" replace />} />
            <Route path="/adventure" element={<Adventure />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/jungle-lush" element={<JungleLush />} />
            <Route path="/jungle-lush/level1" element={<JungleLushLevel1 />} />
            <Route path="/jungle-lush/level2" element={<JungleLushLevel2 />} />
            <Route path="/jungle-lush/level3" element={<JungleLushLevel3 />} />





            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
