import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameModeCard.css';

export default function GameModeCard({
  title,
  description,
  image,
  to
}) {
  const Inner = (
    <div className="game-mode-card" style={{ backgroundImage: `url(${image})` }}>
      <div className="game-mode-title-bar">
        {title}
      </div>
      <div className="game-mode-description">
        {description}
      </div>
    </div>
  );

  // wrap in <Link> only if `to` is provided
  return to
    ? <Link to={to} className="game-mode-link">{Inner}</Link>
    : Inner;
}
