import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // assumes you use a pre-configured axios instance
import StoryIntro from '../components/StoryIntro';
import '../styles/Adventure.css';

export default function Adventure() {
  const [formData, setFormData] = useState({
    adventurer_name: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStory, setShowStory] = useState(false);
  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await api.get("/auth/profile"); // adjust if different
      return res.data;
    } catch (err) {
      console.error("Error accessing user data:", err);
      setError("User not found. Please login again.");
      return null;
    }
  };

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await getUserData();
        if (!user || !user.id) {
          setError("User not found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await api.get(`/adventure-profile?userId=${user.id}`);
        if (res.data) {
          if (!res.data.tutorialCompleted) {
            navigate('/tutorial');
          } else {
            navigate('/map');
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Error checking profile: ' + (err.response?.data || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await getUserData();
      if (!user || !user.id) {
        setError("User not found.");
        return;
      }

      const res = await api.post("/adventure-profile", {
        adventurer_name: formData.adventurer_name,
        gender: formData.gender,
        user_id: user.id
      });

      if (res.data) {
        setShowStory(true); // play intro before map
      }
    } catch (err) {
      setError('Error creating profile: ' + (err.response?.data || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Return to Login</button>
      </div>
    );
  }

  if (showStory) {
    return <StoryIntro onComplete={() => navigate('/map')} />;
  }

  return (
    <div className="adventure-container">
      <h1>Create Your Adventure Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="adventurer_name">Adventurer Name:</label>
          <input
            type="text"
            id="adventurer_name"
            name="adventurer_name"
            value={formData.adventurer_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit">Start Adventure</button>
      </form>
    </div>
  );
}
