import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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
      {/* Global Mode */}
      <button onClick={() => navigate('/game/4pics1word/global')}>
        Play 4 Pics 1 Word (Global)
      </button>
      <br /><br />
      {/* Class Mode (No prompt, direct access) */}
      <button onClick={() => navigate('/game/4pics1word/class')}>
        Play 4 Pics 1 Word (Class Levels)
      </button>
      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StudentHome;
