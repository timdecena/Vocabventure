import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsAuthenticated, setRole }) {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', form, { withCredentials: true });
      const user = res.data;

      // Store token (if you generate it later), and store role
      localStorage.setItem('token', 'session'); // placeholder since you use session, not JWT
      localStorage.setItem('role', user.role);

      setIsAuthenticated(true);
      setRole(user.role);

      // Redirect based on role
      if (user.role === 'STUDENT') {
        navigate('/student-home');
      } else if (user.role === 'TEACHER') {
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
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
