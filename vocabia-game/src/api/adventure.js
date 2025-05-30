import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/adventure';

export const submitLevelProgress = async (data) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/submit`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};

export const getLevelData = async (levelId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/level/${levelId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};
