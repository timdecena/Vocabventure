import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function TeacherClassListPage() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // The backend expects requests at /api/teacher/classes based on SecurityConfig
    api.get("/api/teacher/classes")
      .then(res => setClasses(res.data))
      .catch((error) => {
        console.error("Error loading classes:", error);
        alert("Failed to load classes. Please make sure you're logged in as a teacher.");
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      // The backend expects requests at /api/teacher/classes/${id} based on SecurityConfig
      await api.delete(`/api/teacher/classes/${id}`);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class. Please try again later.");
    }
  };

  return (
    <div>
      <h2>My Classes</h2>
      <button onClick={() => navigate("/teacher/classes/create")}>Create Class</button>
      <ul>
        {classes.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> <br />
            {c.description}<br />
            Join Code: <b>{c.joinCode}</b> <button onClick={() => navigator.clipboard.writeText(c.joinCode)}>Copy</button><br />
            <Link to={`/teacher/classes/${c.id}`}>View</Link>{" | "}
            <Link to={`/teacher/classes/${c.id}/edit`}>Edit</Link>{" | "}
            <button onClick={() => handleDelete(c.id)}>Delete</button>{" | "}
            <Link to={`/teacher/classes/${c.id}/students`}>View Students</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
