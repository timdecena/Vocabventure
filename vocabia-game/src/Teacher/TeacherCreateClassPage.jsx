import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function TeacherCreateClassPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/teacher/classes", { name, description });
      navigate("/teacher/classes");
    } catch (err) {
      console.error("Failed to create class:", err);
      alert("Failed to create class: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>Create New Class</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name: <input value={name} onChange={e => setName(e.target.value)} required />
        </label><br/>
        <label>
          Description: <input value={description} onChange={e => setDescription(e.target.value)} />
        </label><br/>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
