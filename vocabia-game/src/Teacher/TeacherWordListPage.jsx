import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TeacherWordListPage() {
  const { classId } = useParams();
  const classroomId = Number(classId);

  const [name, setName] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([
    { word: "", definition: "", imageUrl: "", dayNumber: 1 },
  ]);
  const [loading, setLoading] = useState(false);

  const addItem = () =>
    setItems([...items, { word: "", definition: "", imageUrl: "", dayNumber: 1 }]);

  const updateItem = (idx, key, value) => {
    const newItems = [...items];
    newItems[idx][key] = value;
    setItems(newItems);
  };

  const removeItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("classroomId (route param):", classroomId);

    if (!classroomId || isNaN(classroomId)) {
      alert("No classroom selected! Cannot create word list.");
      setLoading(false);
      return;
    }

    const wordList = {
      name,
      weekNumber: weekNumber === "" ? null : Number(weekNumber),
      description,
      classroom: { id: classroomId },
      items: items.map((item) => ({
        ...item,
        dayNumber: item.dayNumber === "" ? null : Number(item.dayNumber),
      })),
    };

    console.log("Submitting wordList payload:", wordList);

    try {
      await axios.post("http://localhost:8080/api/wordlist/create", wordList, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Word List created!");
      setName("");
      setWeekNumber("");
      setDescription("");
      setItems([{ word: "", definition: "", imageUrl: "", dayNumber: 1 }]);
    } catch (err) {
      alert("Failed to create word list.");
      console.error("Axios error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Custom Word List</h3>
      <input
        placeholder="List Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        placeholder="Week Number"
        type="number"
        min={1}
        max={53}
        value={weekNumber}
        onChange={(e) => setWeekNumber(e.target.value)}
        required
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Word</th>
            <th>Definition</th>
            <th>Day (1-7)</th>
            <th>Image URL (optional)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>
                <input
                  value={item.word}
                  onChange={(e) => updateItem(idx, "word", e.target.value)}
                  required
                />
              </td>
              <td>
                <input
                  value={item.definition}
                  onChange={(e) => updateItem(idx, "definition", e.target.value)}
                  required
                />
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={item.dayNumber}
                  onChange={(e) => updateItem(idx, "dayNumber", e.target.value)}
                  required
                />
              </td>
              <td>
                <input
                  value={item.imageUrl}
                  onChange={(e) => updateItem(idx, "imageUrl", e.target.value)}
                />
              </td>
              <td>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}>
                    X
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addItem} disabled={loading}>
        + Add Word
      </button>
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Word List"}
      </button>
    </form>
  );
}
