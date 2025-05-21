import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherHome() {
  const navigate = useNavigate();
//test
  const handleLogout = () => {
    // Just clear local storage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <h1>Teacherasdasd Home</h1>
      <p>Welcome, teacher!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
