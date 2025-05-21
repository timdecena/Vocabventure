import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    section: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();  // <-- here

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  // Remove credentials here for registration (since user isn't logged in yet)
  body: JSON.stringify(form)
});


      if (!response.ok) {
        const errMsg = await response.text();
        setError(errMsg || 'Registration failed');
        return;
      }

      // Successful registration - redirect to login
      navigate('/login');  // <-- redirect here
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input name="section" placeholder="Section" value={form.section} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
