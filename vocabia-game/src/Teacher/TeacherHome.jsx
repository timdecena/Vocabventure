import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Welcome, Teacher!</h2>
      <p>This is your dashboard.</p>
      <button onClick={() => navigate('/teacher/classes')}>My Classes</button>
      <button onClick={() => navigate('/teacher/classes/create')} style={{ marginLeft: 8 }}>Create Class</button>
      <br /><br />
      {/* Added Button to Create 4 Pics 1 Word Level */}
      <button onClick={() => navigate('/teacher/game/4pics1word/create')}>Create 4 Pics 1 Word Level</button>
      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default TeacherHome;
