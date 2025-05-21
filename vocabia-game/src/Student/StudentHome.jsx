import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentHome({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);  // Update state
    navigate('/login');
  };

  return (
    <div>
      <h1>Student Home</h1>
      <p>Welcome, student!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
