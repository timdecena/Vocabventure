import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function TeacherEditClassPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        // Get the specific class by ID directly
        const response = await api.get(`/api/teacher/classes/${id}`);
        setName(response.data.name);
        setDescription(response.data.description);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          alert("You don't have permission to edit this class");
        } else if (err.response?.status === 404) {
          alert("Class not found");
        } else {
          alert("Failed to load class data");
        }
        navigate("/teacher/classes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/api/teacher/classes/${id}`, { name, description });
      navigate("/teacher/classes");
    } catch (err) {
      console.error("Failed to update class:", err);
      setError(err.response?.data?.message || "Failed to update class");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Edit Class</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name: <input value={name} onChange={e => setName(e.target.value)} required />
        </label><br/>
        <label>
          Description: <input value={description} onChange={e => setDescription(e.target.value)} />
        </label><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
