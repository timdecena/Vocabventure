import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Just clear local storage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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
