// File: src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import TokenRefresher from './utils/TokenRefresher';
import JwtDebugger from './utils/JwtDebugger';
import authService from './services/authService';

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
import TeacherFPOWProgressPage from './Teacher/TeacherFPOWProgressPage';
import TeacherStudentFPOWProgressPage from './Teacher/TeacherStudentFPOWProgressPage';

// Student
import StudentHome from './Student/StudentHome';
import StudentClassListPage from './Student/StudentClassListPage';
import StudentClassmatesPage from './Student/StudentClassmatesPage';
import StudentViewClassPage from './Student/StudentViewClassPage';

// Four Pic One Word game - Dynamic
import CategoryList from './FourPicOneWordGame/CategoryList';
import LevelList from './FourPicOneWordGame/LevelList';
import GamePlay from './FourPicOneWordGame/GamePlay';

// Word of the Day
import WOTDLeaderboardPage from './WordOfTheDay/WOTDLeaderboardPage';
import StudentWordOfTheDay from './WordOfTheDay/StudentWordOfTheDay';

// Spelling Game
import TeacherCreateSpellingChallenge from "./SpellingGame/TeacherCreateSpellingChallenge";
import StudentSpellingChallenge from "./SpellingGame/StudentSpellingChallenge";
import StudentSpellingLevelList from './SpellingGame/StudentSpellingLevelList';

// Adventure Mode
import Adventure from "./Adventure/Adventure";
import JungleLush from "./Adventure/island1(junglelush)/JungleLush";
import MapView from "./Adventure/MapView";
import JungleLushLevel1 from "./Adventure/island1(junglelush)/JungleLushLevel1";
import JungleLushLevel2 from "./Adventure/island1(junglelush)/JungleLushLevel2";
import JungleLushLevel3 from "./Adventure/island1(junglelush)/JungleLushLevel3";
import JungleLushLevel4 from "./Adventure/island1(junglelush)/JungleLushLevel4";
import JungleLushLevel5 from "./Adventure/island1(junglelush)/JungleLushLevel5";
import Tutorial from "./Adventure/tutorial/Tutorial";

import './App.css';

function App() {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setRole(null);
    window.location.href = '/';
  };

  // For passing to children
  const needsNavPadding = role === 'STUDENT' || role === 'TEACHER';

  return (
    <div className="App">
      <TokenRefresher />
      <BrowserRouter>
        <AppContent
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          role={role}
          setRole={setRole}
          needsNavPadding={needsNavPadding}
          handleLogout={handleLogout}
        />
      </BrowserRouter>
    </div>
  );
}

function AppContent({ isAuthenticated, setIsAuthenticated, role, setRole, needsNavPadding, handleLogout }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Paths to HIDE navbar on
  const adventurePrefixes = [
    "/adventure",
    "/student/adventure",
    "/map",
    "/jungle-lush",
    "/tutorial"
  ];
  const hideNavbar = adventurePrefixes.some(path =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );

  const shouldAddPadding = needsNavPadding && !hideNavbar;

  return (
    <>
      {!hideNavbar && (
        <Navbar role={role} onLogout={handleLogout} />
      )}
      {shouldAddPadding ? (
        <div style={{ paddingTop: 72 }}>
          <AppRoutes
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            role={role}
            setRole={setRole}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>
      ) : (
        <AppRoutes
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          role={role}
          setRole={setRole}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
    </>
  );
}

function AppRoutes({ isAuthenticated, setIsAuthenticated, role, setRole, isSidebarOpen, setIsSidebarOpen }) {
  return (
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
          ? <StudentHome
              setIsAuthenticated={setIsAuthenticated}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          : <Navigate to="/" replace />
      } />
      <Route path="/student/classes" element={isAuthenticated && role === 'STUDENT' ? <StudentClassListPage /> : <Navigate to="/" replace />} />
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

      {/* SPELLING GAME */}
      <Route path="/teacher/spelling/create" element={isAuthenticated && role === 'TEACHER' ? <TeacherCreateSpellingChallenge /> : <Navigate to="/" replace />} />
      <Route path="/student/classes/:classId/spelling-challenge" element={isAuthenticated && role === 'STUDENT' ? <StudentSpellingChallenge /> : <Navigate to="/" replace />} />
      <Route path="/student/classes/:classId/spelling-levels" element={isAuthenticated && role === 'STUDENT' ? <StudentSpellingLevelList /> : <Navigate to="/" replace />} />

      {/* WORD OF THE DAY */}
      <Route path="/student/word-of-the-day" element={isAuthenticated && role === 'STUDENT' ? <StudentWordOfTheDay /> : <Navigate to="/" replace />} />
      <Route path="/leaderboard/wotd" element={<WOTDLeaderboardPage />} />

      {/* ✅ ADVENTURE MODE (NO NAVBAR) */}
      <Route path="/student/adventure" element={isAuthenticated && role === 'STUDENT' ? <Adventure /> : <Navigate to="/" replace />} />
      <Route path="/adventure" element={<Adventure />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/jungle-lush" element={<JungleLush />} />
      <Route path="/jungle-lush/level1" element={<JungleLushLevel1 />} />
      <Route path="/jungle-lush/level2" element={<JungleLushLevel2 />} />
      <Route path="/jungle-lush/level3" element={<JungleLushLevel3 />} />
      <Route path="/jungle-lush/level4" element={<JungleLushLevel4 />} />
      <Route path="/jungle-lush/level5" element={<JungleLushLevel5 />} />

      {/* DEBUG */}
      <Route path="/debug/jwt" element={<JwtDebugger />} />

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
