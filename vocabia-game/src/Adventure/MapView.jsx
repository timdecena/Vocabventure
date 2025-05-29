import React from "react";
import { useNavigate } from "react-router-dom";

export default function MapView() {
  const navigate = useNavigate();

  const levels = [
    { id: 1, label: "Level 1", top: "30%", left: "10%" },
    { id: 2, label: "Level 2", top: "50%", left: "30%" },
    { id: 3, label: "Level 3", top: "40%", left: "60%" },
  ];

  const handleLevelClick = (levelId) => {
    navigate(`/student/adventure/level/${levelId}`);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "600px", backgroundImage: "url('https://i.ibb.co/k37x8Kq/jungle-map.jpg')", backgroundSize: "cover", borderRadius: "12px" }}>
      {levels.map((level) => (
        <button
          key={level.id}
          onClick={() => handleLevelClick(level.id)}
          style={{
            position: "absolute",
            top: level.top,
            left: level.left,
            transform: "translate(-50%, -50%)",
            padding: "10px 15px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0px 0px 10px #000",
          }}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
