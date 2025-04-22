import React from 'react';

const StudentDashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Profile Summary */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Profile Summary</h2>
          <p>Name: John Doe</p>
          <p>Email: student@example.com</p>
          <p>Role: Student</p>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Enrolled Courses</h2>
          <ul className="list-disc pl-5">
            <li>Math 101</li>
            <li>English Literature</li>
            <li>Introduction to Programming</li>
          </ul>
        </div>

        {/* Announcements */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Announcements</h2>
          <p>🎓 New assignments have been posted!</p>
          <p>🗓️ Next class: April 25, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
