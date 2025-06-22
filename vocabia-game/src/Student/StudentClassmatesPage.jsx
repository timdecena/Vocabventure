import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentClassmatesPage() {
  const { id } = useParams();
  const [classmates, setClassmates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/student/classes/${id}/classmates`);
        setClassmates(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load classmates:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view this class's students");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          setError("Failed to load classmates. Please try again later.");
        }
        setClassmates([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassmates();
  }, [id]);

  return (
    <div>
      <h2>Classmates</h2>
      {loading ? (
        <p>Loading classmates...</p>
      ) : error ? (
        <div>
          <p>Error: {error}</p>
          <Link to={`/student/classes/${id}`}>Back to Class</Link>
        </div>
      ) : classmates.length === 0 ? (
        <div>
          <p>No classmates found in this class.</p>
          <Link to={`/student/classes/${id}`}>Back to Class</Link>
        </div>
      ) : (
        <>
          <ul>
            {classmates.map(s => (
              <li key={s.id}>{s.firstName} {s.lastName} ({s.email})</li>
            ))}
          </ul>
          <Link to={`/student/classes/${id}`}>Back to Class</Link>
        </>
      )}
    </div>
  );
}
