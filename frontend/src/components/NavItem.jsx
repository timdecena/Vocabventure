import React from 'react';
import { Link } from 'react-router-dom';

export default function NavItem({ label, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="nav-item">
        <div className="nav-icon" />
        <span>{label}</span>
      </div>
    </Link>
  );
}
