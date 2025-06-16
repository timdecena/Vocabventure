import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);

  useEffect(() => {
    // Remove duplicate '/api' prefix since it's already in the baseURL
    api.get("/student/classes")
      .then(res => {
        const found = res.data.find(c => c.id === Number(id));
        if (found) setClassroom(found);
        else alert("Class not found");
      })
      .catch(err => {
        console.error("Error fetching student classes:", err);
        alert("Failed to load classes. Please make sure you're logged in as a student.");
      });
  }, [id]);

  if (!classroom) return <div>Loading...</div>;

  return (
    <div>
      <h2>{classroom.name}</h2>
      <p>{classroom.description}</p>
      <p>Teacher: {classroom.teacher?.firstName} {classroom.teacher?.lastName}</p>
      <br />
      <Link to={`/student/classes/${id}/classmates`}>View Classmates</Link>
      <br />
      <Link to={`/student/classes/${id}/4pic1word`}>Play 4 Pics 1 Word Game</Link>
      <br />
      <Link to={`/student/classes`}>Back to My Classes</Link>
    </div>
  );
}
