import { IconButton, Tooltip } from "@mui/material";

import { DarkMode, LightMode } from "@mui/icons-material";

import { useThemeMode } from "../theme/AppThemeProvider";

const ThemeToggleButton = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === "dark" ? "Chế độ sáng" : "Chế độ tối"}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === "dark" ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
