import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherHome({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false); // Update auth state in App
    navigate('/login');
  };

  return (
    <div>
      <h1>Teacher Home</h1>
      <p>Welcome, teacher!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
