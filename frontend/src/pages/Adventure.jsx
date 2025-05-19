import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StoryIntro from '../components/StoryIntro';
import '../styles/Adventure.css';

const API_BASE_URL = 'http://localhost:8081';

export default function Adventure() {
  const [formData, setFormData] = useState({
    adventurer_name: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStory, setShowStory] = useState(false);
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user data found');
      }
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Error accessing user data:', err);
      setError('Unable to access user data. Please try logging in again.');
      return null;
    }
  };

  useEffect(() => {
    // Check if user has an existing profile
    const checkProfile = async () => {
      try {
        const user = getUserData();
        if (!user || !user.id) {
          setError('User not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/adventure-profile?userId=${user.id}`, {
          withCredentials: true
        });
        
        if (response.data) {
          navigate('/map');
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Error checking profile status: ' + (err.response?.data || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = getUserData();
      if (!user || !user.id) {
        setError('User not found. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/adventure-profile`,
        {
          adventurer_name: formData.adventurer_name,
          gender: formData.gender,
          user_id: user.id
        },
        {
          withCredentials: true
        }
      );

      if (response.data) {
        setShowStory(true);
      }
    } catch (err) {
      setError('Error creating profile: ' + (err.response?.data || err.message));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Return to Login</button>
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
