import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './RightSidebar.css';

export default function RightSidebar() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [quests, setQuests] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get('/api/users/online', authHeaders)
      .then(res => setOnlineUsers(res.data))
      .catch(() => setOnlineUsers([]));

    axios
      .get('/api/users/achievements', authHeaders)
      .then(res => setAchievements(res.data))
      .catch(() => setAchievements([]));

    axios
      .get('/api/users/quests', authHeaders)
      .then(res => setQuests(res.data))
      .catch(() => setQuests([]));
  }, [token]);

  const toggleQuest = idx => {
    setQuests(qs =>
      qs.map((q, i) =>
        i === idx ? { ...q, completed: !q.completed } : q
      )
    );
  };

  return (
    <aside className="right-sidebar">

      {/* Other Users */}
      <div className="right-section">
        <div className="section-title">Other Users Online</div>
        {onlineUsers.length ? (
          <div className="avatar-list">
            {onlineUsers.map(u => (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                className="avatar-small"
                title={u.username}
              >
                <img src={u.avatarUrl} alt={u.username} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-data">Nobody’s online</div>
        )}
      </div>

      {/* Achievements */}
      <div className="right-section">
        <div className="section-title">
          <span>Achievements</span>
          <Link to="/achievements" className="view-all">View all</Link>
        </div>
        {achievements.length ? (
          <div className="achievements-grid">
            {achievements.slice(0, 3).map((ach, i) => (
              <div key={i} className="achievement-icon" title={ach.name}>
                <img src={ach.iconUrl} alt={ach.name} />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No achievements yet</div>
        )}
      </div>

      {/* Quests */}
      <div className="right-section">
        <div className="section-title">Quests</div>
        {quests.length ? (
          <ul className="quests-list">
            {quests.map((q, i) => (
              <li
                key={i}
                className={q.completed ? 'quest-completed' : ''}
                onClick={() => toggleQuest(i)}
              >
                <input
                  type="checkbox"
                  checked={q.completed}
                  onChange={() => toggleQuest(i)}
                />
                <span className="quest-text">{q.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-data">No active quests</div>
        )}
      </div>

    </aside>
  );
}
