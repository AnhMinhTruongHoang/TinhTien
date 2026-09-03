import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { viVN } from "@mui/x-date-pickers/locales";
import "dayjs/locale/vi";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="vi"
      localeText={
        viVN.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <App />
    </LocalizationProvider>
  </StrictMode>
);
