import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function TeacherHome({ setIsAuthenticated }) {
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/classroom/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClass = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/classroom/create',
        { className },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClassName('');
      fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (classId, studentId) => {
    await axios.post(
      `http://localhost:8080/api/classroom/${classId}/accept/${studentId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchClasses();
  };

  const handleReject = async (classId, studentId) => {
    await axios.post(
      `http://localhost:8080/api/classroom/${classId}/reject/${studentId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchClasses();
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div>
      <h1>Teacher Home</h1>
      <input
        value={className}
        onChange={e => setClassName(e.target.value)}
        placeholder="Enter class name"
      />
      <button onClick={handleCreateClass}>Create Class</button>
      <hr />
      {classes.map(c => (
        <div key={c.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>{c.className}</h3>
          <h4>Pending Students</h4>
          {c.pendingRequests.length === 0 && <p>No pending students</p>}
          {c.pendingRequests.map(s => (
            <div key={s.id}>
              <p>
                {s.firstName} {s.lastName} - Section: {s.section}
              </p>
              <button onClick={() => handleAccept(c.id, s.id)}>Accept</button>
              <button onClick={() => handleReject(c.id, s.id)}>Reject</button>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
