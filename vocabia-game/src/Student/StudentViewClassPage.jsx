import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        // Get all classes for the student and filter by ID
        const response = await api.get(`/api/student/classes`);
        const classData = response.data.find(c => c.id === parseInt(id));
        
        if (classData) {
          setClassroom(classData);
          setError(null);
        } else {
          setError("Class not found or you don't have access to this class");
        }
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view classes");
        } else {
          setError("Failed to load class data: " + (err.response?.data || err.message));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error} <br/><Link to="/student/classes">Back to My Classes</Link></div>;
  if (!classroom) return <div>Class not found <br/><Link to="/student/classes">Back to My Classes</Link></div>;

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
