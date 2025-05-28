import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const StudentHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [challengesByClass, setChallengesByClass] = useState({});
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, completedRes] = await Promise.all([
          api.get("/student/classes"),
          api.get("/game/spelling/completed"),
        ]);
        const classList = classRes.data;
        setClasses(classList);
        setCompletedChallengeIds(completedRes.data);

        // Fetch challenges for each class
        const challengeFetches = await Promise.all(
          classList.map(cls => api.get(`/game/spelling/${cls.id}`))
        );

        const byClass = {};
        classList.forEach((cls, i) => {
          byClass[cls.id] = challengeFetches[i].data;
        });

        setChallengesByClass(byClass);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
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
      {classes.map(cls => {
        const challenges = challengesByClass[cls.id] || [];

        const allAttempted = challenges.length > 0 &&
          challenges.every(ch => completedChallengeIds.includes(ch.id));

        return (
          <div key={cls.id} style={{ marginBottom: 10 }}>
            <b>{cls.name}</b>
            {challenges.length === 0 ? (
              <span style={{ marginLeft: 10, color: 'gray' }}>No Challenge Available</span>
            ) : (
              <button
                onClick={() => navigate(`/student/classes/${cls.id}/spelling-challenge`)}
                style={{ marginLeft: 10 }}
                disabled={allAttempted}
                title={allAttempted ? "You already completed all challenges" : ""}
              >
                {allAttempted ? "Already Attempted" : "Start Challenge"}
              </button>
            )}
          </div>
        );
      })}

      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StudentHome;
