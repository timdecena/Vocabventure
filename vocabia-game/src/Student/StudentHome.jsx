import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllGameData } from '../utils/localStorageUtils';


const StudentHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all game data from localStorage including auth tokens and progress
    clearAllGameData();
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Welcome, Student!</h2>
      <p>This is your dashboard.</p>
      <button onClick={() => navigate('/student/classes')}>My Classes</button>
      <button onClick={() => navigate('/student/classes/join')} style={{ marginLeft: 8 }}>Join Class</button>
      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StudentHome;
