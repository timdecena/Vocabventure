import React, { useEffect, useState } from "react";
import api from "../api/api"; // ensure this is correct
import { Box } from "@mui/material";

export default function StudentWOTDCard() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");

  useEffect(() => {
    api.get("/game/word-of-the-day")
      .then(res => {
        setWord(res.data.word); // assuming `word` is included in backend response
        setDefinition(res.data.definition);
      })
      .catch(() => {
        setWord("N/A");
        setDefinition("Failed to load word of the day.");
      });
  }, []);

  return (
    <Box className="arcade-middle-card">
      <div className="arcade-middle-card-title">Word of the Day</div>
      <div className="arcade-wotd-word">{word}</div>
      <div className="arcade-wotd-definition">"{definition}"</div>
    </Box>
  );
}
