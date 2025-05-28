import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MapView.css";

const oceanBg = "https://cdna.artstation.com/p/assets/images/images/061/904/456/large/milan-vasek-worldmap-wip.jpg?1681900161";
const islands = [
  { id: 1, name: "Jungle Lush", img: "https://img.freepik.com/free-vector/empty-background-nature-scenery_1308-34521.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", style: { top: "8%", left: "8%" }, unlocked: true },
  { id: 2, name: "Spelling Shores", img: "https://img.freepik.com/premium-vector/cartoon-illustration-beach-scene-with-palm-trees-beach-scene_937058-206.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", style: { top: "38%", left: "18%" }, unlocked: false },
  { id: 3, name: "Sentence Swamp", img: "https://img.freepik.com/free-vector/mangrove-forest-outdoor-background_1308-129123.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", style: { top: "28%", left: "45%" }, unlocked: false },
  { id: 4, name: "Focus Forest", img: "https://img.freepik.com/free-vector/flat-design-winter-landscape_23-2148707345.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", style: { top: "60%", left: "60%" }, unlocked: false },
  { id: 5, name: "The Shadow Isles", img: "https://img.freepik.com/premium-vector/sunset-erupting-volcano-vector-landscape-illustration_147887-376.jpg?ga=GA1.1.1216205749.1747720148&semt=ais_items_boosted&w=740", style: { top: "38%", left: "80%" }, unlocked: false },
];

const pathCoords = [
  // [fromIndex, toIndex]
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
];

function getIslandCenter(island) {
  // Returns the center coordinates in % for SVG
  // Adjust offsets for image size (assume 120x90 for now)
  const x = parseFloat(island.style.left) + 6; // 6% offset for half width
  const y = parseFloat(island.style.top) + 6; // 6% offset for half height
  return { x, y };
}

export default function MapView() {
  const navigate = useNavigate();
  // SVG lines between islands
  const lines = pathCoords.map(([fromIdx, toIdx], i) => {
    const from = getIslandCenter(islands[fromIdx]);
    const to = getIslandCenter(islands[toIdx]);
    return (
      <line
        key={i}
        x1={`${from.x}%`} y1={`${from.y}%`}
        x2={`${to.x}%`} y2={`${to.y}%`}
        stroke="#222" strokeDasharray="8,8" strokeWidth="3" />
    );
  });

  return (
    <div className="map-bg" style={{ backgroundImage: `url(${oceanBg})` }}>
      <div className="map-heading">VOCABIA</div>
      <div className="map-buttons">
        <button className="map-btn" onClick={() => navigate('/tutorial')}>Replay Tutorial</button>
        <button className="map-btn" onClick={() => navigate('/home')}>Quit to Homepage</button>
      </div>
      <svg className="map-paths">
        {lines}
      </svg>
      {islands.map(island => (
        <React.Fragment key={island.id}>
          <img
            src={island.img}
            alt={island.name}
            className={`island-img${island.unlocked ? "" : " locked"}`}
            title={island.name}
            onClick={island.id === 1 ? () => navigate('/jungle-lush') : undefined}
            style={{ ...island.style, cursor: island.id === 1 ? 'pointer' : 'not-allowed' }}
          />
          <div
            className="island-label"
                style={{
              position: "absolute",
              top: `calc(${island.style.top} + 9%)`,
              left: island.style.left,
              width: 140,
              textAlign: "center",
              color: "#fff",
              fontWeight: 600,
              textShadow: "0 2px 8px #000, 0 0 2px #000",
              zIndex: 3,
              pointerEvents: "none"
                }}
              >
            {island.name}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
} 