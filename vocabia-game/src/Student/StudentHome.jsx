import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentHome({ setIsAuthenticated }) {
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/classroom/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/classroom/${id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Applied successfully!');
    } catch (err) {
      setMessage('Error applying to class.');
      console.error(err);
    }
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
      <h1>Student Home</h1>
      {message && <p>{message}</p>}
      <h3>Available Classes</h3>
      {classes.map(c => (
        <div key={c.id} style={{ border: '1px solid #ccc', padding: 10, margin: 10 }}>
          <h4>{c.className}</h4>
          <button onClick={() => handleApply(c.id)}>Apply</button>
        </div>
      ))}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
