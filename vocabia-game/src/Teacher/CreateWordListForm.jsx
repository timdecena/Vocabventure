import React, { useState } from 'react';
import api from '../api/api';

export default function CreateWordListForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([{ word: '', definition: '' }]);

  const addItem = () => setItems([...items, { word: '', definition: '' }]);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/teacher/wordlists/create', { title, items });
    onCreate(); // refresh list after creation
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create New Word List</h3>
      <input
        type="text"
        placeholder="List Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      {items.map((item, i) => (
        <div key={i}>
          <input
            placeholder="Word"
            value={item.word}
            onChange={(e) => handleChange(i, 'word', e.target.value)}
            required
          />
          <input
            placeholder="Definition"
            value={item.definition}
            onChange={(e) => handleChange(i, 'definition', e.target.value)}
            required
          />
        </div>
      ))}
      <button type="button" onClick={addItem}>+ Add Word</button>
      <button type="submit">Save List</button>
    </form>
  );
}
