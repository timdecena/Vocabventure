import React from "react";
import "./MapView.css";

const islands = [
  { id: 1, name: "Jungle", style: { top: "10%", left: "10%" }, unlocked: true },
  { id: 2, name: "Volcano", style: { top: "10%", right: "10%" }, unlocked: false },
  { id: 3, name: "Forest", style: { top: "40%", left: "30%" }, unlocked: false },
  { id: 4, name: "Mountain", style: { top: "40%", right: "30%" }, unlocked: false },
  { id: 5, name: "Snow", style: { bottom: "10%", left: "10%" }, unlocked: false },
  { id: 6, name: "Desert", style: { bottom: "10%", right: "10%" }, unlocked: false },
];

export default function MapView() {
  const handleIslandClick = (island) => {
    if (island.unlocked) {
      // Navigate to island
      alert(`Navigating to ${island.name} Island!`);
    }
  };

  return (
    <div className="map-view">
      {islands.map((island) => (
        <div
          key={island.id}
          className={`island island-${island.name.toLowerCase()}${island.unlocked ? "" : " locked"}`}
          style={island.style}
          onClick={() => handleIslandClick(island)}
        >
          {island.name}
          {!island.unlocked && <span className="lock-icon">🔒</span>}
          {!island.unlocked && <span className="tooltip">Complete previous islands to unlock!</span>}
        </div>
      ))}
    </div>
  );
} 