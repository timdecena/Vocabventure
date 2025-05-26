import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentClassListPage() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/student/classes")
      .then(res => setClasses(res.data))
      .catch(() => alert("Failed to load classes"));
  }, []);

  return (
    <div>
      <h2>My Classes</h2>
      <button onClick={() => navigate("/student/classes/join")}>Join New Class</button>
      <ul>
        {classes.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> <br />
            {c.description}<br />
            Teacher: {c.teacher?.firstName} {c.teacher?.lastName}
            <br />
            <Link to={`/student/classes/${c.id}`}>View</Link>{" | "}
            <Link to={`/student/classes/${c.id}/classmates`}>Classmates</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
