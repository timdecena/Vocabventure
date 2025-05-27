import React, { useEffect, useState } from 'react';
import api from '../api/api';
import CreateWordListForm from '../Teacher/CreateWordListForm';

export default function TeacherArenaManager() {
  const [lists, setLists] = useState([]);

  const fetchLists = () => {
api.get('/teacher/wordlists').then(res => {
  if (Array.isArray(res.data)) {
    setLists(res.data);
  } else {
    console.warn("Expected array but got:", res.data);
    setLists([]); // fallback
  }
});

};

  useEffect(fetchLists, []);

  return (
    <div>
      <h2>Your Word Lists for Arena</h2>
      <CreateWordListForm onCreate={fetchLists} />

      <table>
        <thead>
          <tr><th>Title</th><th>Word Count</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {lists.map(list => (
            <tr key={list.id}>
              <td>{list.title}</td>
              <td>{list.items.length}</td>
              <td>
                <button onClick={() => window.location = `/student/arena/${list.id}/leaderboard`}>
                  View Leaderboard
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
