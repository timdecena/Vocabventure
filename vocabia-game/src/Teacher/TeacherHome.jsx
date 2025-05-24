import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

<<<<<<< HEAD
const TeacherHome = ({ setIsAuthenticated }) => {
=======
export default function TeacherHome({ setIsAuthenticated }) {
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
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
<<<<<<< HEAD
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Welcome, Teacher!</h2>
      <p>This is your dashboard.</p>
      <button onClick={() => navigate('/teacher/classes')}>My Classes</button>
      <button onClick={() => navigate('/teacher/classes/create')} style={{ marginLeft: 8 }}>Create Class</button>
      <br /><br />
=======
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
>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default TeacherHome;
