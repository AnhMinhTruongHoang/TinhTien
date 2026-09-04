import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { viVN } from "@mui/x-date-pickers/locales";

import { ToastContainer } from "react-toastify";

import AppThemeProvider from "./theme/AppThemeProvider";

import { AuthProvider } from "./contexts/AuthContext";

import "dayjs/locale/vi";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <AppThemeProvider>
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="vi"
      localeText={
        viVN.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <AuthProvider>
        <App />

        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
          limit={3}
        />
      </AuthProvider>
    </LocalizationProvider>
  </AppThemeProvider>
);
