import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function TeacherViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        // Get the specific class by ID directly
        const response = await api.get(`/api/teacher/classes/${id}`);
        setClassroom(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view this class");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          setError("Failed to load class data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error} <br/><Link to="/teacher/classes">Back to My Classes</Link></div>;
  if (!classroom) return <div>Class not found <br/><Link to="/teacher/classes">Back to My Classes</Link></div>;

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

