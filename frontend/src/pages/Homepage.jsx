// src/pages/Homepage.jsx
import React, { useEffect, useState } from 'react';
import '../styles/Homepage.css';
import Sidebar      from '../components/Sidebar';
import TopBar       from '../components/TopBar';
import MainContent  from '../components/MainContent';
import RightSidebar from '../components/RightSidebar';
import Navbar       from '../components/Navbar';
import TeacherDashboard from '../pages/Teacher/TeacherDashboard';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setRole(user.role?.toLowerCase());
  }, [navigate]);

  if (!role) {
    return null; // or a loading spinner while checking role
  }

  // Render different components based on role
  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  // Default to student homepage layout
  return (
    <>
      <Navbar />
      <div className="container">
        <Sidebar />
        <main className="main">
          <TopBar />
          <div className="content-card">
            <MainContent />
          </div>
        </main>
        <RightSidebar />
      </div>
    </>
  );
}
