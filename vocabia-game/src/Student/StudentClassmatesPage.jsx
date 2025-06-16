import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentClassmatesPage() {
  const { id } = useParams();
  const [classmates, setClassmates] = useState([]);

  useEffect(() => {
    api.get(`/student/classes/${id}/classmates`)
      .then(res => setClassmates(res.data))
      .catch(() => alert("Failed to load classmates"));
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
