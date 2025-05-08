import React from 'react';

export default function ProgressStats({ label, value }) {
  return (
    <div className="progress-stats">
      <div className="progress-stats-icon" />
      <div>
        <strong>{value}</strong> <span>{label}</span>
      </div>
    </div>
  );
}
