import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function TeacherClassStudentsPage() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get(`/teacher/classes/${id}/students`)
      .then(res => setStudents(res.data))
      .catch(() => alert("Failed to load students"));
  }, [id]);

  return (
    <div>
      <h2>Enrolled Students</h2>
      <ul>
        {students.map(s => (
          <li key={s.id}>{s.firstName} {s.lastName} ({s.email})</li>
        ))}
      </ul>
      <Link to={`/teacher/classes/${id}`}>Back to Class</Link>
    </div>
  );
}
