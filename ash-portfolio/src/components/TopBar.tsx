import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PaletteIcon from "@mui/icons-material/Palette";
import LockIcon from "@mui/icons-material/Lock";

interface TopBarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <AppBar position="static" sx={{ bgcolor: "#1a0033" }}>
      <Toolbar>
        <Button color="inherit" onClick={() => setCurrentPage("about")}>About</Button>
        <Button color="inherit" onClick={() => setCurrentPage("showcase")}>Showcase</Button>
        <Button color="inherit" onClick={() => setCurrentPage("pipeline")}>Pipeline</Button>
        <IconButton color="inherit" sx={{ ml: "auto" }} aria-label="palette">
          <PaletteIcon />
          <LockIcon sx={{ ml: 0.5 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
