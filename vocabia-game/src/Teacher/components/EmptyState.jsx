import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function EmptyState({
  icon = null,
  title = "Nothing here yet",
  description = "",
  action = null,
  elevation = 0,
  minHeight = 220,
}) {
  return (
    <Paper elevation={elevation} sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, minHeight }}>
        {icon && <Box sx={{ color: "text.disabled", mb: 1 }}>{icon}</Box>}
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 520 }}>
            {description}
          </Typography>
        )}
        {action}
      </Box>
    </Paper>
  );
}
