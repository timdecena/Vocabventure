// pages/UpdateProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";

const UpdateProfile = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/auth/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setForm((prev) => ({
          ...prev,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        }));
      })
      .catch(() => setErrorMsg("Failed to load profile"));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await axios.put("http://localhost:8080/api/auth/update", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccessMsg("Profile updated successfully!");
      setForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
    } catch (err) {
      setErrorMsg(err.response?.data || "Failed to update profile");
    }
  };

  return (
    <Box
      maxWidth="400px"
      margin="80px auto"
      padding="24px"
      borderRadius="12px"
      boxShadow="0 0 16px #00eaff80"
      bgcolor="#1e1e24"
      color="#fff"
    >
      <Typography variant="h5" gutterBottom style={{ textAlign: "center", fontFamily: "'Press Start 2P', cursive" }}>
        Update Profile
      </Typography>

      <TextField
        label="First Name"
        name="firstName"
        fullWidth
        margin="normal"
        value={form.firstName}
        onChange={handleChange}
        InputProps={{ style: { color: "#fff" } }}
        InputLabelProps={{ style: { color: "#aaa" } }}
      />
      <TextField
        label="Last Name"
        name="lastName"
        fullWidth
        margin="normal"
        value={form.lastName}
        onChange={handleChange}
        InputProps={{ style: { color: "#fff" } }}
        InputLabelProps={{ style: { color: "#aaa" } }}
      />
      <TextField
        label="Old Password"
        name="oldPassword"
        type="password"
        fullWidth
        margin="normal"
        value={form.oldPassword}
        onChange={handleChange}
        InputProps={{ style: { color: "#fff" } }}
        InputLabelProps={{ style: { color: "#aaa" } }}
      />
      <TextField
        label="New Password"
        name="newPassword"
        type="password"
        fullWidth
        margin="normal"
        value={form.newPassword}
        onChange={handleChange}
        InputProps={{ style: { color: "#fff" } }}
        InputLabelProps={{ style: { color: "#aaa" } }}
      />

      {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mt: 2 }}>{successMsg}</Alert>}

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, backgroundColor: "#00eaff", color: "#000", fontWeight: "bold" }}
        onClick={handleSubmit}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default UpdateProfile;
