// File: src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Support  from "./pages/Support";
import Adventure from './pages/Adventure';
import TimeAttack from './pages/TimeAttack';
import FourPics from './pages/FourPics';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          {/* Add other routes like /profile later */}


          {/* added by bagarinao */}
          <Route path="/home" element={<Homepage />} />
          <Route path="/support"   element={<Support />} />
          
          {/* link path for the games */}
          <Route path="/game/adventure" element={<Adventure />} />
          <Route path="/game/time-attack" element={<TimeAttack />} />
          <Route path="/game/4pics1word" element={<FourPics />} />

        </Routes>
    </Router>
  );
}

export default App;
