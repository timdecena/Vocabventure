import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function TeacherCreateLevel() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    word: "",
    definition: "",
    isGlobal: true,
    classroomId: ""
  });
  const [images, setImages] = useState({});

  useEffect(() => {
    api.get("/teacher/classes").then((res) => setClasses(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "classroomId" ? value : value,
      isGlobal: name === "classroomId" && value === "" ? true : false
    }));
  };

  const handleImageChange = (e) => {
    setImages(prev => ({
      ...prev,
      [e.target.name]: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("word", form.word);
    data.append("definition", form.definition);
    data.append("isGlobal", form.isGlobal.toString());
    if (!form.isGlobal && form.classroomId) {
      data.append("classroomId", form.classroomId);
    }

    Object.keys(images).forEach((key) => {
      if (images[key]) {
        data.append(key, images[key]);
      }
    });

    try {
      await api.post("/game/4pics1word/create", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Level created!");
      setForm({ word: "", definition: "", isGlobal: true, classroomId: "" });
      setImages({});
    }  catch (err) {
  console.error(err); // for developer logs
  const msg = err.response?.data || "Failed to create level.";
  alert(msg); // shows the backend's detailed 500 message
}

  };

  return (
    <div>
      <h2>Create 4 Pics 1 Word Level</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="word" placeholder="Word" value={form.word} onChange={handleChange} required />
        <input name="definition" placeholder="Definition" value={form.definition} onChange={handleChange} required />
        <label>
          Image 1: <input type="file" name="image1" accept="image/*" onChange={handleImageChange} required />
        </label>
        <label>
          Image 2: <input type="file" name="image2" accept="image/*" onChange={handleImageChange} required />
        </label>
        <label>
          Image 3: <input type="file" name="image3" accept="image/*" onChange={handleImageChange} required />
        </label>
        <label>
          Image 4: <input type="file" name="image4" accept="image/*" onChange={handleImageChange} required />
        </label>
        <label>
          Assign to Class:
          <select name="classroomId" value={form.classroomId} onChange={handleChange}>
            <option value="">Global</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <br />
        <button type="submit">Create Level</button>
      </form>
    </div>
  );
}
