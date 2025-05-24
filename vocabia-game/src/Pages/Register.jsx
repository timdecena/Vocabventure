import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Registration successful. Please log in!');
        navigate('/');
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstName" type="text" placeholder="First Name" required value={form.firstName} onChange={handleChange} />
        <input name="lastName" type="text" placeholder="Last Name" required value={form.lastName} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </select>
        <button type="submit">Register</button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
      <div style={{ marginTop: 10 }}>
        Already have an account? <Link to="/">Login here</Link>
      </div>
    </div>
  );
};

export default Register;
