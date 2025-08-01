import React, { useState } from "react";
import SimulationProject from "./SimulationProject";
import PathfinderVisualizer from "./pathfinder/PathfinderVisualizer";
import { Box, Button, Paper, Container, Typography } from "@mui/material";

export default function Showcase() {
  const projectKeys = ["simulation", "pathfinder"] as const;
  type ProjectKey = typeof projectKeys[number];
  const [project, setProject] = useState<ProjectKey>("pathfinder");

  const projects: Record<ProjectKey, React.ReactNode> = {
    simulation: <SimulationProject />,
    pathfinder: <PathfinderVisualizer />
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 2, mb: 2, bgcolor: "#1a0033" }}>
        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="h6" sx={{ color: "#ff00cc" }}>Projects</Typography>
          <Button
            variant={project === "simulation" ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setProject("simulation")}
            sx={{ bgcolor: project === "simulation" ? "#ff00cc" : undefined, color: "#00fff7" }}
          >
            Traffic Optimization
          </Button>
          <Button
            variant={project === "pathfinder" ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setProject("pathfinder")}
            sx={{ bgcolor: project === "pathfinder" ? "#ff00cc" : undefined, color: "#00fff7" }}
          >
            Pathfinding Visualizer
          </Button>
        </Box>
      </Paper>
      <Paper elevation={6} sx={{ p: 3, bgcolor: "#222", minHeight: 400 }}>
        {projects[project]}
      </Paper>
    </Container>
  );
}
