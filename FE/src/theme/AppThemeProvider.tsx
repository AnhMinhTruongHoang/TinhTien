import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeModeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: "light",
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

interface Props {
  children: ReactNode;
}

const AppThemeProvider = ({ children }: Props) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("theme-mode");

    return savedMode === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";

      localStorage.setItem("theme-mode", next);

      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,

          primary: {
            main: mode === "dark" ? "#90caf9" : "#1976d2",
          },

          background: {
            default: mode === "dark" ? "#0f172a" : "#f5f7fb",

            paper: mode === "dark" ? "#111827" : "#ffffff",
          },
        },

        shape: {
          borderRadius: 10,
        },

        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },

          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider
      value={{
        mode,
        toggleTheme,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppThemeProvider;
