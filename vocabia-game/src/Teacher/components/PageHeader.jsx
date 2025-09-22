import React from "react";
import { Box, Typography, Button, Breadcrumbs, Link as MUILink, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Back",
  breadcrumbs = [],
  actions = null,
  gap = 1
}) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {(breadcrumbs && breadcrumbs.length > 0) || backTo ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Breadcrumbs aria-label="breadcrumbs">
            {backTo && (
              <MUILink
                component={Link}
                to={backTo}
                underline="hover"
                sx={{ display: "flex", alignItems: "center" }}
                color="inherit"
              >
                <ArrowBackIcon fontSize="small" style={{ marginRight: 6 }} />
                {backLabel}
              </MUILink>
            )}
            {breadcrumbs.map((bc, idx) => (
              <MUILink
                key={idx}
                component={bc.to ? Link : "span"}
                to={bc.to}
                underline={bc.to ? "hover" : "none"}
                color={idx === breadcrumbs.length - 1 ? "text.primary" : "inherit"}
                sx={{ cursor: bc.to ? "pointer" : "default" }}
              >
                {bc.label}
              </MUILink>
            ))}
          </Breadcrumbs>
          {actions}
        </Box>
      ) : (
        actions && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            {actions}
          </Box>
        )
      )}

      <Stack spacing={gap}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
