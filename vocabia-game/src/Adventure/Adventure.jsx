import React from "react";
import MapView from "./MapView";

export default function Adventure() {
  return (
    <div style={{ padding: "2rem", backgroundColor: "#0a0a23", minHeight: "100vh", color: "white" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.5rem" }}>🌴 Jungle Adventure Mode 🌴</h1>
      <MapView />
    </div>
  );
}
