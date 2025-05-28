import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login    from "./pages/Login";
import Register from "./pages/Register";

import Support  from "./pages/Support";
import Adventure from "./pages/Adventure";
import TimeAttack from "./pages/TimeAttack";
import FourPics  from "./pages/FourPics";

import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import TeacherCreateClass from "./pages/Teacher/TeacherCreateClass";
import TutorialSequence from "./components/tutorial/TutorialSequence";
import MapView from "./pages/MapView";
import IslandLevels from "./pages/IslandLevels";

// Import Game components
import GameCategories from "./pages/Game/GameCategories";
import GameLevels from "./pages/Game/GameLevels";
import GamePlay from "./pages/Game/GamePlay";
import CommawidowLevel from "./pages/Game/CommawidowLevel";

import JungleLush from "./pages/JungleLush";
import JungleLushLevel1 from "./pages/Game/JungleLushLevel1";
import JungleLushLevel2 from "./pages/Game/JungleLushLevel2";
import JungleLushLevel3 from "./pages/Game/JungleLushLevel3";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/"          element={<Navigate to="/login" replace />} />

        {/* after logging in we'll land here */}
        <Route path="/home"      element={<Homepage />} />
        <Route path="/support"   element={<Support    />} />
        <Route path="/adventure" element={<Adventure />} />
        <Route path="/tutorial" element={<TutorialSequence />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/island/:islandId" element={<IslandLevels />} />
        <Route path="/game/time-attack"  element={<TimeAttack />} />
        <Route path="/game/4pics1word"   element={<FourPics  />} />

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

        {/* Jungle Lush Routes */}
        <Route path="/jungle-lush" element={<JungleLush />} />
        <Route path="/jungle-lush/level1" element={<JungleLushLevel1 />} />
        <Route path="/jungle-lush/level2" element={<JungleLushLevel2 />} />
        <Route path="/jungle-lush/level3" element={<JungleLushLevel3 />} />

      </Routes>
    </Router>
  );
}

export default App;
