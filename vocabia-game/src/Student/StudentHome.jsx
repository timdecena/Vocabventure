import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const StudentHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/student/classes");
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };

    fetchClasses();
  }, []);

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
      <button onClick={() => navigate('/student/word-of-the-day')} style={{ marginLeft: 8 }}>Word of The Day</button>
      <button onClick={() => navigate('/leaderboard/wotd')} style={{ marginLeft: 8 }}>Word of The Day Leaderboard</button>

      <h3 style={{ marginTop: 30 }}>📚 Your Classes with Spelling Challenge:</h3>
      {classes.map((cls) => (
        <div key={cls.id} style={{ marginBottom: 10 }}>
          <b>{cls.name}</b>
          <button
            onClick={() => navigate(`/student/classes/${cls.id}/spelling-challenge`)}
            style={{ marginLeft: 10 }}
          >
            Start Challenge
          </button>
        </div>
      ))}

      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StudentHome;
