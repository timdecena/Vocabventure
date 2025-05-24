import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setIsAuthenticated, setRole }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setIsAuthenticated(true);
        setRole(data.role);
        if (data.role === 'STUDENT') navigate('/student-home');
        else if (data.role === 'TEACHER') navigate('/teacher-home');
      } else {
        setError(typeof data === 'string' ? data : (data.message || 'Login failed'));
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "5px", backgroundColor: "white" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          required 
          value={form.email} 
          onChange={handleChange} 
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          required 
          value={form.password} 
          onChange={handleChange} 
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button 
          type="submit" 
          style={{ padding: "10px", backgroundColor: "#4285f4", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Login
        </button>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        Don&apos;t have an account? <Link to="/register" style={{ color: "#4285f4", textDecoration: "none" }}>Register here</Link>
      </div>
    </div>
  );
};

export default Login;
