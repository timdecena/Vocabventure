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
      <button onClick={() => navigate('/student/word-of-the-day')} style={{ backgroundColor: "#4caf50", color: "#fff", padding: "10px", marginTop: "16px" }}>
        🎯 Play Word of the Day
      </button>
      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StudentHome;
