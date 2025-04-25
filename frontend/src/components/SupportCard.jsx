import React from 'react';
import { Link } from 'react-router-dom';

export default function SupportCard() {
  return (
    <Link to="/support" className="support-card" style={{ textDecoration: 'none' }}>
      <h4>Support Us</h4>
    </Link>
  );
}