import React from 'react';
import '../styles/Homepage.css';
import Sidebar      from '../components/Sidebar';
import TopBar       from '../components/TopBar';
import MainContent  from '../components/MainContent';
import RightSidebar from '../components/RightSidebar';
import Navbar from '../components/Navbar';

export default function Homepage() {
  return (
    <>
    <Navbar />
    <div className="container">
      <Sidebar />
      <main className="main">
        <TopBar />
        <div className="content-card">
          <MainContent />
        </div>
      </main>
      <RightSidebar />
    </div>
    </>
  );
}
