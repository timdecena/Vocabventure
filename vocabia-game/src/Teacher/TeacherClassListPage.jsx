import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function TeacherClassListPage() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/teacher/classes")
      .then(res => setClasses(res.data))
      .catch(() => alert("Failed to load classes"));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    await api.delete(`/teacher/classes/${id}`);
    setClasses(prev => prev.filter(c => c.id !== id));
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
