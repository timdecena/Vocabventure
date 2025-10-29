// File: src/App.js
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
import TeacherAnalyticsPage from './Teacher/TeacherAnalyticsPage';
import TeacherWordListsPage from './Teacher/TeacherWordListsPage';

// Student
import StudentHome from './Student/StudentHome';
import StudentClassListPage from './Student/StudentClassListPage';
import StudentClassmatesPage from './Student/StudentClassmatesPage';
import StudentViewClassPage from './Student/StudentViewClassPage';

// Four Pic One Word game - Dynamic
import CategoryList from './FourPicOneWordGame/CategoryList';
import LevelList from './FourPicOneWordGame/LevelList';
import GamePlay from './FourPicOneWordGame/GamePlay';
import TeacherCreateFPOW from './FourPicOneWordGame/TeacherCreateFPOW';

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
import WatersideShores from "./Adventure/island2(watersideshores)/WatersideShores";
import WatersideShoresLevel1 from "./Adventure/island2(watersideshores)/WatersideShoresLevel1";
import WatersideShoresLevel2 from "./Adventure/island2(watersideshores)/WatersideShoresLevel2";
import WatersideShoresLevel3 from "./Adventure/island2(watersideshores)/WatersideShoresLevel3";
import WatersideShoresLevel4 from "./Adventure/island2(watersideshores)/WatersideShoresLevel4";
import WatersideShoresLevel5 from "./Adventure/island2(watersideshores)/WatersideShoresLevel5";
import ShadowIsles from "./Adventure/island3(ShadowIsles)/ShadowIsles";
import ShadowIslesLevel1 from "./Adventure/island3(ShadowIsles)/ShadowIslesLevel1";
import ShadowIslesLevel2 from "./Adventure/island3(ShadowIsles)/ShadowIslesLevel2";
import ShadowIslesLevel3 from "./Adventure/island3(ShadowIsles)/ShadowIslesLevel3";
import ShadowIslesLevel4 from "./Adventure/island3(ShadowIsles)/ShadowIslesLevel4";
import ShadowIslesLevel5 from "./Adventure/island3(ShadowIsles)/ShadowIslesLevel5";
import Tutorial from "./Adventure/tutorial/Tutorial";

// Profile
import Profile from './components/Profile';

import './App.css';
import theme from './theme/theme';
import TeacherLayout from './Teacher/components/TeacherLayout';
import { UserProvider } from './UserContext';
import GlobalAudio from './sound/GlobalAudio';
import SiteAudioControls from './components/SiteAudioControls';
import AdventureAudio from './sound/AdventureAudio';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthStatus = () => {
    setIsAuthenticated(authService.isAuthenticated());
    setRole(authService.getRole());
  };

  useEffect(() => {
    // Initial authentication check with token validation
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setRole(null);
          setIsLoading(false);
          return;
        }

        // Validate the token before considering user authenticated
        const validationResult = await authService.validateToken();
        if (validationResult.valid) {
          setIsAuthenticated(true);
          setRole(authService.getRole());
        } else {
          // Token is invalid, clear it
          authService.clearAuth();
          setIsAuthenticated(false);
          setRole(null);
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error);
        authService.clearAuth();
        setIsAuthenticated(false);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

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

  // Show loading screen while validating authentication
  if (isLoading) {
    return (
      <div className="App" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Validating authentication...
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <TokenRefresher />
        <BrowserRouter>
          <GlobalAudio />
          <AdventureAudio />
          <SiteAudioControls />
          <UserProvider>
            <AppContent
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
              role={role}
              setRole={setRole}
              needsNavPadding={needsNavPadding}
              handleLogout={handleLogout}
            />
          </UserProvider>
        </BrowserRouter>
      </div>
    </ThemeProvider>
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
    "/waterside-shores",
    "/shadow-isles",
    "/tutorial"
  ];
  const isAdventurePage = adventurePrefixes.some(path =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isTeacherPage = location.pathname === '/teacher-home' || location.pathname.startsWith('/teacher/');
  const hideNavbar = isAdventurePage || isTeacherPage;

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
          ? (
              <TeacherLayout>
                <TeacherHome />
              </TeacherLayout>
            )
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherClassListPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes/create" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherCreateClassPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes/:id/edit" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherEditClassPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes/:id" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherViewClassPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes/:id/students" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherClassStudentsPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes/:classId/fpow-progress" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherFPOWProgressPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/classes/:classId/students/:studentId/fpow-progress" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherStudentFPOWProgressPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/analytics" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherAnalyticsPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/word-lists" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherWordListsPage /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
      <Route path="/teacher/profile" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><Profile /></TeacherLayout>
          : <Navigate to="/" replace />
      } />

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
      <Route path="/student/profile" element={isAuthenticated && role === 'STUDENT' ? <Profile /> : <Navigate to="/" replace />} />

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

      <Route path="/teacher/fpow/create" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherCreateFPOW /></TeacherLayout>
          : <Navigate to="/" replace />
      } />

      {/* SPELLING GAME */}
      <Route path="/teacher/spelling/create" element={
        isAuthenticated && role === 'TEACHER'
          ? <TeacherLayout><TeacherCreateSpellingChallenge /></TeacherLayout>
          : <Navigate to="/" replace />
      } />
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
      <Route path="/waterside-shores" element={<WatersideShores />} />
      <Route path="/waterside-shores/level1" element={<WatersideShoresLevel1 />} />
      <Route path="/waterside-shores/level2" element={<WatersideShoresLevel2 />} />
      <Route path="/waterside-shores/level3" element={<WatersideShoresLevel3 />} />
      <Route path="/waterside-shores/level4" element={<WatersideShoresLevel4 />} />
      <Route path="/waterside-shores/level5" element={<WatersideShoresLevel5 />} />
      <Route path="/shadow-isles" element={<ShadowIsles />} />
      <Route path="/shadow-isles/level1" element={<ShadowIslesLevel1 />} />
      <Route path="/shadow-isles/level2" element={<ShadowIslesLevel2 />} />
      <Route path="/shadow-isles/level3" element={<ShadowIslesLevel3 />} />
      <Route path="/shadow-isles/level4" element={<ShadowIslesLevel4 />} />
      <Route path="/shadow-isles/level5" element={<ShadowIslesLevel5 />} />

      {/* DEBUG */}
      <Route path="/debug/jwt" element={<JwtDebugger />} />

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
