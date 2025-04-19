import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdventureLevelsList from "./pages/AdventureLevelsList";
import AdventureLevelDetails from "./pages/AdventureLevelDetails";
import CreateAdventureLevel from "./pages/CreateAdventureLevel";
import AddWordToLevel from "./pages/AddWordToLevel";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        {/* Adventure Features */}
        <Route path="/adventure-levels" element={<AdventureLevelsList />} />
        <Route path="/adventure-level/:id" element={<AdventureLevelDetailsWrapper />} />
        <Route path="/create-adventure-level" element={<CreateAdventureLevel />} />
        <Route path="/add-word/:id" element={<AddWordToLevelWrapper />} />
      </Routes>
    </Router>
  );
}

// Wrapper components to extract URL params
function AdventureLevelDetailsWrapper() {
  const { id } = useParams();
  return <AdventureLevelDetails levelId={id} />;
}

function AddWordToLevelWrapper() {
  const { id } = useParams();
  return <AddWordToLevel levelId={id} />;
}

export default App;
