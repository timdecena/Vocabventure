import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsAuthenticated, setRole }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async e => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:8080/api/auth/login', form);
    const { token, role } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // 🛠 Important line

    setIsAuthenticated(true);
    setRole(role);

    if (role === 'STUDENT') {
      navigate('/student-home');
    } else if (role === 'TEACHER') {
      navigate('/teacher-home');
    } else {
      setMessage('Unknown user role.');
    }
  } catch (err) {
    console.error(err);
    setMessage('Login failed. Please check your credentials.');
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br /><br />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br /><br />
        <button type="submit">Login</button>
      </form>
      <br />
      <button onClick={() => navigate('/register')}>Register</button>
      {message && <p>{message}</p>}
    </div>
  );
}
