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
    <div style={{ padding: "20px" }}>
      <h2>Enrolled Students</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Class</th>
            <th>Correct Answers</th>
            <th>Progress Points</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.firstName} {s.lastName}</td>
              <td>{s.email}</td>
              <td>{s.className ?? "N/A"}</td> {/* ✅ Class Name Display */}
              <td>{s.correctAnswers ?? 0}</td>
              <td>{s.progressPoints ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to={`/teacher/classes/${id}`} style={{ display: "block", marginTop: "20px" }}>
        Back to Class
      </Link>
    </div>
  );
}
