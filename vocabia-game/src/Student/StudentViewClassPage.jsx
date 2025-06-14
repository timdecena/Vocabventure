import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function StudentViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);

  useEffect(() => {
    console.log("🔍 StudentViewClassPage: Fetching classes for student");
    console.log("🔑 JWT Token:", localStorage.getItem("token"));
    
    // First, check if we have a valid token
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No authentication token found");
      alert("You are not logged in. Please log in first.");
      return;
    }
    
    // The backend expects requests at /api/student/classes based on SecurityConfig
    console.log("📡 Making API request to: /api/student/classes");
    
    api.get("/api/student/classes")
      .then(res => {
        console.log("✅ API Response received:", res);
        const found = res.data.find(c => c.id === Number(id));
        if (found) {
          console.log("🏫 Class found:", found);
          setClassroom(found);
        } else {
          console.error("❌ Class not found in response data");
          alert("Class not found");
        }
      })
      .catch(err => {
        console.error("❌ Error fetching student classes:", err);
        
        // Log detailed error information
        if (err.response) {
          console.error("📄 Response error data:", err.response.data);
          console.error("🔢 Response status:", err.response.status);
          console.error("📋 Response headers:", err.response.headers);
          
          // Server responded with an error
          if (err.response.status === 403) {
            alert("You don't have permission to access this resource. Please log in again as a student.");
          } else if (err.response.status === 401) {
            alert("Your session has expired. Please log in again.");
          } else {
            alert(`Error: ${err.response.data || "Failed to load classes"}`);
          }
        } else if (err.request) {
          // Request was made but no response received
          console.error("📡 Request was made but no response received");
          console.error("📡 Request details:", err.request);
          alert("No response from server. Please check your connection and ensure the backend is running.");
        } else {
          // Something happened in setting up the request
          console.error("⚙️ Error setting up request:", err.message);
          alert("Failed to load classes. Please try again later.");
        }
      });
  }, [id]);

  if (!classroom) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">{classroom.name}</h2>
        </div>
        <div className="card-body">
          <p className="card-text">{classroom.description}</p>
          <p className="card-text"><strong>Teacher:</strong> {classroom.teacher?.firstName} {classroom.teacher?.lastName}</p>
          
          <div className="d-grid gap-3 mt-4">
            <Link to={`/student/classes/${id}/classmates`} className="btn btn-outline-primary">
              <i className="fas fa-users me-2"></i> View Classmates
            </Link>
            
            <Link to={`/student/classes/${id}/fpow`} className="btn btn-success">
              <i className="fas fa-gamepad me-2"></i> Play Four Pics One Word Game
            </Link>
            
            <Link to={`/student/classes/${id}/spelling-levels`} className="btn btn-info text-white">
              <i className="fas fa-spell-check me-2"></i> Spelling Challenge
            </Link>
            
            <Link to={`/student/classes`} className="btn btn-secondary">
              <i className="fas fa-arrow-left me-2"></i> Back to My Classes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
