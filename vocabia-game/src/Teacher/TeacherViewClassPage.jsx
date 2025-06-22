import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function TeacherViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);

  useEffect(() => {
    api.get("/teacher/classes")
      .then(res => {
        const found = res.data.find(c => c.id === Number(id));
        if (found) setClassroom(found);
        else alert("Class not found");
      });
  }, [id]);

  if (!classroom) return <div>Loading...</div>;

  return (
    <div>
      <h2>{classroom.name}</h2>
      <p>{classroom.description}</p>
      <p>Join Code: <b>{classroom.joinCode}</b></p>
      <button onClick={() => navigator.clipboard.writeText(classroom.joinCode)}>Copy Join Code</button>
      <br /><Link to={`/teacher/classes/${id}/students`}>View Students</Link>
      <br /><Link to={`/teacher/classes`}>Back to My Classes</Link>
    </div>
  );
}

