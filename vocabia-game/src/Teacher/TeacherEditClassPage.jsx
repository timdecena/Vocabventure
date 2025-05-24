import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function TeacherEditClassPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/teacher/classes")
      .then(res => {
        const found = res.data.find(c => c.id === Number(id));
        if (found) {
          setName(found.name);
          setDescription(found.description);
        } else {
          alert("Class not found"); navigate("/teacher/classes");
        }
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/teacher/classes/${id}`, { name, description });
    navigate("/teacher/classes");
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
