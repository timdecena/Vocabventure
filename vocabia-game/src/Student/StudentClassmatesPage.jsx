import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentClassmatesPage() {
  const { id } = useParams();
  const [classmates, setClassmates] = useState([]);

  useEffect(() => {
    // The backend expects requests at /api/student/classes/${id}/classmates based on SecurityConfig
    api.get(`/api/student/classes/${id}/classmates`)
      .then(res => setClassmates(res.data))
      .catch(err => {
        console.error("Error fetching classmates:", err);
        alert("Failed to load classmates. Please make sure you're logged in as a student.");
      });
  }, [id]);

  return (
    <div>
      <h2>Classmates</h2>
      <ul>
        {classmates.map(s => (
          <li key={s.id}>{s.firstName} {s.lastName} ({s.email})</li>
        ))}
      </ul>
      <Link to={`/student/classes/${id}`}>Back to Class</Link>
    </div>
  );
}
